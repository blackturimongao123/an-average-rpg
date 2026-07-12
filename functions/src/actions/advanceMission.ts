import { onCall, HttpsError } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import {
  applyAdventurerRankXp,
  MISSION_COOLDOWN_MS,
  XP_PER_LEVEL,
} from "@bloodline/shared/constants";
import {
  advanceMissionCampaign,
  areMainMissionObjectivesComplete,
  createInitialCampaignState,
} from "@bloodline/shared/campaign";
import { activeMissionToAdventure } from "@bloodline/shared/adventure";
import { buildBattleReplayPayload, calculateMaxHp } from "@bloodline/shared/combat";
import type {
  ActiveMission,
  AdventurerRank,
  BattleReplayPayload,
  Heir,
  Lineage,
  MissionCampaignStep,
  MissionTemplate,
} from "@bloodline/shared/types";
import { db } from "../index.js";
import { generateSeed, seededRandom } from "../utils/helpers.js";
import { simulateBattle, getBattleReplaySpeeds } from "../utils/combat.js";
import { getMissionTemplate } from "../utils/missions.js";
import type { Heir as FunctionsHeir, Lineage as FunctionsLineage, Monster } from "../utils/types.js";
import { addHeirDeathToBatch } from "../utils/death.js";

import dungeonsData from "../../../game-data/dungeons.json";
import interludesData from "../../../game-data/mission-interludes.json";
import type { MissionInterludePools } from "@bloodline/shared/campaign";
import type { MissionRandomEvent, MissionSecretEvent, MissionUniqueEvent } from "@bloodline/shared/types";

const MISSION_INTERLUDE_POOLS: MissionInterludePools = {
  randomEvents: interludesData.randomEvents as MissionRandomEvent[],
  secretEvents: interludesData.secretEvents as MissionSecretEvent[],
  uniqueEvents: (interludesData.uniqueEvents ?? []) as MissionUniqueEvent[],
};

const monstersMap = new Map(dungeonsData.monsters.map((m) => [m.id, m as Monster]));

interface AdvanceMissionRequest {
  lineageId: string;
  heirId: string;
  choiceId?: string;
  expectedRevision?: number;
}

interface AdvanceMissionResponse {
  completed: boolean;
  activeMission: ActiveMission | null;
  battleReplay?: BattleReplayPayload;
  stepText?: string;
  rewards?: {
    gold: number;
    xp: number;
    rankXp: number;
    items: string[];
  } | null;
  rankUp?: { rank: AdventurerRank; rankXp: number } | null;
  heirGoldAfter?: number;
  heirXpAfter?: number;
  leveledUp?: boolean;
  heirLevelAfter?: number;
  adventurerRank?: AdventurerRank;
  adventurerRankXp?: number;
  missionFailed?: boolean;
}

function normalizeAdventurerRank(rank: unknown): AdventurerRank {
  const valid = ["F", "E", "D", "C", "B", "A", "S", "SS", "SSS"] as const;
  return valid.includes(rank as AdventurerRank) ? (rank as AdventurerRank) : "F";
}

