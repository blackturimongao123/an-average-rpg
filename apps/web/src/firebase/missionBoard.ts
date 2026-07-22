import { doc, serverTimestamp, setDoc, updateDoc, writeBatch } from "firebase/firestore";
import {
  advanceMissionCampaign,
  areMainMissionObjectivesComplete,
  createInitialCampaignState,
  type MissionInterludePools,
} from "@bloodline/shared/campaign";
import { activeMissionToAdventure } from "@bloodline/shared/adventure";
import {
  buildBattleReplayPayload,
  calculateMaxHp,
  expandBattleReplayForParty,
  type CombatData,
  type PartyReplayAlly,
} from "@bloodline/shared/combat";
import { applyAdventurerRankXp, MISSION_COOLDOWN_MS, XP_PER_LEVEL } from "@bloodline/shared/constants";
import type {
  ActiveMission,
  Heir,
  Lineage,
  MissionBoard,
  MissionCampaignStep,
  MissionRandomEvent,
  MissionSecretEvent,
  MissionUniqueEvent,
  Monster,
} from "@bloodline/shared/types";
import type { AdvanceMissionResult } from "./functions";
import { killHeir } from "./functions";
import { db } from "./config";
import {
  boardNeedsReroll,
  createMissionBoard,
  getMissionTemplate,
  normalizeAdventurerRank,
  rerollMissionBoard,
} from "@/lib/missions";
import { generateSeed, seededRandom } from "@/lib/seededRandom";
import { getBattleReplaySpeeds, simulateBattle } from "@/lib/combatSim";

import combatDataJson from "@game-data/combat.json";
import dungeonsData from "@game-data/dungeons.json";
import interludesData from "@game-data/mission-interludes.json";

const combatData = combatDataJson as CombatData;
const monsters = new Map(dungeonsData.monsters.map((monster) => [monster.id, monster as Monster]));
const interludePools: MissionInterludePools = {
  randomEvents: interludesData.randomEvents as MissionRandomEvent[],
  secretEvents: interludesData.secretEvents as MissionSecretEvent[],
  uniqueEvents: (interludesData.uniqueEvents ?? []) as MissionUniqueEvent[],
};

function eligibilityContext(lineage: Lineage, heir: Heir) {
  return {
    lineage: { generation: lineage.generation, publicSummary: lineage.publicSummary },
    heir: {
      level: heir.level,
      stats: heir.stats,
      classId: heir.classId,
      completedMissionIds: heir.completedMissionIds ?? [],
    },
    adventurerRank: normalizeAdventurerRank(lineage.adventurerRank),
  };
}

function reportSaveError(context: string, error: unknown) {
  console.error(`Failed to save ${context}`, error);
}

function firestoreSafe<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function getPlayerMissionBoard(
  userId: string,
  lineage: Lineage,
  heir: Heir,
  existing: MissionBoard | null
) {
  void userId;
  const rank = normalizeAdventurerRank(lineage.adventurerRank);
  const board = boardNeedsReroll(existing)
    ? existing
      ? rerollMissionBoard(lineage.id, existing, rank, heir.level, Date.now(), eligibilityContext(lineage, heir))
      : createMissionBoard(lineage.id, rank, heir.level, Date.now(), eligibilityContext(lineage, heir))
    : existing!;

  if (board !== existing) {
    void setDoc(doc(db, "lineages", lineage.id, "missionBoard", "current"), board)
      .catch((error) => reportSaveError("mission board", error));
  }
  return { board, adventurerRank: rank, adventurerRankXp: lineage.adventurerRankXp ?? 0 };
}

export function acceptPlayerMission(
  userId: string,
  lineage: Lineage,
  heir: Heir,
  board: MissionBoard,
  slotIndex: number
) {
  const slot = board.slots.find((entry) => entry.slotIndex === slotIndex);
  if (!slot?.missionId || slot.status !== "available") throw new Error("Mission is no longer available");
  const mission = getMissionTemplate(slot.missionId);
  if (!mission) throw new Error("Mission not found");
  if (heir.activeMission) throw new Error("Mission already active");
  if (heir.activeJobShift && heir.activeJobShift.endsAtMs > Date.now()) throw new Error("Heir is working a job shift");
  if ((heir.missionCooldowns?.[mission.id] ?? 0) > Date.now()) throw new Error("Mission is on cooldown");

  const activeMission: ActiveMission = {
    missionId: mission.id,
    missionName: mission.name,
    difficulty: mission.difficulty,
    slotIndex,
    currentStep: 0,
    totalSteps: mission.campaign.steps.length,
    startedAtMs: Date.now(),
    campaignState: createInitialCampaignState(mission),
    revision: 0,
  };
  const nextBoard: MissionBoard = {
    ...board,
    slots: board.slots.map((entry) =>
      entry.slotIndex === slotIndex
        ? { slotIndex, missionId: null, difficulty: null, status: "empty" }
        : entry
    ),
  };

  const batch = writeBatch(db);
  batch.set(doc(db, "lineages", lineage.id, "missionBoard", "current"), nextBoard);
  batch.update(doc(db, "lineages", lineage.id, "heirs", heir.id), {
    activeMission: firestoreSafe(activeMission),
  });
  if (lineage.partyId) {
    batch.update(doc(db, "parties", lineage.partyId), {
      activeMission: firestoreSafe({
        ...activeMission,
        leaderUid: userId,
        leaderLineageId: lineage.id,
        leaderHeirId: heir.id,
        updatedAtMs: Date.now(),
        pendingBattle: null,
        outcome: null,
      }),
    });
  }
  void batch.commit().catch((error) => reportSaveError("accepted mission", error));
  return { activeMission, mission, board: nextBoard };
}

