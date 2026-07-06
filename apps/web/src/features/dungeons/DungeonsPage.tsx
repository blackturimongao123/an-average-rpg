import { useEffect, useMemo, useRef, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useGameStore } from "@/stores/gameStore";
import { useUIStore } from "@/stores/uiStore";
import { BusyActivityBlock, useIsHeirBusyOnJob } from "@/components/game/BusyActivityBlock";
import { AdventureEventView, type AdventurePartyMember } from "@/features/adventure/AdventureEventView";
import { BattleView, type BattleResultSummary } from "@/features/battle/BattleView";
import {
  buildPartyDungeonSeed,
  advancePartyDungeonFloor,
  clearPartyDungeon,
  startPartyDungeon,
  updatePartyDungeon,
} from "@/firebase/partyDungeonClient";
import { persistDungeonResult, persistPredeterminedDungeonResult, resolveDungeonLocal } from "@/firebase/dungeonClient";
import { getFirebaseErrorMessage } from "@/lib/firebaseErrors";
import { usePartyMembers } from "@/hooks/usePartyMembers";
import {
  getDungeonFloorApproach,
  getDungeonFloorChoices,
} from "@bloodline/shared/adventure";
import type {
  BattleReplayPayload,
  DungeonData,
  MissionCampaignChoice,
  PartyActiveDungeon,
} from "@bloodline/shared/types";
import { Castle, ChevronRight, Crown, Users } from "lucide-react";

import dungeonsData from "@game-data/dungeons.json";

const dungeons = dungeonsData.dungeons as DungeonData[];

type DungeonPhase = "list" | "floor_event" | "battle";

interface DungeonRunLog {
  text: string;
  timestampMs: number;
}

function findDungeon(id: string) {
  return dungeons.find((d) => d.id === id) ?? null;
}

