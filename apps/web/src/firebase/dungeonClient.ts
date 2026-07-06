import {
  doc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { getFloorChoiceModifiers } from "@bloodline/shared/adventure";
import { buildBattleReplayPayload, calculateMaxHp } from "@bloodline/shared/combat";
import { STAT_POINTS_PER_LEVEL } from "@bloodline/shared/constants";
import type {
  BattleReplayPayload,
  DungeonData,
  Heir,
  Lineage,
  Monster,
} from "@bloodline/shared/types";
import { generateSeed, seededRandomChoice } from "@/lib/seededRandom";
import { getBattleReplaySpeeds, simulateBattle } from "@/lib/combatSim";
import { db } from "./config";

import dungeonsData from "@game-data/dungeons.json";

const monstersMap = new Map(
  (dungeonsData.monsters as Monster[]).map((m) => [m.id, m])
);

export interface ResolveDungeonLocalResult {
  battleReplay: BattleReplayPayload;
  victory: boolean;
  heirDied: boolean;
  monsterFaced: string;
  monsterId: string;
  rewards: { gold: number; xp: number; items: string[] };
  floorCleared: boolean;
  dungeonCompleted: boolean;
}

export interface ResolveDungeonParams {
  userId: string;
  lineage: Lineage;
  heir: Heir;
  dungeon: DungeonData;
  floor: number;
  floorChoiceId?: string;
}

export function resolveDungeonLocal(params: ResolveDungeonParams): ResolveDungeonLocalResult {
  const { userId, lineage, heir, dungeon, floor, floorChoiceId } = params;

  if (lineage.ownerUid !== userId) {
    throw new Error("You do not own this lineage");
  }
  if (heir.status !== "alive") {
    throw new Error("Heir is not alive");
  }
  if (heir.level < dungeon.requiredLevel) {
    throw new Error(`Level ${dungeon.requiredLevel} required for this dungeon`);
  }

  const floorData = dungeon.floors[floor - 1];
  if (!floorData) {
    throw new Error("Floor not found");
  }

  const modifiers = getFloorChoiceModifiers(
    typeof floorChoiceId === "string" ? floorChoiceId : undefined
  );

  const seed = generateSeed(
    lineage.id,
    heir.id,
    `dungeon-${dungeon.id}-${floor}-${floorChoiceId ?? "default"}-${Date.now()}`
  );

  const monsterId =
    floorData.bossId || seededRandomChoice(seed, floorData.monsterPool, 0);
  const baseMonster = monstersMap.get(monsterId);
  if (!baseMonster) {
    throw new Error("Monster data not found");
  }

  const floorScaling = 1.0 + (floor - 1) * 0.15;
  const monster: Monster = {
    ...baseMonster,
    level: baseMonster.level + floor - 1,
    hp: Math.floor(baseMonster.hp * floorScaling),
    damage: Math.floor(baseMonster.damage * floorScaling * modifiers.monsterDamageMult),
    defense: Math.floor(baseMonster.defense * floorScaling),
    xpReward: Math.floor(baseMonster.xpReward * floorScaling),
    goldRewardMin: Math.floor(baseMonster.goldRewardMin * floorScaling),
    goldRewardMax: Math.floor(baseMonster.goldRewardMax * floorScaling),
  };

  const battleHeir: Heir =
    modifiers.heirHealFlat > 0
      ? {
          ...heir,
          stats: {
            ...heir.stats,
            constitution: heir.stats.constitution + Math.floor(modifiers.heirHealFlat / 8),
          },
        }
      : heir;

  const battleResult = simulateBattle(battleHeir, monster, seed);

  const rewards = battleResult.victory
    ? {
        gold: Math.floor(
          battleResult.goldGained * floorData.lootModifier * modifiers.rewardMult
        ),
        xp: Math.floor(battleResult.xpGained * floorData.xpModifier * modifiers.rewardMult),
        items: battleResult.itemIds,
      }
    : { gold: 0, xp: 0, items: [] as string[] };

  const heirMaxHp = calculateMaxHp(battleHeir.stats.constitution, battleHeir.level);
  const approach = floorData.approach;
  const { heirSpeed, monsterSpeed, gaugeThreshold } = getBattleReplaySpeeds(battleHeir, monster);

  const battleReplay = buildBattleReplayPayload({
    heir: {
      id: heir.id,
      name: heir.name,
      classId: heir.classId,
      level: battleHeir.level,
      stats: battleHeir.stats,
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
    sceneImage: approach?.sceneImage,
    sceneGradient: approach?.sceneGradient,
  });

  return {
    battleReplay,
    victory: battleResult.victory,
    heirDied: battleResult.heirDied,
    monsterFaced: monster.name,
    monsterId,
    rewards,
    floorCleared: battleResult.victory,
    dungeonCompleted: battleResult.victory && floor === dungeon.floors.length,
  };
}

export async function persistDungeonResult(
  params: ResolveDungeonParams,
  result: ResolveDungeonLocalResult
): Promise<void> {
  const { lineage, heir, dungeon, floor } = params;
  const lineageRef = doc(db, "lineages", lineage.id);
  const heirRef = doc(db, "lineages", lineage.id, "heirs", heir.id);
  const batch = writeBatch(db);

  if (result.victory) {
    const newXp = heir.xp + result.rewards.xp;
    const xpForNextLevel = heir.level * 100;
    const leveledUp = newXp >= xpForNextLevel;

    batch.update(heirRef, {
      gold: heir.gold + result.rewards.gold,
      xp: leveledUp ? newXp - xpForNextLevel : newXp,
      level: leveledUp ? heir.level + 1 : heir.level,
      inventory: [...heir.inventory, ...result.rewards.items],
      ...(leveledUp
        ? { unspentStatPoints: (heir.unspentStatPoints ?? 0) + STAT_POINTS_PER_LEVEL }
        : {}),
    });

    const progressRef = doc(db, "lineages", lineage.id, "dungeonProgress", dungeon.id);
    batch.set(
      progressRef,
      {
        [`clearedFloors.${floor}`]: true,
        highestFloor: floor,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  if (result.heirDied) {
    batch.update(heirRef, {
      status: "dead",
      diedAt: serverTimestamp(),
      deathCause: `dungeon:${dungeon.id}:floor${floor}:${result.monsterId}`,
    });

    batch.update(lineageRef, {
      activeHeirId: null,
      generation: lineage.generation + 1,
      updatedAt: serverTimestamp(),
      "publicSummary.deadHeirs": (lineage.publicSummary?.deadHeirs ?? 0) + 1,
      "publicSummary.highestGeneration": Math.max(
        lineage.publicSummary?.highestGeneration ?? lineage.generation,
        lineage.generation + 1
      ),
      "publicSummary.currentClass": null,
    });
  } else {
    batch.update(lineageRef, {
      updatedAt: serverTimestamp(),
    });
  }

  await batch.commit();
}
