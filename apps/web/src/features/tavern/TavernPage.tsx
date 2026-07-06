import { useState } from "react";
import { useGameStore } from "@/stores/gameStore";
import { BusyActivityBlock, useIsHeirBusyOnJob } from "@/components/game/BusyActivityBlock";
import { useAuthStore } from "@/stores/authStore";
import { useMissionBoard } from "@/hooks/useMissionBoard";
import {
  acceptPlayerMission,
  advancePlayerMission,
} from "@/firebase/missionBoard";
import type { AdvanceMissionResult } from "@/firebase/functions";
import { bootstrapAbandonMission } from "@/firebase/missionBoardBootstrap";
import { CampaignView } from "@/features/campaign/CampaignView";
import { FieldEncountersPanel } from "@/features/tavern/FieldEncountersPanel";
import { BattleView } from "@/features/battle/BattleView";
import { getFirebaseErrorMessage } from "@/lib/firebaseErrors";
import {
  formatMissionCountdown,
  getMissionTemplate,
  normalizeAdventurerRank,
} from "@/lib/missions";
import {
  ADVENTURER_RANK_XP_THRESHOLDS,
  DIFFICULTY_RANK_COLORS,
  getRankXpToNextRank,
} from "@bloodline/shared/constants";
import type { AdventurerRank, BattleReplayPayload, MissionCampaignChoice } from "@bloodline/shared/types";
import {
  Beer,
  ClipboardList,
  Clock,
  Coins,
  Medal,
  Scroll,
  Star,
} from "lucide-react";

import itemsData from "@game-data/items.json";

const items = itemsData.items as Array<{ id: string; name: string }>;

function getItemName(itemId: string): string {
  return items.find((item) => item.id === itemId)?.name ?? itemId;
}

function DifficultyBadge({ difficulty }: { difficulty: AdventurerRank }) {
  return (
    <span
      className="text-xs font-bold px-2 py-1 rounded border"
      style={{
        color: DIFFICULTY_RANK_COLORS[difficulty],
        borderColor: `${DIFFICULTY_RANK_COLORS[difficulty]}55`,
        backgroundColor: `${DIFFICULTY_RANK_COLORS[difficulty]}15`,
      }}
    >
      {difficulty}-Rank
    </span>
  );
}

function RewardList({ rewards }: { rewards: { gold: number; xp: number; rankXp: number; items: string[] } }) {
  return (
    <div className="flex flex-wrap gap-3 text-sm mt-3">
      {rewards.gold > 0 && (
        <span className="flex items-center gap-1 text-gold">
          <Coins className="w-4 h-4" />
          {rewards.gold} gold
        </span>
      )}
      {rewards.xp > 0 && (
        <span className="flex items-center gap-1 text-blue-400">
          <Star className="w-4 h-4" />
          {rewards.xp} XP
        </span>
      )}
      {rewards.rankXp > 0 && (
        <span className="flex items-center gap-1 text-purple-400">
          <Medal className="w-4 h-4" />
          {rewards.rankXp} Rank XP
        </span>
      )}
      {rewards.items.map((itemId) => (
        <span key={itemId} className="text-muted-foreground">
          + {getItemName(itemId)}
        </span>
      ))}
    </div>
  );
}