function resolveEncounterMonsterFromStep(step: MissionCampaignStep): Monster | null {
  const encounter = step.combatEncounter;
  if (!encounter?.monsterId) return null;

  const base = monstersMap.get(encounter.monsterId);
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

export const advanceMission = onCall<AdvanceMissionRequest>(
  { cors: true },
  async (request): Promise<AdvanceMissionResponse> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be signed in");
    }

    const { lineageId, heirId, choiceId, expectedRevision = 0 } = request.data;
    if (!lineageId || !heirId) {
      throw new HttpsError("invalid-argument", "Missing required fields");
    }

    const uid = request.auth.uid;
    const lineageRef = db.collection("lineages").doc(lineageId);
    const heirRef = lineageRef.collection("heirs").doc(heirId);

    const [lineageDoc, heirDoc] = await Promise.all([lineageRef.get(), heirRef.get()]);
    if (!lineageDoc.exists || !heirDoc.exists) {
      throw new HttpsError("not-found", "Lineage or heir not found");
    }

    const lineage = lineageDoc.data() as Lineage;
    const heir = { ...heirDoc.data(), id: heirDoc.id } as Heir;

    if (lineage.ownerUid !== uid) {
      throw new HttpsError("permission-denied", "You do not own this lineage");
    }
    if (lineage.activeHeirId !== heirId || heir.status !== "alive") {
      throw new HttpsError("failed-precondition", "Heir is not active");
    }
    if (heir.activeJobShift && heir.activeJobShift.endsAtMs > Date.now()) {
      throw new HttpsError("failed-precondition", "Heir is working a job shift");
    }
    if (!heir.activeMission) {
      throw new HttpsError("failed-precondition", "No active mission");
    }

    const mission = getMissionTemplate(heir.activeMission.missionId);
    if (!mission) {
      throw new HttpsError("not-found", "Mission not found");
    }

    const interludeSeed = generateSeed(
      lineageId,
      heirId,
      `mission-${mission.id}-interlude-${heir.activeMission.currentStep}`
    );
    const scavengeSeed = generateSeed(
      lineageId,
      heirId,
      `mission-${mission.id}-scavenge-${heir.activeMission.currentStep}-${choiceId ?? "none"}`
    );
    let advanceResult: ReturnType<typeof advanceMissionCampaign>;
    try {
      advanceResult = advanceMissionCampaign({
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
        interludePools: MISSION_INTERLUDE_POOLS,
      });
    } catch (error) {
      throw new HttpsError(
        "failed-precondition",
        error instanceof Error ? error.message : "Mission choice could not be resolved"
      );
    }

    const reservedRevision = await db.runTransaction(async (transaction) => {
      const freshHeirDoc = await transaction.get(heirRef);
      const freshHeir = freshHeirDoc.data() as Heir | undefined;
      if (!freshHeir?.activeMission) {
        throw new HttpsError("failed-precondition", "No active mission");
      }
      const currentRevision = freshHeir.activeMission.revision ?? 0;
      if (currentRevision !== expectedRevision) {
        throw new HttpsError("aborted", "Mission state changed; refresh and try again");
      }
      const nextRevision = currentRevision + 1;
      transaction.update(heirRef, { "activeMission.revision": nextRevision });
      return nextRevision;
    });
    heir.activeMission = { ...heir.activeMission, revision: reservedRevision };

    let nextCampaignState = advanceResult.nextCampaignState;
    let battleReplay: BattleReplayPayload | undefined;

    if (advanceResult.combatRequired) {
      const step = advanceResult.resolvedStep;
      const seed = generateSeed(
        lineageId,
        heirId,
        `mission-${mission.id}-combat-${advanceResult.resolvedFixedStepIndex}-${advanceResult.resolvedIsInterlude ? "interlude" : "fixed"}`
      );
      const monster = resolveEncounterMonsterFromStep(step);
      if (!monster) {
        throw new HttpsError("internal", "Combat encounter not configured");
      }

      const battleStartHpPercent = nextCampaignState.hpPercent;
      const battleResult = simulateBattle(
        heir as unknown as FunctionsHeir,
        monster,
        seed,
        battleStartHpPercent
      );
      const heirMaxHp = calculateMaxHp(heir.stats.constitution, heir.level);
      const { heirSpeed, monsterSpeed, gaugeThreshold } = getBattleReplaySpeeds(
        heir as unknown as FunctionsHeir,
        monster
      );

      battleReplay = buildBattleReplayPayload({
        heir: {
          id: heir.id,
          name: heir.name,
          classId: heir.classId,
          level: heir.level,
          stats: heir.stats,
          speed: heirSpeed,
          maxHp: heirMaxHp,
          startHp: Math.max(1, Math.round(heirMaxHp * (battleStartHpPercent / 100))),
        },
        monster: {
          id: monster.id,
          name: monster.name,
          hp: monster.hp,
          speed: monsterSpeed,
        },
        rounds: battleResult.rounds,
        victory: battleResult.victory,
        gaugeThreshold,
        sceneImage: step.sceneImage,
        sceneGradient: step.sceneGradient,
      });

      const hpPercent = Math.max(
        5,
        Math.min(100, Math.round((battleResult.finalHeirHp / heirMaxHp) * 100))
      );
      nextCampaignState = {
        ...nextCampaignState,
        hpPercent,
        eventLog: [
          ...nextCampaignState.eventLog,
          {
            text: battleResult.victory
              ? `Victory against ${monster.name}`
              : `Defeated by ${monster.name}`,
            timestampMs: Date.now(),
          },
        ],
      };

      if (!battleResult.victory || battleResult.heirDied) {
        const missionId = heir.activeMission.missionId;
        const cooldownExpiresAtMs = Date.now() + MISSION_COOLDOWN_MS;
        const batch = db.batch();
        if (battleResult.heirDied) {
          await addHeirDeathToBatch({
            batch,
            lineageRef,
            heirRef,
            lineage: lineage as unknown as FunctionsLineage,
            heir: heir as unknown as FunctionsHeir,
            deathCause: `mission:${mission.id}:${advanceResult.resolvedFixedStepIndex}:${monster.id}`,
          });
        } else {
          batch.update(heirRef, {
            activeMission: null,
            missionCooldowns: {
              ...(heir.missionCooldowns ?? {}),
              [missionId]: cooldownExpiresAtMs,
            },
          });
          batch.update(lineageRef, { updatedAt: FieldValue.serverTimestamp() });
        }
        await batch.commit();

        return {
          completed: false,
          activeMission: null,
          battleReplay,
          missionFailed: true,
          stepText: step.text,
          rewards: null,
          rankUp: null,
        };
      }
    }

    if (!advanceResult.completed && nextCampaignState.stagesRemaining <= 0) {
      if (areMainMissionObjectivesComplete(mission, nextCampaignState)) {
        nextCampaignState = {
          ...nextCampaignState,
          eventLog: [
            ...nextCampaignState.eventLog,
            {
              text: "The stage limit was reached after completing the main objective. Forced extraction succeeded.",
              timestampMs: Date.now(),
            },
          ],
        };
        advanceResult = {
          ...advanceResult,
          completed: true,
          nextActiveMission: null,
          nextCampaignState,
        };
      } else {
        const missionId = heir.activeMission.missionId;
        const cooldownExpiresAtMs = Date.now() + MISSION_COOLDOWN_MS;
        await heirRef.update({
          activeMission: null,
          missionCooldowns: {
            ...(heir.missionCooldowns ?? {}),
            [missionId]: cooldownExpiresAtMs,
          },
        });
        await lineageRef.update({ updatedAt: FieldValue.serverTimestamp() });
        return {
          completed: false,
          activeMission: null,
          battleReplay,
          missionFailed: true,
          stepText: "The contract ran out of time.",
          rewards: null,
          rankUp: null,
        };
      }
    }

    if (!advanceResult.completed && advanceResult.nextActiveMission) {
      const nextMission: ActiveMission = {
        ...advanceResult.nextActiveMission,
        campaignState: nextCampaignState,
      };

      await heirRef.update({
        activeMission: nextMission,
        seenUniqueMissionEventIds: [
          ...new Set([
            ...(heir.seenUniqueMissionEventIds ?? []),
            ...(nextCampaignState.seenUniqueInterludeIds ?? []),
          ]),
        ],
      });

      const nextDisplay = activeMissionToAdventure(mission, nextMission);
      return {
        completed: false,
        activeMission: nextMission,
        battleReplay,
        stepText: nextDisplay.step.text,
        rewards: null,
        rankUp: null,
      };
    }

    if (advanceResult.completed) {
      const rewards = mission.rewards;
      const runState = advanceResult.nextCampaignState;
      const bonusGold = runState.runGold ?? 0;
      const bonusXp = runState.runXp ?? 0;
      const bonusItems = runState.runItems ?? [];
      const xpForNextLevel = XP_PER_LEVEL(heir.level);
      const newGold = heir.gold + rewards.gold + bonusGold;
      const newXp = heir.xp + rewards.xp + bonusXp;
      const leveledUp = newXp >= xpForNextLevel;
      const finalXp = leveledUp ? newXp - xpForNextLevel : newXp;
      const finalLevel = leveledUp ? heir.level + 1 : heir.level;
      const newInventory = [...heir.inventory, ...rewards.items, ...bonusItems];

      const rankResult = applyAdventurerRankXp(
        normalizeAdventurerRank(lineage.adventurerRank),
        lineage.adventurerRankXp ?? 0,
        rewards.rankXp
      );

      await heirRef.update({
        gold: newGold,
        xp: finalXp,
        level: finalLevel,
        inventory: newInventory,
        activeMission: null,
        completedMissionIds: [
          ...new Set([
            ...(heir.completedMissionIds ?? []),
            heir.activeMission!.missionId,
          ]),
        ],
        seenUniqueMissionEventIds: [
          ...new Set([
            ...(heir.seenUniqueMissionEventIds ?? []),
            ...(runState.seenUniqueInterludeIds ?? []),
          ]),
        ],
      });
      await lineageRef.update({
        adventurerRank: rankResult.rank,
        adventurerRankXp: rankResult.rankXp,
        updatedAt: FieldValue.serverTimestamp(),
      });

      return {
        completed: true,
        activeMission: null,
        battleReplay,
        stepText: mission.campaign.steps[mission.campaign.steps.length - 1].text,
        rewards: {
          ...rewards,
          gold: rewards.gold + bonusGold,
          xp: rewards.xp + bonusXp,
          items: [...rewards.items, ...bonusItems],
        },
        rankUp: rankResult.rankedUp
          ? { rank: rankResult.rank, rankXp: rankResult.rankXp }
          : null,
        heirGoldAfter: newGold,
        heirXpAfter: finalXp,
        leveledUp,
        heirLevelAfter: finalLevel,
        adventurerRank: rankResult.rank,
        adventurerRankXp: rankResult.rankXp,
      };
    }

    throw new HttpsError("internal", "Unexpected mission advance state");
  }
);
