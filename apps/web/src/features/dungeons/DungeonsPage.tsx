import { useEffect, useMemo, useState } from "react";
import { useGameStore } from "@/stores/gameStore";
import { useUIStore } from "@/stores/uiStore";
import { BusyActivityBlock, useIsHeirBusyOnJob } from "@/components/game/BusyActivityBlock";
import { AdventureEventView } from "@/features/adventure/AdventureEventView";
import { BattleView, type BattleResultSummary } from "@/features/battle/BattleView";
import { resolveDungeon } from "@/firebase/functions";
import { getFirebaseErrorMessage, isFunctionsUnavailable } from "@/lib/firebaseErrors";
import {
  getDungeonFloorApproach,
  getDungeonFloorChoices,
} from "@bloodline/shared/adventure";
import type {
  BattleReplayPayload,
  DungeonData,
  MissionCampaignChoice,
} from "@bloodline/shared/types";
import { Castle, ChevronRight } from "lucide-react";

import dungeonsData from "@game-data/dungeons.json";

const dungeons = dungeonsData.dungeons as DungeonData[];

type DungeonPhase = "list" | "floor_event" | "battle";

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
  const [battleReplay, setBattleReplay] = useState<BattleReplayPayload | null>(null);
  const [battleSummary, setBattleSummary] = useState<BattleResultSummary | null>(null);

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
    if (isBusyOnJob) {
      setError("Finish your job shift before entering a dungeon.");
      return;
    }

    setError("");
    setDungeonRunActive(true);
    setSelectedDungeon(dungeon);
    setCurrentFloor(1);
    setBattleReplay(null);
    setBattleSummary(null);
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
    setBattleReplay(null);
    setBattleSummary(null);

    try {
      const response = await resolveDungeon({
        lineageId: lineage.id,
        heirId: heir.id,
        dungeonId: selectedDungeon.id,
        floor: currentFloor,
        floorChoiceId: choice.id,
      });

      const summary: BattleResultSummary = {
        victory: response.data.victory,
        heirDied: response.data.heirDied,
        monsterFaced: response.data.monsterFaced,
        rewards: response.data.rewards,
        floorCleared: response.data.floorCleared,
        dungeonCompleted: response.data.dungeonCompleted,
        choiceLabel: choice.label,
      };

      setBattleSummary(summary);
      setBattleReplay(response.data.battleReplay);
      setRunLog((prev) => [
        ...prev,
        {
          text: `${choice.label}: faced ${response.data.monsterFaced} — ${response.data.victory ? "victory" : "defeat"}`,
          timestampMs: Date.now(),
        },
      ]);

      if (response.data.victory) {
        updateHeirGold(heir.gold + response.data.rewards.gold);
        updateHeirXp(heir.xp + response.data.rewards.xp);
      }

      setPhase("battle");
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

  const handleBattleContinue = () => {
    if (!battleSummary) return;

    if (battleSummary.heirDied) {
      handleLeaveDungeon();
      return;
    }

    if (battleSummary.floorCleared && !battleSummary.dungeonCompleted) {
      setCurrentFloor((f) => f + 1);
      setBattleReplay(null);
      setBattleSummary(null);
      setPhase("floor_event");
      setError("");
      return;
    }

    handleLeaveDungeon();
  };

  const handleLeaveDungeon = () => {
    setSelectedDungeon(null);
    setCurrentFloor(1);
    setBattleReplay(null);
    setBattleSummary(null);
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

  if (!isBusyOnJob && phase === "battle" && battleReplay && battleSummary && selectedDungeon) {
    const continueLabel =
      battleSummary.heirDied
        ? "Return"
        : battleSummary.floorCleared && !battleSummary.dungeonCompleted
          ? `Next Floor (${currentFloor + 1})`
          : "Leave Dungeon";

    return (
      <div className="h-full p-2 md:p-3 overflow-hidden">
        <BattleView
          replay={battleReplay}
          headerLabel={`Floor ${currentFloor} / ${selectedDungeon.floors.length} — ${selectedDungeon.name.toUpperCase()}`}
          resultSummary={battleSummary}
          continueLabel={continueLabel}
          onFinished={() => {}}
          onContinue={handleBattleContinue}
          onLeave={handleLeaveDungeon}
        />
      </div>
    );
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
          footerHint="Choose your approach — combat plays out after your decision"
        />
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
