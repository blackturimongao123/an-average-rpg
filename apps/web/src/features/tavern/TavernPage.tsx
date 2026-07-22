import { useState, useEffect, useMemo, useRef } from "react";
import { useGameStore } from "@/stores/gameStore";
import { BusyActivityBlock, useIsHeirBusyOnJob } from "@/components/game/BusyActivityBlock";
import { useAuthStore } from "@/stores/authStore";
import { useMissionBoard } from "@/hooks/useMissionBoard";
import {
  acceptPlayerMission,
  advancePlayerMission,
  persistPlayerMissionAdvance,
} from "@/firebase/missionBoard";
import type { AdvanceMissionResult } from "@/firebase/functions";
import { abandonMission } from "@/firebase/functions";
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
  Crown,
  Medal,
  Scroll,
  Star,
  Users,
} from "lucide-react";
import { usePartyMembers } from "@/hooks/usePartyMembers";
import { useFunctionWarmup } from "@/hooks/useFunctionWarmup";
import type { AdventurePartyMember } from "@/features/adventure/AdventureEventView";
import { buildPartyReplayAllies } from "@/lib/partyBattle";
import {
  clearPartyMission,
  clearPartyMissionOutcome,
  clearPartyMissionPendingBattle,
  finalizePartyMission,
  setPartyMissionPendingBattle,
  syncPartyMissionState,
} from "@/firebase/partyMissionClient";

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
  const { party, members } = usePartyMembers(lineage?.partyId);
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
    choiceId?: string;
  } | null>(null);
  const dismissedOutcomeAtMsRef = useRef(0);
  useFunctionWarmup(["acceptMission", "advanceMission"]);

  const inParty = Boolean(lineage?.partyId && party);
  const isPartyLeader = inParty && party?.leaderUid === user?.uid;
  const partyMission = party?.activeMission ?? null;

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

  const partyReplayAllies = useMemo(() => {
    if (!heir || !inParty || members.length <= 1) return undefined;
    return buildPartyReplayAllies(heir, members);
  }, [heir, inParty, members]);

  useEffect(() => {
    if (!inParty || !partyMission?.pendingBattle || isPartyLeader) return;
    const pending = partyMission.pendingBattle;
    if (missionBattle?.replay === pending.battleReplay) return;

    setMissionBattle({
      replay: pending.battleReplay,
      response: {
        completed: pending.completed ?? false,
        activeMission: heir?.activeMission ?? null,
        missionFailed: pending.missionFailed,
        stepText: "",
        rewards: pending.completed ? party?.lastMissionOutcome?.rewards ?? null : null,
        rankUp: pending.completed ? party?.lastMissionOutcome?.rankUp ?? null : null,
      },
      choiceLabel: pending.choiceLabel,
    });
  }, [
    inParty,
    isPartyLeader,
    partyMission?.pendingBattle?.updatedAtMs,
    heir?.activeMission,
    missionBattle?.replay,
    party?.lastMissionOutcome,
  ]);

  useEffect(() => {
    const outcome = party?.lastMissionOutcome;
    if (!outcome || !inParty || isPartyLeader) return;
    if (outcome.updatedAtMs <= dismissedOutcomeAtMsRef.current) return;

    setMissionBattle(null);
    setActiveMission(null);

    if (outcome.missionFailed) {
      setCompletion(null);
      setError("Your heir was defeated. The contract failed.");
      return;
    }

    if (outcome.completed && outcome.rewards) {
      setCompletion({
        rewards: outcome.rewards,
        rankUp: outcome.rankUp ?? null,
      });
      setError("");
    }
  }, [party?.lastMissionOutcome?.updatedAtMs, inParty, isPartyLeader, setActiveMission]);

  const applyAdvanceResponse = async (response: AdvanceMissionResult) => {
    if (response.missionFailed) {
      setActiveMission(null);
      setMissionBattle(null);
      setError("Your heir was defeated. The contract failed.");
      if (inParty && lineage?.partyId && isPartyLeader) {
        await finalizePartyMission(lineage.partyId, {
          completed: false,
          missionFailed: true,
        });
      }
      await refreshBoard();
      return;
    }

    if (response.completed && response.rewards) {
      setActiveMission(null);
      setMissionBattle(null);
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
      if (inParty && lineage?.partyId && isPartyLeader) {
        await finalizePartyMission(lineage.partyId, {
          completed: true,
          rewards: response.rewards,
          adventurerRank: normalizeAdventurerRank(response.adventurerRank),
          adventurerRankXp: response.adventurerRankXp,
          rankUp: response.rankUp ?? null,
        });
      }
      await refreshBoard();
    } else if (response.activeMission) {
      setActiveMission(response.activeMission);
      if (inParty && lineage?.partyId && isPartyLeader && heir) {
        await syncPartyMissionState(lineage.partyId, response.activeMission, {
          uid: user!.uid,
          lineageId: lineage.id,
          heirId: heir.id,
        });
      }
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

    if (inParty && !isPartyLeader) {
      setError("Only the party leader can accept a mission for the group.");
      return;
    }

    if (inParty && partyMission) {
      setError("Your party already has an active mission.");
      return;
    }

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

  const handleAdvanceMission = async (choice: MissionCampaignChoice) => {
    if (!lineage || !heir || !user || !heir.activeMission) return;

    if (inParty && !isPartyLeader) {
      setError("Only the party leader can choose actions for the party.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await advancePlayerMission(
        user.uid,
        lineage,
        heir,
        choice.id,
        partyReplayAllies
      );

      if (response.battleReplay) {
        setMissionBattle({
          replay: response.battleReplay,
          response,
          choiceLabel: choice.label,
          choiceId: choice.id,
        });
        if (inParty && lineage.partyId) {
          void setPartyMissionPendingBattle(lineage.partyId, {
            battleReplay: response.battleReplay,
            choiceLabel: choice.label,
            missionFailed: response.missionFailed,
            completed: response.completed,
          });
        }
        setLoading(false);
        return;
      }

      await applyAdvanceResponse(response);
    } catch (err: unknown) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleMissionBattleContinue = async () => {
    if (!missionBattle || !lineage || !heir || !user) return;
    if (inParty && !isPartyLeader) {
      setMissionBattle(null);
      return;
    }
    const { response, choiceId } = missionBattle;
    setMissionBattle(null);
    if (inParty && lineage.partyId && isPartyLeader) {
      await clearPartyMissionPendingBattle(lineage.partyId);
    }
    setLoading(true);
    try {
      await persistPlayerMissionAdvance(user.uid, lineage, heir, choiceId, response);
      await applyAdvanceResponse(response);
    } catch (err: unknown) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDismissCompletion = async () => {
    if (party?.lastMissionOutcome) {
      dismissedOutcomeAtMsRef.current = party.lastMissionOutcome.updatedAtMs;
    }
    setCompletion(null);
    setError("");
    if (isPartyLeader && lineage?.partyId) {
      try {
        await clearPartyMissionOutcome(lineage.partyId);
      } catch (err: unknown) {
        console.error("Clear party mission outcome error:", err);
      }
    }
    await refreshBoard();
  };

  const handleAbandonMission = async () => {
    if (!lineage || !heir || !user) return;
    if (inParty && !isPartyLeader) {
      setError("Only the party leader can abandon the party mission.");
      return;
    }
    if (!window.confirm("Abandon this contract? Rewards will be lost and a cooldown applies.")) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      await abandonMission({ lineageId: lineage.id, heirId: heir.id });
      if (inParty && lineage.partyId) {
        await clearPartyMission(lineage.partyId);
      }
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
  const missionId = activeMission?.missionId ?? partyMission?.missionId;
  const activeTemplate = missionId ? getMissionTemplate(missionId) : null;

  if (missionBattle && activeTemplate) {
    const enemyName =
      missionBattle.replay.combatants.find((c) => c.side === "enemy")?.name ?? "Enemy";
    const victory = missionBattle.replay.victory;

    return (
      <div className="h-full p-2 md:p-3 overflow-hidden">
        <BattleView
          replay={missionBattle.replay}
          headerLabel={`${(activeMission?.missionName ?? activeTemplate.name).toUpperCase()} — Stage ${(activeMission?.currentStep ?? partyMission?.currentStep ?? 0) + 1}`}
          resultSummary={{
            victory,
            monsterFaced: enemyName,
            choiceLabel: missionBattle.choiceLabel,
            rewards: missionBattle.response.rewards ?? undefined,
            heirDied: missionBattle.response.missionFailed,
          }}
          continueLabel={
            missionBattle.response.missionFailed
              ? "Ok"
              : missionBattle.response.completed
                ? "Ok"
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
          partyMembers={adventurePartyMembers}
          choicesDisabled={inParty && !isPartyLeader}
          leaderHint={
            inParty && !isPartyLeader
              ? "Waiting for the party leader to choose the next action."
              : inParty
                ? "Party expedition — your choices guide the whole group."
                : undefined
          }
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
          <button onClick={() => void handleDismissCompletion()} className="btn-primary mt-6">
            Ok
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
            {inParty && (
              <span className="block mt-1 text-gold/90">
                <Users className="inline w-4 h-4 mr-1" />
                Party active ({members.length} members)
                {isPartyLeader ? (
                  <Crown className="inline w-3.5 h-3.5 ml-1 text-gold" />
                ) : (
                  " — leader accepts missions for the group"
                )}
              </span>
            )}
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
                      disabled={loading || (inParty && !isPartyLeader)}
                      className="btn-primary w-full mt-4"
                    >
                      {inParty ? "Accept for Party" : "Accept Mission"}
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
