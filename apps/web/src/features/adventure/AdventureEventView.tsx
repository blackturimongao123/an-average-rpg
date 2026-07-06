import { useMemo, useState } from "react";
import type {
  AdventureEventStep,
  Heir,
  MissionCampaignChoice,
  MissionEventType,
  MissionRewards,
} from "@bloodline/shared/types";
import { getChoiceCardTone, getDefaultSceneGradient } from "@bloodline/shared/adventure";
import { ClassIcon } from "@/lib/classIcons";
import { ItemIcon } from "@/components/game/ItemIcon";
import { getItemById } from "@/lib/items";
import {
  Backpack,
  ChevronRight,
  Coins,
  Compass,
  Flame,
  Heart,
  Map,
  Package,
  Scroll,
  Shield,
  Skull,
  Sparkles,
  Swords,
  Tent,
  Users,
} from "lucide-react";
import "./AdventureEvent.css";

import classesData from "@game-data/classes.json";

const classes = classesData.classes as Array<{ id: string; name: string }>;

function getClassName(classId: string): string {
  return classes.find((entry) => entry.id === classId)?.name ?? classId;
}

function getResourceLabel(classId: string): string {
  if (classId === "mage" || classId === "priest") return "Mana";
  if (classId === "rogue" || classId === "ranger") return "Stamina";
  return "Energy";
}

function estimateMaxHp(heir: Heir): number {
  return 50 + heir.stats.constitution * 10 + heir.level * 5;
}

function estimateResource(heir: Heir): number {
  if (heir.classId === "mage" || heir.classId === "priest") {
    return 40 + heir.stats.intelligence * 4 + heir.stats.faith * 2;
  }
  if (heir.classId === "rogue" || heir.classId === "ranger") {
    return 40 + heir.stats.dexterity * 4;
  }
  return 40 + heir.stats.strength * 3 + heir.stats.constitution * 2;
}

function eventIcon(eventType?: MissionEventType) {
  switch (eventType) {
    case "combat":
      return Swords;
    case "rest":
      return Tent;
    case "social":
      return Users;
    case "hazard":
      return Skull;
    default:
      return Sparkles;
  }
}

function choiceIcon(choiceId: string) {
  if (choiceId.includes("camp") || choiceId.includes("rest")) return Tent;
  if (choiceId.includes("combat") || choiceId.includes("engage") || choiceId.includes("ambush")) {
    return Swords;
  }
  if (choiceId.includes("explore") || choiceId.includes("scout")) return Compass;
  if (choiceId.includes("persuade") || choiceId.includes("bribe")) return Scroll;
  return ChevronRight;
}

export interface AdventureJourneyNode {
  eventType?: MissionEventType;
  label?: string;
}

export interface AdventureEventViewProps {
  heir: Heir;
  eventTitle: string;
  regionLabel: string;
  progressLabel: string;
  step: AdventureEventStep;
  choices: MissionCampaignChoice[];
  loading: boolean;
  onChoose: (choice: MissionCampaignChoice) => void;
  onAbandon?: () => void;
  onLeave?: () => void;
  supplies?: { current: number; max: number };
  morale?: number;
  hpPercent?: number;
  showRunResources?: boolean;
  eventLog?: Array<{ text: string; timestampMs: number }>;
  journeyNodes?: AdventureJourneyNode[];
  journeyCurrent?: number;
  possibleRewards?: MissionRewards | null;
  eventTypeLabel?: string;
  difficultyLabel?: string;
  footerHint?: string;
}

