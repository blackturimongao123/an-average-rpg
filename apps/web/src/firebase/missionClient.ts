import { doc, serverTimestamp, writeBatch } from "firebase/firestore";
import {
  applyAdventurerRankXp,
  MISSION_COOLDOWN_MS,
  XP_PER_LEVEL,
} from "@bloodline/shared/constants";
import {
  advanceMissionCampaign,
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
  Monster,
} from "@bloodline/shared/types";
import { generateSeed, seededRandom } from "@/lib/seededRandom";
import { getBattleReplaySpeeds, simulateBattle } from "@/lib/combatSim";
import { getMissionTemplate } from "@/lib/missions";
import { MISSION_INTERLUDE_POOLS } from "@/lib/missionInterludePools";
import type { AdvanceMissionResult } from "./functions";
import { db } from "./config";

import dungeonsData from "@game-data/dungeons.json";

const monstersMap = new Map(
  (dungeonsData.monsters as Monster[]).map((m) => [m.id, m])
);

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

export interface AdvanceMissionParams {
  userId: string;
  lineage: Lineage;
  heir: Heir;
  choiceId?: string;
}

export function advanceMissionLocal(params: AdvanceMissionParams): AdvanceMissionResult {
  const { userId, lineage, heir, choiceId } = params;

  if (lineage.ownerUid !== userId) {
    throw new Error("You do not own this lineage");
  }
  if (heir.status !== "alive") {
    throw new Error("Heir is not alive");
  }
  if (!heir.activeMission) {
    throw new Error("No active mission");
  }

  const mission = getMissionTemplate(heir.activeMission.missionId);
  if (!mission) {
    throw new Error("Mission not found");
  }

  const interludeSeed = generateSeed(
    lineage.id,
    heir.id,
    `mission-${mission.id}-interlude-${heir.activeMission.currentStep}`
  );
  const advanceResult = advanceMissionCampaign({
    mission,
    activeMission: heir.activeMission,
    lineage,
    heir,
    adventurerRank: normalizeAdventurerRank(lineage.adventurerRank),
    choiceId,
    interludeChanceRoll: seededRandom(interludeSeed, 0),
    interludePickRoll: seededRandom(interludeSeed, 1),
    interludePools: MISSION_INTERLUDE_POOLS,
  });

  let nextCampaignState = advanceResult.nextCampaignState;
  let battleReplay: BattleReplayPayload | undefined;

  if (advanceResult.combatRequired) {
    const step = advanceResult.resolvedStep;
    const seed = generateSeed(
      lineage.id,
      heir.id,
      `mission-${mission.id}-combat-${advanceResult.resolvedFixedStepIndex}-${advanceResult.resolvedIsInterlude ? "interlude" : "fixed"}`
    );
    const monster = resolveEncounterMonsterFromStep(step);
    if (!monster) {
      throw new Error("Combat encounter not configured");
    }

    const battleResult = simulateBattle(heir, monster, seed);
    const heirMaxHp = calculateMaxHp(heir.stats.constitution, heir.level);
    const { heirSpeed, monsterSpeed, gaugeThreshold } = getBattleReplaySpeeds(heir, monster);

    battleReplay = buildBattleReplayPayload({
      heir: {
        id: heir.id,
        name: heir.name,
        classId: heir.classId,
        level: heir.level,
        stats: heir.stats,
        speed: heirSpeed,
        maxHp: heirMaxHp,
        startHp: heirMaxHp,
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

  if (!advanceResult.completed && advanceResult.nextActiveMission) {
    const nextMission: ActiveMission = {
      ...advanceResult.nextActiveMission,
      campaignState: nextCampaignState,
    };
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
    const xpForNextLevel = XP_PER_LEVEL(heir.level);
    const newGold = heir.gold + rewards.gold;
    const newXp = heir.xp + rewards.xp;
    const leveledUp = newXp >= xpForNextLevel;
    const finalXp = leveledUp ? newXp - xpForNextLevel : newXp;
    const finalLevel = leveledUp ? heir.level + 1 : heir.level;

    const rankResult = applyAdventurerRankXp(
      normalizeAdventurerRank(lineage.adventurerRank),
      lineage.adventurerRankXp ?? 0,
      rewards.rankXp
    );

    return {
      completed: true,
      activeMission: null,
      battleReplay,
      stepText: mission.campaign.steps[mission.campaign.steps.length - 1].text,
      rewards,
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

  throw new Error("Unexpected mission advance state");
}

export async function persistAdvanceMission(
  params: AdvanceMissionParams,
  result: AdvanceMissionResult
): Promise<void> {
  const { lineage, heir } = params;
  const lineageRef = doc(db, "lineages", lineage.id);
  const heirRef = doc(db, "lineages", lineage.id, "heirs", heir.id);
  const batch = writeBatch(db);

  if (result.missionFailed) {
    const missionId = heir.activeMission!.missionId;
    const cooldownExpiresAtMs = Date.now() + MISSION_COOLDOWN_MS;
    batch.update(heirRef, {
      activeMission: null,
      missionCooldowns: {
        ...(heir.missionCooldowns ?? {}),
        [missionId]: cooldownExpiresAtMs,
      },
    });
    batch.update(lineageRef, { updatedAt: serverTimestamp() });
    await batch.commit();
    return;
  }

  if (!result.completed && result.activeMission) {
    batch.update(heirRef, { activeMission: result.activeMission });
    await batch.commit();
    return;
  }

  if (result.completed && result.rewards) {
    const xpForNextLevel = XP_PER_LEVEL(heir.level);
    const newXp = heir.xp + result.rewards.xp;
    const leveledUp = newXp >= xpForNextLevel;
    const finalXp = leveledUp ? newXp - xpForNextLevel : newXp;
    const finalLevel = leveledUp ? heir.level + 1 : heir.level;

    batch.update(heirRef, {
      gold: result.heirGoldAfter!,
      xp: finalXp,
      level: finalLevel,
      inventory: [...heir.inventory, ...result.rewards.items],
      activeMission: null,
      completedMissionIds: [
        ...new Set([
          ...(heir.completedMissionIds ?? []),
          heir.activeMission!.missionId,
        ]),
      ],
    });

    batch.update(lineageRef, {
      adventurerRank: result.adventurerRank,
      adventurerRankXp: result.adventurerRankXp,
      updatedAt: serverTimestamp(),
    });
    await batch.commit();
  }
}
