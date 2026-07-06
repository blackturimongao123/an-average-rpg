import { useState } from "react";
import { useGameStore } from "@/stores/gameStore";
import { BusyActivityBlock, useIsHeirBusyOnJob } from "@/components/game/BusyActivityBlock";
import { resolveDungeon } from "@/firebase/functions";
import { getFirebaseErrorMessage, isFunctionsUnavailable } from "@/lib/firebaseErrors";
import { Castle, Skull, Swords, Coins, Star, ChevronRight } from "lucide-react";
import type { BattleRound, DungeonData } from "@bloodline/shared/types";

import dungeonsData from "@game-data/dungeons.json";

const dungeons = dungeonsData.dungeons as DungeonData[];

export function DungeonsPage() {
  const { lineage, heir, updateHeirGold, updateHeirXp, updateHeirLevel } = useGameStore();
  const isBusyOnJob = useIsHeirBusyOnJob();
  const [selectedDungeon, setSelectedDungeon] = useState<typeof dungeons[0] | null>(null);
  const [currentFloor, setCurrentFloor] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [battleResult, setBattleResult] = useState<{
    victory: boolean;
    heirDied: boolean;
    monsterFaced: string;
    rewards: { gold: number; xp: number; items: string[] };
    battleRounds: BattleRound[];
    floorCleared: boolean;
    dungeonCompleted: boolean;
  } | null>(null);

  const handleEnterFloor = async () => {
    if (!heir || !selectedDungeon) return;
    if (!lineage) {
      setError("Lineage data is still loading. Try again in a moment.");
      return;
    }

    setLoading(true);
    setBattleResult(null);
    setError("");

    try {
      const response = await resolveDungeon({
        lineageId: lineage.id,
        heirId: heir.id,
        dungeonId: selectedDungeon.id,
        floor: currentFloor,
      });

      setBattleResult({
        victory: response.data.victory,
        heirDied: response.data.heirDied,
        monsterFaced: response.data.monsterFaced,
        rewards: response.data.rewards,
        battleRounds: response.data.battleRounds as BattleRound[],
        floorCleared: response.data.floorCleared,
        dungeonCompleted: response.data.dungeonCompleted,
      });

      if (response.data.victory) {
        updateHeirGold(heir.gold + response.data.rewards.gold);
        updateHeirXp(heir.xp + response.data.rewards.xp);
      }

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
    if (battleResult?.floorCleared && !battleResult.dungeonCompleted) {
      setCurrentFloor((f) => f + 1);
    }
    setBattleResult(null);
  };

  const handleLeaveDungeon = () => {
    setSelectedDungeon(null);
    setCurrentFloor(1);
    setBattleResult(null);
    setError("");
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Castle className="w-8 h-8 text-gold" />
        <div>
          <h1 className="font-display text-2xl font-bold">Dungeons</h1>
          <p className="text-muted-foreground">Automatic speed-gauge combat — build your heir, then watch the fight</p>
        </div>
      </div>

      {isBusyOnJob && <BusyActivityBlock activityName="dungeon" />}

      {error && (
        <div className="mb-4 p-4 rounded-md bg-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {!isBusyOnJob && battleResult ? (
        <div className="card p-6 animate-fade-in">
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
                  {round.actorGaugeAfter !== undefined && round.actor === heir.id && (
                    <span className="text-xs text-muted-foreground">gauge {round.actorGaugeAfter}%</span>
                  )}
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
                Dungeon Complete! You have conquered {selectedDungeon?.name}!
              </p>
            </div>
          )}

          <div className="flex gap-3">
            {battleResult.floorCleared && !battleResult.dungeonCompleted && !battleResult.heirDied && (
              <button onClick={handleContinue} className="btn-primary">
                Continue to Floor {currentFloor + 1}
              </button>
            )}
            <button onClick={handleLeaveDungeon} className="btn-secondary">
              Leave Dungeon
            </button>
          </div>
        </div>
      ) : !isBusyOnJob && selectedDungeon ? (
        <div className="card p-6 animate-fade-in">
          <button
            onClick={handleLeaveDungeon}
            className="text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            ← Back to dungeon list
          </button>

          <h2 className="font-display text-xl font-semibold mb-2">
            {selectedDungeon.name}
          </h2>
          <p className="text-muted-foreground mb-4">{selectedDungeon.description}</p>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Castle className="w-4 h-4 text-muted-foreground" />
              <span>Floor {currentFloor} / {selectedDungeon.floors.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Skull className="w-4 h-4 text-muted-foreground" />
              <span className="capitalize">{selectedDungeon.difficulty || "Normal"}</span>
            </div>
          </div>

          <button
            onClick={handleEnterFloor}
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? (
              "Fighting..."
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Swords className="w-4 h-4" />
                Enter Floor {currentFloor}
              </span>
            )}
          </button>
        </div>
      ) : !isBusyOnJob ? (
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
                  if (canEnter) {
                    setError("");
                    setSelectedDungeon(dungeon);
                  }
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
      ) : null}
    </div>
  );
}