export function AdventureEventView({
  heir,
  eventTitle,
  regionLabel,
  progressLabel,
  step,
  choices,
  loading,
  onChoose,
  onAbandon,
  onLeave,
  supplies,
  morale,
  hpPercent = 100,
  showRunResources = false,
  eventLog = [],
  journeyNodes = [],
  journeyCurrent = 0,
  possibleRewards,
  eventTypeLabel,
  difficultyLabel,
  footerHint,
}: AdventureEventViewProps) {
  const [hoveredChoiceId, setHoveredChoiceId] = useState<string | null>(null);

  const maxHp = estimateMaxHp(heir);
  const currentHp = Math.round((hpPercent / 100) * maxHp);
  const maxResource = estimateResource(heir);
  const resourcePct = Math.min(100, 55 + heir.level * 4);

  const eventType = step.eventType ?? "discovery";
  const sceneGradient = step.sceneGradient ?? getDefaultSceneGradient(eventType);
  const sceneStyle = useMemo(() => {
    if (step.sceneImage) {
      return {
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%), url("${step.sceneImage}")`,
        backgroundSize: "cover",
        backgroundPosition: "center 40%",
      };
    }
    return { background: sceneGradient };
  }, [step.sceneImage, sceneGradient]);

  const inventoryPreview = heir.inventory.slice(0, 10);

  const handleChoice = (choice: MissionCampaignChoice) => {
    if (loading) return;
    const supplyBlocked =
      showRunResources &&
      supplies &&
      choice.supplyCost !== undefined &&
      supplies.current < choice.supplyCost;
    if (supplyBlocked) return;
    onChoose(choice);
  };

  return (
    <div className="adventure-shell animate-fade-in">
      <header className="adventure-topbar">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="adventure-resource">
            <Coins className="w-4 h-4 text-[var(--adventure-gold)]" />
            <span>
              Gold <strong>{heir.gold.toLocaleString()}</strong>
            </span>
          </div>
          {showRunResources && supplies && (
            <div className="adventure-resource">
              <Package className="w-4 h-4 text-[var(--adventure-gold)]" />
              <span>
                Supplies <strong>{supplies.current}/{supplies.max}</strong>
              </span>
            </div>
          )}
          {showRunResources && morale !== undefined && (
            <div className="adventure-resource">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>
                Morale <strong>{morale}%</strong>
              </span>
            </div>
          )}
        </div>

        <div className="hidden md:flex flex-col items-center gap-1 min-w-[240px]">
          <p className="text-[0.65rem] uppercase tracking-[0.14em] text-[var(--adventure-gold)]">
            {progressLabel} — {regionLabel}
          </p>
          {journeyNodes.length > 0 && (
            <div className="adventure-floor-track">
              {journeyNodes.map((_, idx) => (
                <div key={idx} className="flex items-center gap-0.5">
                  <div
                    className={`adventure-floor-node ${
                      idx < journeyCurrent ? "done" : idx === journeyCurrent ? "active" : ""
                    }`}
                  >
                    {idx + 1}
                  </div>
                  {idx < journeyNodes.length - 1 && <div className="adventure-floor-line" />}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-right text-xs text-white/50">
          {(onAbandon || onLeave) && (
            <button
              type="button"
              onClick={onAbandon ?? onLeave}
              className="text-red-400/80 hover:text-red-300"
              disabled={loading}
            >
              {onAbandon ? "Abandon" : "Leave"}
            </button>
          )}
        </div>
      </header>

      <div className="adventure-body">
        <aside className="adventure-panel">
          <p className="adventure-panel-title">Party</p>
          <div className="adventure-party-card">
            <ClassIcon classId={heir.classId} subclassId={heir.subclassId} size={44} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-sm truncate">{heir.name}</p>
                <span className="text-[0.65rem] text-white/50">Lv.{heir.level}</span>
              </div>
              <p className="text-xs text-white/55 mb-2">{getClassName(heir.classId)}</p>
              <div className="space-y-1.5">
                <div>
                  <div className="flex justify-between text-[0.65rem] text-white/50 mb-0.5">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" /> HP
                    </span>
                    <span>
                      {currentHp}/{maxHp}
                    </span>
                  </div>
                  <div className="adventure-bar hp">
                    <span style={{ width: `${hpPercent}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[0.65rem] text-white/50 mb-0.5">
                    <span>{getResourceLabel(heir.classId)}</span>
                    <span>{Math.round((resourcePct / 100) * maxResource)}/{maxResource}</span>
                  </div>
                  <div className="adventure-bar resource">
                    <span style={{ width: `${resourcePct}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="text-[0.7rem] text-white/45 leading-relaxed">
            Solo expedition — party co-op coming later.
          </p>
        </aside>

        <main className="adventure-center">
          <div className="adventure-scene" style={sceneStyle}>
            <div className="adventure-scene-overlay" />
          </div>

          <div className="adventure-parchment">
            <h2 className="adventure-event-title">{eventTitle}</h2>
            <p className="adventure-event-text">{step.text}</p>
          </div>

          <div className="adventure-choices">
            {choices.map((choice) => {
              const Icon = choiceIcon(choice.id);
              const tone = getChoiceCardTone(choice.id);
              const blocked =
                showRunResources &&
                supplies &&
                choice.supplyCost !== undefined &&
                supplies.current < choice.supplyCost;

              return (
                <button
                  key={choice.id}
                  type="button"
                  className={`adventure-choice tone-${tone} ${
                    hoveredChoiceId === choice.id ? "is-hovered" : ""
                  }`}
                  disabled={loading || blocked}
                  onMouseEnter={() => setHoveredChoiceId(choice.id)}
                  onMouseLeave={() => setHoveredChoiceId(null)}
                  onClick={() => handleChoice(choice)}
                >
                  <div className="adventure-choice-icon">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="adventure-choice-label">{choice.label}</p>
                    <p className="adventure-choice-sub">{choice.subtitle}</p>
                    {choice.tags && choice.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {choice.tags.map((tag) => (
                          <span key={tag.label} className={`adventure-tag ${tag.tone}`}>
                            {tag.label}
                          </span>
                        ))}
                      </div>
                    )}
                    {blocked && (
                      <p className="text-xs text-red-400 mt-1">Not enough supplies</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {loading && (
            <p className="text-sm text-white/50 mt-4 text-center">Resolving choice...</p>
          )}
          {!loading && choices.length > 0 && (
            <p className="text-xs text-white/40 mt-3 text-center">
              Hover over options to see potential outcomes
            </p>
          )}
        </main>

        <aside className="adventure-panel">
          <p className="adventure-panel-title">Event Info</p>
          <div className="adventure-meta-row">
            <span className="adventure-meta-pill capitalize">
              {eventTypeLabel ?? eventType}
            </span>
            {difficultyLabel && (
              <span className="adventure-meta-pill">{difficultyLabel}</span>
            )}
            <span className="adventure-meta-pill capitalize">
              Time: {step.timeCost ?? "normal"}
            </span>
          </div>

          {possibleRewards && (
            <>
              <p className="adventure-panel-title mt-4">Possible Rewards</p>
              <div className="adventure-reward-preview mb-4">
                {possibleRewards.gold > 0 && (
                  <div className="adventure-reward-chip" title={`${possibleRewards.gold} gold`}>
                    <Coins className="w-3.5 h-3.5 text-[var(--adventure-gold)]" />
                  </div>
                )}
                {possibleRewards.xp > 0 && (
                  <div className="adventure-reward-chip" title={`${possibleRewards.xp} XP`}>
                    <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                  </div>
                )}
                {possibleRewards.items.map((itemId) => {
                  const item = getItemById(itemId);
                  return (
                    <div key={itemId} className="adventure-reward-chip" title={item?.name ?? itemId}>
                      {item ? <ItemIcon item={item} size={16} /> : <Backpack className="w-3.5 h-3.5" />}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <p className="adventure-panel-title">Inventory</p>
          <p className="text-[0.7rem] text-white/45 mb-2">{heir.inventory.length} / 30 items</p>
          <div className="adventure-inventory-grid mb-4">
            {Array.from({ length: 10 }).map((_, idx) => {
              const itemId = inventoryPreview[idx];
              const item = itemId ? getItemById(itemId) : null;
              return (
                <div key={idx} className="adventure-inv-slot">
                  {item ? <ItemIcon item={item} size={18} /> : null}
                </div>
              );
            })}
          </div>

          {eventLog.length > 0 && (
            <>
              <p className="adventure-panel-title">Event Log</p>
              <div className="max-h-36 overflow-y-auto scrollbar-thin">
                {[...eventLog].reverse().map((entry, idx) => (
                  <p key={`${entry.timestampMs}-${idx}`} className="adventure-log-item">
                    {entry.text}
                  </p>
                ))}
              </div>
            </>
          )}
        </aside>
      </div>

      <footer className="adventure-journey">
        <button type="button" className="text-xs text-white/50 flex items-center gap-1.5" disabled>
          <Map className="w-3.5 h-3.5" />
          Journey Map
        </button>

        <div className="adventure-journey-nodes">
          {journeyNodes.map((node, idx) => {
            const Icon = eventIcon(node.eventType);
            return (
              <div
                key={idx}
                className={`adventure-journey-node ${
                  idx < journeyCurrent ? "done" : idx === journeyCurrent ? "current" : ""
                }`}
                title={node.label ?? `Stage ${idx + 1}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
            );
          })}
        </div>

        <div className="text-xs text-white/45 flex items-center gap-2">
          <Shield className="w-3.5 h-3.5" />
          {footerHint ?? "Choose an action to continue"}
        </div>
      </footer>
    </div>
  );
}