function encounterMonster(step: MissionCampaignStep): Monster | null {
  const encounter = step.combatEncounter;
  if (!encounter?.monsterId) return null;
  const base = monsters.get(encounter.monsterId);
  if (!base) return null;
  const scale = encounter.levelScale ?? 1;
  return {
    ...base,
    hp: Math.floor(base.hp * scale),
    damage: Math.floor(base.damage * scale),
    defense: Math.floor(base.defense * scale),
    xpReward: Math.floor(base.xpReward * scale),
    goldRewardMin: Math.floor(base.goldRewardMin * scale),
    goldRewardMax: Math.floor(base.goldRewardMax * scale),
  };
}

export async function advancePlayerMission(
  userId: string,
  lineage: Lineage,
  heir: Heir,
  choiceId?: string,
  partyAllies?: PartyReplayAlly[],
  options?: { deferPersist?: boolean }
): Promise<AdvanceMissionResult> {
  void userId;
  void options;
  if (!heir.activeMission) throw new Error("No active mission");
  const mission = getMissionTemplate(heir.activeMission.missionId);
  if (!mission) throw new Error("Mission not found");

  const stepNumber = heir.activeMission.currentStep;
  const interludeSeed = generateSeed(lineage.id, heir.id, `mission-${mission.id}-interlude-${stepNumber}`);
  const scavengeSeed = generateSeed(lineage.id, heir.id, `mission-${mission.id}-scavenge-${stepNumber}-${choiceId ?? "none"}`);
  let advance = advanceMissionCampaign({
    mission,
    activeMission: heir.activeMission,
    lineage,
    heir,
    adventurerRank: normalizeAdventurerRank(lineage.adventurerRank),
    choiceId,
    interludeChanceRoll: seededRandom(interludeSeed, 0),
    interludePickRoll: seededRandom(interludeSeed, 1),
    scavengeRoll: seededRandom(scavengeSeed, 0),
    scavengePickRoll: seededRandom(scavengeSeed, 1),
    interludePools,
  });
  let nextCampaignState = advance.nextCampaignState;
  let battleReplay;

  if (advance.combatRequired) {
    const step = advance.resolvedStep;
    const monster = encounterMonster(step);
    if (!monster) throw new Error("Combat encounter not configured");
    const seed = generateSeed(lineage.id, heir.id, `mission-${mission.id}-combat-${advance.resolvedFixedStepIndex}-${advance.resolvedIsInterlude ? "interlude" : "fixed"}`);
    const startHpPercent = nextCampaignState.hpPercent;
    const battle = simulateBattle(heir, monster, seed, startHpPercent);
    const maxHp = calculateMaxHp(heir.stats.constitution, heir.level);
    const speeds = getBattleReplaySpeeds(heir, monster);
    battleReplay = buildBattleReplayPayload({
      heir: { id: heir.id, name: heir.name, classId: heir.classId, level: heir.level, stats: heir.stats, speed: speeds.heirSpeed, maxHp, startHp: Math.max(1, Math.round(maxHp * startHpPercent / 100)) },
      monster: { id: monster.id, name: monster.name, hp: monster.hp, speed: speeds.monsterSpeed },
      rounds: battle.rounds,
      victory: battle.victory,
      gaugeThreshold: speeds.gaugeThreshold,
      sceneImage: step.sceneImage,
      sceneGradient: step.sceneGradient,
    });
    if (partyAllies && partyAllies.length > 1) {
      battleReplay = expandBattleReplayForParty(battleReplay, heir.id, partyAllies, combatData);
    }
    nextCampaignState = {
      ...nextCampaignState,
      hpPercent: Math.max(5, Math.min(100, Math.round(battle.finalHeirHp / maxHp * 100))),
      eventLog: [...nextCampaignState.eventLog, { text: battle.victory ? `Victory against ${monster.name}` : `Defeated by ${monster.name}`, timestampMs: Date.now() }],
    };
    if (!battle.victory || battle.heirDied) {
      if (battle.heirDied) {
        void killHeir({ lineageId: lineage.id, heirId: heir.id, deathCause: `mission:${mission.id}:${advance.resolvedFixedStepIndex}:${monster.id}` })
          .catch((error) => reportSaveError("mission death", error));
      } else {
        void updateDoc(doc(db, "lineages", lineage.id, "heirs", heir.id), {
          activeMission: null,
          missionCooldowns: { ...(heir.missionCooldowns ?? {}), [mission.id]: Date.now() + MISSION_COOLDOWN_MS },
        }).catch((error) => reportSaveError("failed mission", error));
      }
      return { completed: false, activeMission: null, battleReplay, missionFailed: true, stepText: step.text, rewards: null, rankUp: null };
    }
  }

  if (!advance.completed && nextCampaignState.stagesRemaining <= 0) {
    if (areMainMissionObjectivesComplete(mission, nextCampaignState)) {
      nextCampaignState = { ...nextCampaignState, eventLog: [...nextCampaignState.eventLog, { text: "The stage limit was reached after completing the main objective. Forced extraction succeeded.", timestampMs: Date.now() }] };
      advance = { ...advance, completed: true, nextActiveMission: null, nextCampaignState };
    } else {
      void updateDoc(doc(db, "lineages", lineage.id, "heirs", heir.id), {
        activeMission: null,
        missionCooldowns: { ...(heir.missionCooldowns ?? {}), [mission.id]: Date.now() + MISSION_COOLDOWN_MS },
      }).catch((error) => reportSaveError("timed-out mission", error));
      return { completed: false, activeMission: null, battleReplay, missionFailed: true, stepText: "The contract ran out of time.", rewards: null, rankUp: null };
    }
  }

  if (!advance.completed && advance.nextActiveMission) {
    const nextMission: ActiveMission = {
      ...advance.nextActiveMission,
      revision: (heir.activeMission.revision ?? 0) + 1,
      campaignState: nextCampaignState,
    };
    void updateDoc(doc(db, "lineages", lineage.id, "heirs", heir.id), {
      activeMission: firestoreSafe(nextMission),
      seenUniqueMissionEventIds: [...new Set([...(heir.seenUniqueMissionEventIds ?? []), ...(nextCampaignState.seenUniqueInterludeIds ?? [])])],
    }).catch((error) => reportSaveError("mission progress", error));
    return { completed: false, activeMission: nextMission, battleReplay, stepText: activeMissionToAdventure(mission, nextMission).step.text, rewards: null, rankUp: null };
  }

  const rewards = mission.rewards;
  const run = advance.nextCampaignState;
  const totalGold = rewards.gold + (run.runGold ?? 0);
  const totalXp = rewards.xp + (run.runXp ?? 0);
  const items = [...rewards.items, ...(run.runItems ?? [])];
  const accruedXp = heir.xp + totalXp;
  const leveledUp = accruedXp >= XP_PER_LEVEL(heir.level);
  const finalXp = leveledUp ? accruedXp - XP_PER_LEVEL(heir.level) : accruedXp;
  const finalLevel = leveledUp ? heir.level + 1 : heir.level;
  const rankResult = applyAdventurerRankXp(normalizeAdventurerRank(lineage.adventurerRank), lineage.adventurerRankXp ?? 0, rewards.rankXp);
  const batch = writeBatch(db);
  batch.update(doc(db, "lineages", lineage.id, "heirs", heir.id), {
    gold: heir.gold + totalGold,
    xp: finalXp,
    level: finalLevel,
    inventory: [...heir.inventory, ...items],
    activeMission: null,
    completedMissionIds: [...new Set([...(heir.completedMissionIds ?? []), mission.id])],
    seenUniqueMissionEventIds: [...new Set([...(heir.seenUniqueMissionEventIds ?? []), ...(run.seenUniqueInterludeIds ?? [])])],
  });
  batch.update(doc(db, "lineages", lineage.id), { adventurerRank: rankResult.rank, adventurerRankXp: rankResult.rankXp, updatedAt: serverTimestamp() });
  void batch.commit().catch((error) => reportSaveError("mission rewards", error));
  return {
    completed: true,
    activeMission: null,
    battleReplay,
    stepText: mission.campaign.steps[mission.campaign.steps.length - 1].text,
    rewards: { ...rewards, gold: totalGold, xp: totalXp, items },
    rankUp: rankResult.rankedUp ? { rank: rankResult.rank, rankXp: rankResult.rankXp } : null,
    heirGoldAfter: heir.gold + totalGold,
    heirXpAfter: finalXp,
    leveledUp,
    heirLevelAfter: finalLevel,
    adventurerRank: rankResult.rank,
    adventurerRankXp: rankResult.rankXp,
  };
}

export async function persistPlayerMissionAdvance(
  userId: string,
  lineage: Lineage,
  heir: Heir,
  choiceId: string | undefined,
  result: AdvanceMissionResult
): Promise<void> {
  void userId;
  void lineage;
  void heir;
  void choiceId;
  void result;
}
