import { useEffect, useMemo, useState } from "react";
import { useGameStore } from "@/stores/gameStore";
import { useUIStore } from "@/stores/uiStore";
import { BusyActivityBlock, useIsHeirBusyOnJob } from "@/components/game/BusyActivityBlock";
import { AdventureEventView } from "@/features/adventure/AdventureEventView";
import { resolveDungeon } from "@/firebase/functions";
import { getFirebaseErrorMessage, isFunctionsUnavailable } from "@/lib/firebaseErrors";
import {
  getDungeonFloorApproach,
  getDungeonFloorChoices,
} from "@bloodline/shared/adventure";
import type { BattleRound, DungeonData, MissionCampaignChoice } from "@bloodline/shared/types";
import { Castle, ChevronRight, Coins, Skull, Star, Swords } from "lucide-react";

import dungeonsData from "@game-data/dungeons.json";

const dungeons = dungeonsData.dungeons as DungeonData[];

type DungeonPhase = "list" | "floor_event" | "battle_result";

interface DungeonRunLog {
  text: string;
  timestampMs: number;
}

export function DungeonsPage() {
  const { lineage, heir, updateHeirGold, updateHeirXp } = useGameStore();
  const setDungeonRunActive = useUIStore((s) => s.setDungeonRunActive);
  const isBusyOnJob = useIsHeirBusyOnJob();

  const [phase, setPhase] = useState<DungeonPhase>("list");
  const [selectedDungeon, setSelectedDungeon] = useState<DungeonData | null>(null);
  const [currentFloor, setCurrentFloor] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [runLog, setRunLog] = useState<DungeonRunLog[]>([]);
  const [battleResult, setBattleResult] = useState<{
    victory: boolean;
    heirDied: boolean;
    monsterFaced: string;
    rewards: { gold: number; xp: number; items: string[] };
    battleRounds: BattleRound[];
    floorCleared: boolean;
    dungeonCompleted: boolean;
    choiceLabel?: string;
  } | null>(null);

  const floorIndex = currentFloor - 1;

  useEffect(() => {
    setDungeonRunActive(phase !== "list" && selectedDungeon !== null);
    return () => setDungeonRunActive(false);
  }, [phase, selectedDungeon, setDungeonRunActive]);

  const floorApproach = useMemo(() => {
    if (!selectedDungeon) return null;
    return getDungeonFloorApproach(selectedDungeon, floorIndex);
  }, [selectedDungeon, floorIndex]);

  const floorChoices = useMemo(() => {
    if (!selectedDungeon) return [];
    return getDungeonFloorChoices(selectedDungeon, floorIndex);
  }, [selectedDungeon, floorIndex]);

  const handleEnterDungeon = (dungeon: DungeonData) => {
    setError("");
    setSelectedDungeon(dungeon);
    setCurrentFloor(1);
    setBattleResult(null);
    setRunLog([
      {
        text: `Entered ${dungeon.name}`,
        timestampMs: Date.now(),
      },
    ]);
    setPhase("floor_event");
  };

  const handleFloorChoice = async (choice: MissionCampaignChoice) => {
    if (!heir || !selectedDungeon || !lineage) return;

    setLoading(true);
    setError("");
    setBattleResult(null);

    try {
      const response = await resolveDungeon({
        lineageId: lineage.id,
        heirId: heir.id,
        dungeonId: selectedDungeon.id,
        floor: currentFloor,
        floorChoiceId: choice.id,
      });

      const result = {
        victory: response.data.victory,
        heirDied: response.data.heirDied,
        monsterFaced: response.data.monsterFaced,
        rewards: response.data.rewards,
        battleRounds: response.data.battleRounds as BattleRound[],
        floorCleared: response.data.floorCleared,
        dungeonCompleted: response.data.dungeonCompleted,
        choiceLabel: choice.label,
      };

      setBattleResult(result);
      setRunLog((prev) => [
        ...prev,
        {
          text: `${choice.label}: faced ${result.monsterFaced} — ${result.victory ? "victory" : "defeat"}`,
          timestampMs: Date.now(),
        },
      ]);

      if (response.data.victory) {
        updateHeirGold(heir.gold + response.data.rewards.gold);
        updateHeirXp(heir.xp + response.data.rewards.xp);
      }

      setPhase("battle_result");
    } catch (err) {
      console.error("Dungeon error:", err);
      const message = getFirebaseErrorMessage(err);
      setError(
        isFunctionsUnavailable(err)
          ? `${message} Dungeon combat runs on Cloud Functions — deploy the backend (Firebase Blaze plan required).`
          : message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (battleResult?.floorCleared && !battleResult.dungeonCompleted && !battleResult.heirDied) {
      setCurrentFloor((f) => f + 1);
      setPhase("floor_event");
    }
    setBattleResult(null);
    setError("");
  };

  const handleLeaveDungeon = () => {
    setSelectedDungeon(null);
    setCurrentFloor(1);
    setBattleResult(null);
    setRunLog([]);
    setError("");
    setPhase("list");
  };

  const heirLevel = heir?.level ?? 1;

  if (!heir) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Create an heir to explore dungeons</p>
      </div>
    );
  }

  function formatRoundLine(round: BattleRound, heirName: string, monsterName: string) {
    const actorName = round.actor === heir!.id ? heirName : monsterName;
    const abilityLabel = round.abilityName ?? round.action;

    if (round.isDodge) {
      return `${actorName} attacks — ${heirName} dodges!`;
    }
    if (round.isMiss) {
      return `${actorName} uses ${abilityLabel} — miss!`;
    }
    if (round.healing && round.healing > 0) {
      return `${actorName} uses ${abilityLabel} — heals ${round.healing}${round.damage > 0 ? `, deals ${round.damage} damage` : ""}`;
    }
    const crit = round.isCrit ? " CRIT!" : "";
    const hits = round.hitCount && round.hitCount > 1 ? ` (${round.hitCount} hits)` : "";
    return `${actorName} uses ${abilityLabel}${hits} — ${round.damage} damage${crit}`;
  }

  if (!isBusyOnJob && phase === "floor_event" && selectedDungeon && floorApproach) {
    return (
      <div className="h-full p-2 md:p-3 overflow-hidden">
        {error && (
          <div className="mb-3 p-3 rounded-md bg-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}
        <AdventureEventView
          heir={heir}
          eventTitle={floorApproach.title ?? `Floor ${currentFloor}`}
          regionLabel={selectedDungeon.name.toUpperCase()}
          progressLabel={`Floor ${currentFloor} / ${selectedDungeon.floors.length}`}
          step={floorApproach}
          choices={floorChoices}
          loading={loading}
          onChoose={handleFloorChoice}
          onLeave={handleLeaveDungeon}
          eventLog={runLog}
          journeyNodes={selectedDungeon.floors.map((f) => ({
            eventType: f.approach?.eventType ?? (f.bossId ? "combat" : "discovery"),
          }))}
          journeyCurrent={floorIndex}
          possibleRewards={{
            gold: 0,
            xp: 0,
            rankXp: 0,
            items: selectedDungeon.rewards?.completionBonus.items ?? [],
          }}
          eventTypeLabel={floorApproach.eventType ?? "dungeon"}
          difficultyLabel={selectedDungeon.difficulty ?? "normal"}
          footerHint="Choose your approach — combat resolves after your decision"
        />
      </div>
    );
  }

  if (!isBusyOnJob && phase === "battle_result" && battleResult && selectedDungeon) {
    return (
      <div className="h-full p-2 md:p-3 overflow-auto">
        <div className="max-w-3xl mx-auto card p-6 animate-fade-in">
          {battleResult.choiceLabel && (
            <p className="text-sm text-muted-foreground mb-2">
              Approach: <span className="text-foreground">{battleResult.choiceLabel}</span>
            </p>
          )}
          <h2 className="font-display text-xl font-semibold mb-4">
            {battleResult.victory ? "Victory!" : "Defeat..."}
          </h2>

          <p className="text-muted-foreground mb-4">
            You faced: <span className="text-foreground font-semibold">{battleResult.monsterFaced}</span>
          </p>

          <div className="bg-secondary/30 rounded-md p-4 mb-4 max-h-64 overflow-y-auto scrollbar-thin">
            <h3 className="text-sm font-semibold mb-2">Battle Log</h3>
            <div className="space-y-1.5 text-sm font-mono">
              {battleResult.battleRounds.slice(-16).map((round, idx) => (
                <div key={idx} className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-muted-foreground shrink-0">T{round.round}</span>
                  <span className={round.actor === heir.id ? "text-blue-400" : "text-red-400"}>
                    {formatRoundLine(round, heir.name, battleResult.monsterFaced)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {battleResult.victory && (
            <div className="flex gap-4 mb-4">
              <div className="flex items-center gap-1.5 text-gold">
                <Coins className="w-4 h-4" />
                <span>+{battleResult.rewards.gold}</span>
              </div>
              <div className="flex items-center gap-1.5 text-blue-400">
                <Star className="w-4 h-4" />
                <span>+{battleResult.rewards.xp} XP</span>
              </div>
            </div>
          )}

          {battleResult.heirDied && (
            <div className="p-4 bg-destructive/20 rounded-md mb-4">
              <p className="text-destructive font-semibold">
                Your heir has fallen in battle. The bloodline must continue...
              </p>
            </div>
          )}

          {battleResult.dungeonCompleted && (
            <div className="p-4 bg-primary/20 rounded-md mb-4">
              <p className="text-primary font-semibold">
                Dungeon Complete! You have conquered {selectedDungeon.name}!
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-md bg-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            {battleResult.floorCleared && !battleResult.dungeonCompleted && !battleResult.heirDied && (
              <button onClick={handleContinue} className="btn-primary">
                Next Floor ({currentFloor + 1})
              </button>
            )}
            <button onClick={handleLeaveDungeon} className="btn-secondary">
              Leave Dungeon
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Castle className="w-8 h-8 text-gold" />
        <div>
          <h1 className="font-display text-2xl font-bold">Dungeons</h1>
          <p className="text-muted-foreground">Choose a dungeon — each floor begins with a tactical decision</p>
        </div>
      </div>

      {isBusyOnJob && <BusyActivityBlock activityName="dungeon" />}

      {error && (
        <div className="mb-4 p-4 rounded-md bg-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {!isBusyOnJob && (
        <div className="grid gap-4">
          {dungeons.length === 0 && (
            <p className="text-muted-foreground">No dungeons are configured yet.</p>
          )}
          {dungeons.map((dungeon) => {
            const canEnter = heirLevel >= dungeon.requiredLevel;

            return (
              <button
                key={dungeon.id}
                type="button"
                onClick={() => {
                  if (canEnter) handleEnterDungeon(dungeon);
                }}
                disabled={!canEnter}
                title={
                  canEnter
                    ? undefined
                    : `Requires level ${dungeon.requiredLevel} (you are level ${heirLevel})`
                }
                className={`card p-4 text-left transition-all ${
                  canEnter ? "hover:border-primary/50" : "opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <Castle className="w-6 h-6 text-gold mt-0.5" />
                    <div>
                      <h3 className="font-display font-semibold">{dungeon.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {dungeon.description.slice(0, 80)}...
                      </p>
                      <div className="flex gap-3 mt-2 text-xs">
                        <span
                          className={`px-2 py-0.5 rounded ${
                            canEnter ? "bg-secondary" : "bg-destructive/20 text-destructive"
                          }`}
                        >
                          Level {dungeon.requiredLevel}+
                          {!canEnter ? ` (need ${dungeon.requiredLevel - heirLevel} more)` : ""}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-secondary capitalize">
                          {dungeon.difficulty || "Normal"}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-secondary">
                          {dungeon.floors.length} Floors
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