export function TavernPage() {
  const { user } = useAuthStore();
  const {
    lineage,
    heir,
    missionBoard,
    setMissionBoard,
    setActiveMission,
    updateHeirGold,
    updateHeirXp,
    updateHeirLevel,
    updateAdventurerRank,
    addItemToInventory,
  } = useGameStore();
  const isBusyOnJob = useIsHeirBusyOnJob();
  const { loading: boardLoading, countdownMs, refreshBoard } = useMissionBoard();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tavernTab, setTavernTab] = useState<"missions" | "encounters">("missions");
  const [completion, setCompletion] = useState<{
    rewards: { gold: number; xp: number; rankXp: number; items: string[] };
    rankUp: { rank: string; rankXp: number } | null;
  } | null>(null);
  const [missionBattle, setMissionBattle] = useState<{
    replay: BattleReplayPayload;
    response: AdvanceMissionResult;
    choiceLabel?: string;
  } | null>(null);

  const applyAdvanceResponse = async (response: AdvanceMissionResult) => {
    if (response.missionFailed) {
      setActiveMission(null);
      setError("Your heir was defeated. The contract failed.");
      await refreshBoard();
      return;
    }

    if (response.completed && response.rewards) {
      setActiveMission(null);
      setCompletion({
        rewards: response.rewards,
        rankUp: response.rankUp ?? null,
      });
      updateHeirGold(response.heirGoldAfter!);
      updateHeirXp(response.heirXpAfter!);
      if (response.leveledUp) {
        updateHeirLevel(response.heirLevelAfter!);
      }
      updateAdventurerRank(
        normalizeAdventurerRank(response.adventurerRank),
        response.adventurerRankXp!
      );
      response.rewards.items.forEach((itemId) => addItemToInventory(itemId));
      await refreshBoard();
    } else if (response.activeMission) {
      setActiveMission(response.activeMission);
    }
  };

  const adventurerRank = (lineage?.adventurerRank ?? "F") as AdventurerRank;
  const adventurerRankXp = lineage?.adventurerRankXp ?? 0;
  const rankXpToNext = getRankXpToNextRank(adventurerRank);
  const rankProgress =
    rankXpToNext !== null
      ? Math.min(100, (adventurerRankXp / rankXpToNext) * 100)
      : 100;

  const handleAcceptMission = async (slotIndex: number) => {
    if (!lineage || !heir || !user) return;

    setLoading(true);
    setError("");

    try {
      const response = await acceptPlayerMission(user.uid, lineage.id, heir.id, slotIndex);
      setActiveMission(response.activeMission);
      setMissionBoard(response.board);
    } catch (err: unknown) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceMission = (choice: MissionCampaignChoice) => {
    if (!lineage || !heir || !user || !heir.activeMission) return;

    setError("");

    try {
      const response = advancePlayerMission(
        user.uid,
        lineage,
        heir,
        choice.id
      );

      if (response.battleReplay) {
        setMissionBattle({
          replay: response.battleReplay,
          response,
          choiceLabel: choice.label,
        });
        return;
      }

      void applyAdvanceResponse(response);
    } catch (err: unknown) {
      setError(getFirebaseErrorMessage(err));
    }
  };

  const handleMissionBattleContinue = async () => {
    if (!missionBattle) return;
    const { response } = missionBattle;
    setMissionBattle(null);
    setLoading(true);
    try {
      await applyAdvanceResponse(response);
    } catch (err: unknown) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleAbandonMission = async () => {
    if (!lineage || !heir || !user) return;
    if (!window.confirm("Abandon this contract? Rewards will be lost and a cooldown applies.")) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      await bootstrapAbandonMission(user.uid, lineage.id, heir.id);
      setActiveMission(null);
      await refreshBoard();
    } catch (err: unknown) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!heir) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Create an heir to visit the tavern</p>
      </div>
    );
  }

  const activeMission = heir.activeMission;
  const activeTemplate = activeMission ? getMissionTemplate(activeMission.missionId) : null;

  if (missionBattle && activeMission && activeTemplate) {
    const enemyName =
      missionBattle.replay.combatants.find((c) => c.side === "enemy")?.name ?? "Enemy";
    const victory = missionBattle.replay.victory;

    return (
      <div className="h-full p-2 md:p-3 overflow-hidden">
        <BattleView
          replay={missionBattle.replay}
          headerLabel={`${activeMission.missionName.toUpperCase()} — Stage ${activeMission.currentStep + 1}`}
          resultSummary={{
            victory,
            monsterFaced: enemyName,
            choiceLabel: missionBattle.choiceLabel,
            rewards: missionBattle.response.rewards ?? undefined,
            heirDied: missionBattle.response.missionFailed,
          }}
          continueLabel={
            missionBattle.response.missionFailed
              ? "Return to Tavern"
              : missionBattle.response.completed
                ? "Collect Rewards"
                : "Continue Expedition"
          }
          onFinished={() => {}}
          onContinue={handleMissionBattleContinue}
        />
      </div>
    );
  }

  if (activeMission && activeTemplate && !completion) {
    return (
      <div className="h-full p-2 md:p-3 overflow-hidden">
        {error && (
          <div className="mb-3 p-3 rounded-md bg-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}
        <CampaignView
          heir={heir}
          activeMission={activeMission}
          mission={activeTemplate}
          loading={loading}
          onChoose={handleAdvanceMission}
          onAbandon={handleAbandonMission}
        />
      </div>
    );
  }

  return (
    <div className={tavernTab === "encounters" ? "h-full flex flex-col" : "max-w-5xl mx-auto"}>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Beer className="w-8 h-8 text-gold" />
          <div>
            <h1 className="font-display text-2xl font-bold">The Weary Traveler Tavern</h1>
            <p className="text-muted-foreground">Guild mission board — pick a contract and begin your adventure</p>
          </div>
        </div>

        <div className="card px-4 py-3 min-w-[220px]">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-sm text-muted-foreground">Adventurer Rank</span>
            <DifficultyBadge difficulty={adventurerRank} />
          </div>
          {rankXpToNext !== null ? (
            <>
              <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mb-1">
                <div
                  className="h-full bg-purple-500 transition-all"
                  style={{ width: `${rankProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {adventurerRankXp} / {rankXpToNext} Rank XP
              </p>
            </>
          ) : (
            <p className="text-xs text-gold">Maximum rank achieved</p>
          )}
        </div>
      </div>

      {isBusyOnJob && <BusyActivityBlock activityName="tavern" />}

      {error && (
        <div className="p-3 rounded-md bg-destructive/20 text-destructive text-sm mb-4">
          {error}
        </div>
      )}

      {completion ? (
        <div className="card p-6 animate-fade-in">
          <h2 className="font-display text-xl font-semibold mb-2">Mission Complete</h2>
          <p className="text-muted-foreground mb-4">The guild recognizes your success.</p>
          <RewardList rewards={completion.rewards} />
          {completion.rankUp && (
            <div className="mt-4 p-4 rounded-md bg-purple-500/10 border border-purple-500/30">
              <p className="font-semibold text-purple-300">
                Rank promoted to {completion.rankUp.rank}!
              </p>
            </div>
          )}
          <button onClick={() => setCompletion(null)} className="btn-primary mt-6">
            Back to Mission Board
          </button>
        </div>
      ) : isBusyOnJob ? null : (
        <div>
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setTavernTab("missions")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                tavernTab === "missions"
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              Mission Board
            </button>
            <button
              type="button"
              onClick={() => setTavernTab("encounters")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                tavernTab === "encounters"
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              Field Encounters
            </button>
          </div>

          {tavernTab === "encounters" ? (
            <div className="flex-1 min-h-0">
              <FieldEncountersPanel />
            </div>
          ) : (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-gold" />
              <h2 className="font-display text-lg font-semibold">Mission Board</h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              Board refreshes in {formatMissionCountdown(countdownMs)}
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Contracts are tailored to your Adventurer Rank ({adventurerRank}). Unclaimed missions
            reroll every hour.
          </p>

          {boardLoading && !missionBoard ? (
            <p className="text-muted-foreground">Loading mission board...</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {(missionBoard?.slots ?? []).map((slot) => {
                if (slot.status !== "available" || !slot.missionId) {
                  return (
                    <div
                      key={slot.slotIndex}
                      className="card p-4 border-dashed opacity-50 min-h-[160px] flex items-center justify-center"
                    >
                      <p className="text-sm text-muted-foreground">Empty slot — refreshes on reroll</p>
                    </div>
                  );
                }

                const mission = getMissionTemplate(slot.missionId);
                if (!mission) {
                  return null;
                }

                return (
                  <div key={slot.slotIndex} className="card p-4 hover:border-primary/40 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold">{mission.name}</h3>
                      <DifficultyBadge difficulty={mission.difficulty} />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{mission.description}</p>
                    <p className="text-xs text-muted-foreground capitalize">{mission.type} mission</p>
                    <RewardList rewards={mission.rewards} />
                    <button
                      onClick={() => handleAcceptMission(slot.slotIndex)}
                      disabled={loading}
                      className="btn-primary w-full mt-4"
                    >
                      Accept Mission
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
          )}
        </div>
      )}
    </div>
  );
}