export function DungeonsPage() {
  const { user } = useAuthStore();
  const { lineage, heir, updateHeirGold, updateHeirXp } = useGameStore();
  const setDungeonRunActive = useUIStore((s) => s.setDungeonRunActive);
  const isBusyOnJob = useIsHeirBusyOnJob();
  const { party, members } = usePartyMembers(lineage?.partyId);

  const [phase, setPhase] = useState<DungeonPhase>("list");
  const [selectedDungeon, setSelectedDungeon] = useState<DungeonData | null>(null);
  const [currentFloor, setCurrentFloor] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [runLog, setRunLog] = useState<DungeonRunLog[]>([]);
  const [battleReplay, setBattleReplay] = useState<BattleReplayPayload | null>(null);
  const [battleSummary, setBattleSummary] = useState<BattleResultSummary | null>(null);
  const persistedBattleKeyRef = useRef<string | null>(null);

  const inParty = Boolean(lineage?.partyId && party);
  const isPartyLeader = inParty && party?.leaderUid === user?.uid;
  const partyDungeon = party?.activeDungeon ?? null;

  const floorIndex = currentFloor - 1;

  const adventurePartyMembers: AdventurePartyMember[] = useMemo(() => {
    if (!inParty || members.length === 0) return [];
    return members.map((m) => ({
      heirName: m.heirName,
      classId: m.classId,
      subclassId: m.subclassId,
      level: m.level,
      isLeader: m.isLeader,
      isSelf: m.lineageId === lineage?.id,
    }));
  }, [inParty, members, lineage?.id]);

  useEffect(() => {
    setDungeonRunActive(phase !== "list" && selectedDungeon !== null);
    return () => setDungeonRunActive(false);
  }, [phase, selectedDungeon, setDungeonRunActive]);

  const applyPartyDungeonState = (activeDungeon: PartyActiveDungeon) => {
    const dungeon = findDungeon(activeDungeon.dungeonId);
    if (!dungeon) return;

    setSelectedDungeon(dungeon);
    setCurrentFloor(activeDungeon.currentFloor);
    setPhase(activeDungeon.phase);
    setRunLog(activeDungeon.runLog ?? []);
    setBattleReplay(activeDungeon.battleReplay);
    if (activeDungeon.battleSummary) {
      setBattleSummary({
        victory: activeDungeon.battleSummary.victory,
        heirDied: activeDungeon.battleSummary.heirDied,
        monsterFaced: activeDungeon.battleSummary.monsterFaced,
        rewards: activeDungeon.battleSummary.rewards,
        floorCleared: activeDungeon.battleSummary.floorCleared,
        dungeonCompleted: activeDungeon.battleSummary.dungeonCompleted,
        choiceLabel: activeDungeon.battleSummary.choiceLabel,
      });
    } else {
      setBattleSummary(null);
    }
  };

  useEffect(() => {
    if (!partyDungeon) {
      if (inParty && phase !== "list") {
        setSelectedDungeon(null);
        setCurrentFloor(1);
        setBattleReplay(null);
        setBattleSummary(null);
        setRunLog([]);
        setPhase("list");
        persistedBattleKeyRef.current = null;
      }
      return;
    }
    applyPartyDungeonState(partyDungeon);
  }, [partyDungeon?.updatedAtMs, partyDungeon?.phase, inParty]);

  useEffect(() => {
    if (!inParty || !partyDungeon || !heir || !lineage || !user) return;
    if (partyDungeon.phase !== "battle" || !partyDungeon.battleSummary?.monsterId) {
      return;
    }

    const summary = partyDungeon.battleSummary;
    const persistKey = `${partyDungeon.dungeonId}-${partyDungeon.currentFloor}-${partyDungeon.battleSeed}-${heir.id}`;
    if (persistedBattleKeyRef.current === persistKey) return;
    persistedBattleKeyRef.current = persistKey;

    const dungeon = findDungeon(partyDungeon.dungeonId);
    if (!dungeon) return;

    if (summary.victory) {
      updateHeirGold(heir.gold + summary.rewards.gold);
      updateHeirXp(heir.xp + summary.rewards.xp);
    }

    void persistPredeterminedDungeonResult(
      {
        userId: user.uid,
        lineage,
        heir,
        dungeon,
        floor: partyDungeon.currentFloor,
        floorChoiceId: partyDungeon.floorChoiceId ?? undefined,
      },
      {
        victory: summary.victory,
        heirDied: summary.heirDied,
        monsterId: summary.monsterId,
        rewards: summary.rewards,
      }
    ).catch((err) => {
      console.error("Party predetermined dungeon persist error:", err);
    });
  }, [
    inParty,
    partyDungeon?.battleSeed,
    partyDungeon?.phase,
    partyDungeon?.battleSummary,
    partyDungeon?.currentFloor,
    heir,
    lineage,
    user,
    updateHeirGold,
    updateHeirXp,
  ]);

  const floorApproach = useMemo(() => {
    if (!selectedDungeon) return null;
    return getDungeonFloorApproach(selectedDungeon, floorIndex);
  }, [selectedDungeon, floorIndex]);

  const floorChoices = useMemo(() => {
    if (!selectedDungeon) return [];
    return getDungeonFloorChoices(selectedDungeon, floorIndex);
  }, [selectedDungeon, floorIndex]);

  const handleEnterDungeon = async (dungeon: DungeonData) => {
    if (isBusyOnJob) {
      setError("Finish your job shift before entering a dungeon.");
      return;
    }

    if (inParty && !isPartyLeader) {
      setError("Only the party leader can start a dungeon run.");
      return;
    }

    if (inParty && partyDungeon) {
      setError("Your party is already in a dungeon.");
      return;
    }

    setError("");

    if (inParty && lineage?.partyId && isPartyLeader) {
      try {
        await startPartyDungeon(lineage.partyId, dungeon);
      } catch (err) {
        setError(getFirebaseErrorMessage(err));
      }
      return;
    }

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
    if (!heir || !selectedDungeon || !lineage || !user) return;

    if (inParty && !isPartyLeader) return;

    setError("");
    setBattleReplay(null);
    setBattleSummary(null);

    try {
      const battleSeed =
        inParty && lineage.partyId
          ? buildPartyDungeonSeed(
              lineage.partyId,
              selectedDungeon.id,
              currentFloor,
              choice.id
            )
          : undefined;

      const result = resolveDungeonLocal({
        userId: user.uid,
        lineage,
        heir,
        dungeon: selectedDungeon,
        floor: currentFloor,
        floorChoiceId: choice.id,
        seedOverride: battleSeed,
      });

      const summary: BattleResultSummary = {
        victory: result.victory,
        heirDied: result.heirDied,
        monsterFaced: result.monsterFaced,
        rewards: result.rewards,
        floorCleared: result.floorCleared,
        dungeonCompleted: result.dungeonCompleted,
        choiceLabel: choice.label,
      };

      const logEntry = {
        text: `${choice.label}: faced ${result.monsterFaced} — ${result.victory ? "victory" : "defeat"}`,
        timestampMs: Date.now(),
      };
      const nextLog = [...runLog, logEntry];

      if (inParty && lineage.partyId && isPartyLeader) {
        await updatePartyDungeon(lineage.partyId, {
          phase: "battle",
          floorChoiceId: choice.id,
          battleSeed: battleSeed ?? null,
          battleReplay: result.battleReplay,
          battleSummary: {
            victory: result.victory,
            heirDied: result.heirDied,
            monsterFaced: result.monsterFaced,
            monsterId: result.monsterId,
            rewards: result.rewards,
            floorCleared: result.floorCleared,
            dungeonCompleted: result.dungeonCompleted,
            choiceLabel: choice.label,
          },
          runLog: nextLog,
          updatedAtMs: Date.now(),
        });
      } else {
        setBattleSummary(summary);
        setBattleReplay(result.battleReplay);
        setRunLog(nextLog);

        if (result.victory) {
          updateHeirGold(heir.gold + result.rewards.gold);
          updateHeirXp(heir.xp + result.rewards.xp);
        }

        setPhase("battle");

        void persistDungeonResult(
          {
            userId: user.uid,
            lineage,
            heir,
            dungeon: selectedDungeon,
            floor: currentFloor,
            floorChoiceId: choice.id,
            seedOverride: battleSeed,
          },
          result
        ).catch((err) => {
          console.error("Dungeon persist error:", err);
          setError(getFirebaseErrorMessage(err));
        });
      }
    } catch (err) {
      console.error("Dungeon error:", err);
      setError(getFirebaseErrorMessage(err));
    }
  };

  const handleBattleContinue = async () => {
    if (!battleSummary) return;

    if (battleSummary.heirDied) {
      await handleLeaveDungeon();
      return;
    }

    if (battleSummary.floorCleared && !battleSummary.dungeonCompleted) {
      if (inParty && lineage?.partyId && isPartyLeader) {
        await advancePartyDungeonFloor(lineage.partyId, currentFloor + 1);
        setBattleReplay(null);
        setBattleSummary(null);
        setError("");
        return;
      }

      setCurrentFloor((f) => f + 1);
      setBattleReplay(null);
      setBattleSummary(null);
      setPhase("floor_event");
      setError("");
      return;
    }

    await handleLeaveDungeon();
  };

  const handleLeaveDungeon = async () => {
    if (inParty && lineage?.partyId && isPartyLeader) {
      try {
        await clearPartyDungeon(lineage.partyId);
      } catch (err) {
        setError(getFirebaseErrorMessage(err));
      }
    }

    setSelectedDungeon(null);
    setCurrentFloor(1);
    setBattleReplay(null);
    setBattleSummary(null);
    setRunLog([]);
    setError("");
    setPhase("list");
    persistedBattleKeyRef.current = null;
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

    const canContinue = !inParty || isPartyLeader;

    return (
      <div className="h-full p-2 md:p-3 overflow-hidden">
        <BattleView
          replay={battleReplay}
          headerLabel={`Floor ${currentFloor} / ${selectedDungeon.floors.length} — ${selectedDungeon.name.toUpperCase()}${inParty ? " (Party)" : ""}`}
          resultSummary={battleSummary}
          continueLabel={continueLabel}
          onFinished={() => {}}
          onContinue={canContinue ? handleBattleContinue : () => {}}
          onLeave={isPartyLeader ? handleLeaveDungeon : undefined}
        />
        {inParty && !isPartyLeader && (
          <p className="text-center text-xs text-white/50 mt-2">
            Waiting for party leader to continue…
          </p>
        )}
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
          progressLabel={`Floor ${currentFloor} / ${selectedDungeon.floors.length}${inParty ? " · Party" : ""}`}
          step={floorApproach}
          choices={floorChoices}
          loading={loading}
          onChoose={handleFloorChoice}
          onLeave={isPartyLeader || !inParty ? handleLeaveDungeon : undefined}
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
          footerHint={
            inParty && !isPartyLeader
              ? "Waiting for the party leader to choose an approach…"
              : "Choose your approach — combat plays out after the decision"
          }
          partyMembers={adventurePartyMembers}
          choicesDisabled={inParty && !isPartyLeader}
          leaderHint="Party dungeon — the leader picks each floor approach for the group."
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
          <p className="text-muted-foreground">
            {inParty
              ? "Party expeditions — leader starts the run, everyone fights together"
              : "Choose a dungeon — each floor begins with a tactical decision"}
          </p>
        </div>
      </div>

      {inParty && partyDungeon && (
        <div className="mb-4 p-4 rounded-md border border-primary/30 bg-primary/10 text-sm flex items-center gap-2">
          <Users className="w-4 h-4 text-primary shrink-0" />
          <span>
            Party expedition in progress: <strong>{partyDungeon.dungeonName}</strong> (floor{" "}
            {partyDungeon.currentFloor})
            {!isPartyLeader && " — syncing with your party"}
          </span>
        </div>
      )}

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
            const partyBlocked = inParty && !isPartyLeader && !partyDungeon;
            const partyBusy = inParty && Boolean(partyDungeon) && partyDungeon?.dungeonId !== dungeon.id;

            return (
              <button
                key={dungeon.id}
                type="button"
                onClick={() => {
                  if (canEnter && !partyBlocked && !partyBusy) void handleEnterDungeon(dungeon);
                }}
                disabled={!canEnter || partyBlocked || partyBusy}
                title={
                  !canEnter
                    ? `Requires level ${dungeon.requiredLevel} (you are level ${heirLevel})`
                    : partyBlocked
                      ? "Only the party leader can start a dungeon"
                      : partyBusy
                        ? "Party is in another dungeon"
                        : undefined
                }
                className={`card p-4 text-left transition-all ${
                  canEnter && !partyBlocked && !partyBusy
                    ? "hover:border-primary/50"
                    : "opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <Castle className="w-6 h-6 text-gold mt-0.5" />
                    <div>
                      <h3 className="font-display font-semibold flex items-center gap-2">
                        {dungeon.name}
                        {inParty && isPartyLeader && (
                          <Crown className="w-4 h-4 text-gold" aria-label="Party leader" />
                        )}
                      </h3>
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
                        {inParty && (
                          <span className="px-2 py-0.5 rounded bg-primary/20 text-primary">
                            Party
                          </span>
                        )}
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
