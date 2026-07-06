import { useMemo, useState } from "react";
import type {
  ActiveMission,
  CampaignRunState,
  Heir,
  MissionCampaignChoice,
  MissionTemplate,
} from "@bloodline/shared/types";
import {
  applyChoiceToCampaignState,
  getDefaultSceneGradient,
  getStepChoices,
  getStepTitle,
} from "@bloodline/shared/campaign";
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
import "./Campaign.css";

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

function eventIcon(eventType?: string) {
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

interface CampaignViewProps {
  heir: Heir;
  activeMission: ActiveMission;
  mission: MissionTemplate;
  loading: boolean;
  onChoose: (choice: MissionCampaignChoice) => void;
  onAbandon?: () => void;
}

export function CampaignView({
  heir,
  activeMission,
  mission,
  loading,
  onChoose,
  onAbandon,
}: CampaignViewProps) {
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const stepIndex = activeMission.currentStep;
  const step = mission.campaign.steps[stepIndex];
  const campaignState: CampaignRunState = activeMission.campaignState ?? {
    supplies: 30,
    maxSupplies: 30,
    morale: 78,
    stagesRemaining: mission.campaign.steps.length + 2,
    maxStages: mission.campaign.steps.length + 2,
    eventLog: [],
    runGold: 0,
    runXp: 0,
    runItems: [],
    hpPercent: 100,
    regionName: mission.campaign.regionName,
  };

  const choices = useMemo(() => getStepChoices(mission, stepIndex), [mission, stepIndex]);
  const isFinalStep = stepIndex >= activeMission.totalSteps - 1;
  const maxHp = estimateMaxHp(heir);
  const currentHp = Math.round((campaignState.hpPercent / 100) * maxHp);
  const maxResource = estimateResource(heir);
  const resourcePct = Math.min(100, 55 + heir.level * 4);

  const sceneGradient =
    step?.sceneGradient ?? getDefaultSceneGradient(step?.eventType ?? "discovery");
  const eventTitle = step ? getStepTitle(step, mission.name) : mission.name;
  const regionLabel =
    campaignState.regionName ?? mission.campaign.regionName ?? mission.name.toUpperCase();

  const handleChoice = (choice: MissionCampaignChoice) => {
    if (loading) return;
    const supplyBlocked =
      choice.supplyCost !== undefined && campaignState.supplies < choice.supplyCost;
    if (supplyBlocked) return;

    setSelectedChoiceId(choice.id);
    onChoose(choice);
  };

  const inventoryPreview = heir.inventory.slice(0, 10);

  return (
    <div className="campaign-shell animate-fade-in">
      <header className="campaign-topbar">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="campaign-resource">
            <Coins className="w-4 h-4 text-[var(--campaign-gold)]" />
            <span>
              Gold <strong>{heir.gold.toLocaleString()}</strong>
            </span>
          </div>
          <div className="campaign-resource">
            <Package className="w-4 h-4 text-[var(--campaign-gold)]" />
            <span>
              Supplies <strong>{campaignState.supplies}/{campaignState.maxSupplies}</strong>
            </span>
          </div>
          <div className="campaign-resource">
            <Flame className="w-4 h-4 text-orange-400" />
            <span>
              Morale <strong>{campaignState.morale}%</strong>
            </span>
          </div>
        </div>

        <div className="hidden md:flex flex-col items-center gap-1 min-w-[200px]">
          <p className="text-[0.65rem] uppercase tracking-[0.14em] text-[var(--campaign-gold)]">
            Stage {stepIndex + 1} / {activeMission.totalSteps} — {regionLabel}
          </p>
          <div className="campaign-floor-track">
            {mission.campaign.steps.map((_, idx) => (
              <div key={idx} className="flex items-center gap-0.5">
                <div
                  className={`campaign-floor-node ${
                    idx < stepIndex ? "done" : idx === stepIndex ? "active" : ""
                  }`}
                >
                  {idx + 1}
                </div>
                {idx < mission.campaign.steps.length - 1 && (
                  <div className="campaign-floor-line" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="text-right text-xs text-white/50">
          <p>Stages left: {campaignState.stagesRemaining}</p>
          {onAbandon && (
            <button
              type="button"
              onClick={onAbandon}
              className="text-red-400/80 hover:text-red-300 mt-1"
              disabled={loading}
            >
              Abandon
            </button>
          )}
        </div>
      </header>

      <div className="campaign-body">
        <aside className="campaign-panel">
          <p className="campaign-panel-title">Party Status</p>
          <div className="campaign-party-card">
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
                  <div className="campaign-bar hp">
                    <span style={{ width: `${campaignState.hpPercent}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[0.65rem] text-white/50 mb-0.5">
                    <span>{getResourceLabel(heir.classId)}</span>
                    <span>{Math.round((resourcePct / 100) * maxResource)}/{maxResource}</span>
                  </div>
                  <div className="campaign-bar resource">
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

        <main className="campaign-center">
          {step && (
            <>
              <div className="campaign-scene" style={{ background: sceneGradient }}>
                <div className="campaign-scene-overlay" />
                <div className="campaign-scene-caption">
                  <h2 className="campaign-event-title">{eventTitle}</h2>
                  <p className="campaign-event-text">{step.text}</p>
                </div>
              </div>

              <div className="campaign-choices">
                {choices.map((choice) => {
                  const Icon = choiceIcon(choice.id);
                  const blocked =
                    choice.supplyCost !== undefined &&
                    campaignState.supplies < choice.supplyCost;

                  return (
                    <button
                      key={choice.id}
                      type="button"
                      className="campaign-choice"
                      disabled={loading || blocked}
                      onClick={() => handleChoice(choice)}
                    >
                      <div className="w-9 h-9 rounded-md border border-white/10 bg-black/30 grid place-items-center shrink-0">
                        <Icon className="w-4 h-4 text-[var(--campaign-gold)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="campaign-choice-label">{choice.label}</p>
                        <p className="campaign-choice-sub">{choice.subtitle}</p>
                        {choice.tags && choice.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {choice.tags.map((tag) => (
                              <span key={tag.label} className={`campaign-tag ${tag.tone}`}>
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
              {selectedChoiceId && !loading && isFinalStep && (
                <p className="text-sm text-[var(--campaign-gold)] mt-4 text-center">
                  Completing contract...
                </p>
              )}
            </>
          )}
        </main>

        <aside className="campaign-panel">
          <p className="campaign-panel-title">Event Info</p>
          <div className="campaign-meta-row">
            <span className="campaign-meta-pill capitalize">
              {step?.eventType ?? mission.type}
            </span>
            <span className="campaign-meta-pill">{mission.difficulty}-Rank</span>
            <span className="campaign-meta-pill capitalize">
              Time: {step?.timeCost ?? "normal"}
            </span>
          </div>

          <p className="campaign-panel-title mt-4">Possible Rewards</p>
          <div className="campaign-reward-preview mb-4">
            {mission.rewards.gold > 0 && (
              <div className="campaign-reward-chip" title={`${mission.rewards.gold} gold`}>
                <Coins className="w-3.5 h-3.5 text-[var(--campaign-gold)]" />
              </div>
            )}
            {mission.rewards.xp > 0 && (
              <div className="campaign-reward-chip" title={`${mission.rewards.xp} XP`}>
                <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              </div>
            )}
            {mission.rewards.items.map((itemId) => {
              const item = getItemById(itemId);
              return (
                <div key={itemId} className="campaign-reward-chip" title={item?.name ?? itemId}>
                  {item ? (
                    <ItemIcon item={item} size={16} />
                  ) : (
                    <Backpack className="w-3.5 h-3.5" />
                  )}
                </div>
              );
            })}
          </div>

          <p className="campaign-panel-title">Inventory</p>
          <p className="text-[0.7rem] text-white/45 mb-2">
            {heir.inventory.length} / 30 items
          </p>
          <div className="campaign-inventory-grid mb-4">
            {Array.from({ length: 10 }).map((_, idx) => {
              const itemId = inventoryPreview[idx];
              const item = itemId ? getItemById(itemId) : null;
              return (
                <div key={idx} className="campaign-inv-slot">
                  {item ? <ItemIcon item={item} size={18} /> : null}
                </div>
              );
            })}
          </div>

          <p className="campaign-panel-title">Event Log</p>
          <div className="max-h-36 overflow-y-auto scrollbar-thin">
            {[...campaignState.eventLog].reverse().map((entry, idx) => (
              <p key={`${entry.timestampMs}-${idx}`} className="campaign-log-item">
                {entry.text}
              </p>
            ))}
          </div>
        </aside>
      </div>

      <footer className="campaign-journey">
        <button type="button" className="text-xs text-white/50 flex items-center gap-1.5" disabled>
          <Map className="w-3.5 h-3.5" />
          Journey Map
        </button>

        <div className="campaign-journey-nodes">
          {mission.campaign.steps.map((s, idx) => {
            const Icon = eventIcon(s.eventType);
            return (
              <div
                key={idx}
                className={`campaign-journey-node ${
                  idx < stepIndex ? "done" : idx === stepIndex ? "current" : ""
                }`}
                title={`Stage ${idx + 1}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
            );
          })}
        </div>

        <div className="text-xs text-white/45 flex items-center gap-2">
          <Shield className="w-3.5 h-3.5" />
          {isFinalStep ? "Final stage — choice completes contract" : "Choose an action to advance"}
        </div>
      </footer>
    </div>
  );
}
