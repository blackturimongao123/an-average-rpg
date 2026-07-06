import { onCall, HttpsError } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import { STAT_POINTS_PER_LEVEL } from "@bloodline/shared/constants";
import { getFloorChoiceModifiers } from "@bloodline/shared/adventure";
import { db } from "../index.js";
import {
  generateSeed,
  seededRandomChoice,
} from "../utils/helpers.js";
import { simulateBattle } from "../utils/combat.js";
import type { Heir, Lineage, Monster, BattleRound } from "../utils/types.js";

import dungeonsData from "../../../game-data/dungeons.json";

const dungeons = dungeonsData.dungeons;
const monstersMap = new Map(dungeonsData.monsters.map((m) => [m.id, m as Monster]));

interface ResolveDungeonRequest {
  lineageId: string;
  heirId: string;
  dungeonId: string;
  floor: number;
  floorChoiceId?: string;
}

interface ResolveDungeonResponse {
  battleId: string;
  victory: boolean;
  heirDied: boolean;
  monsterFaced: string;
  rewards: {
    gold: number;
    xp: number;
    items: string[];
  };
  floorCleared: boolean;
  dungeonCompleted: boolean;
  battleRounds: BattleRound[];
}

export const resolveDungeon = onCall<ResolveDungeonRequest>(
  { cors: true },
  async (request): Promise<ResolveDungeonResponse> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be signed in");
    }

    const { lineageId, heirId, dungeonId, floor, floorChoiceId } = request.data;

    if (!lineageId || !heirId || !dungeonId || floor === undefined) {
      throw new HttpsError("invalid-argument", "Missing required fields");
    }

    const uid = request.auth.uid;

    const lineageRef = db.collection("lineages").doc(lineageId);
    const heirRef = lineageRef.collection("heirs").doc(heirId);

    const [lineageDoc, heirDoc] = await Promise.all([
      lineageRef.get(),
      heirRef.get(),
    ]);

    if (!lineageDoc.exists || !heirDoc.exists) {
      throw new HttpsError("not-found", "Lineage or heir not found");
    }

    const lineage = lineageDoc.data() as Lineage;
    const heir = heirDoc.data() as Heir;

    if (lineage.ownerUid !== uid) {
      throw new HttpsError("permission-denied", "You do not own this lineage");
    }

    if (heir.status !== "alive") {
      throw new HttpsError("failed-precondition", "Heir is not alive");
    }

    const dungeon = dungeons.find((d) => d.id === dungeonId);
    if (!dungeon) {
      throw new HttpsError("invalid-argument", "Dungeon not found");
    }

    if (heir.level < dungeon.requiredLevel) {
      throw new HttpsError(
        "failed-precondition",
        `Level ${dungeon.requiredLevel} required for this dungeon`
      );
    }

    const floorData = dungeon.floors[floor - 1];
    if (!floorData) {
      throw new HttpsError("invalid-argument", "Floor not found");
    }

    const modifiers = getFloorChoiceModifiers(
      typeof floorChoiceId === "string" ? floorChoiceId : undefined
    );

    const seed = generateSeed(
      lineageId,
      heirId,
      `dungeon-${dungeonId}-${floor}-${floorChoiceId ?? "default"}-${Date.now()}`
    );

    const monsterId = floorData.bossId || seededRandomChoice(seed, floorData.monsterPool, 0);
    const baseMonster = monstersMap.get(monsterId);

    if (!baseMonster) {
      throw new HttpsError("internal", "Monster data not found");
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

    const batch = db.batch();

    const battleId = `battle_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    batch.set(db.collection("battleLogs").doc(battleId), {
      id: battleId,
      attackerUid: uid,
      defenderUid: null,
      lineageId,
      heirId,
      dungeonId,
      floor,
      floorChoiceId: floorChoiceId ?? null,
      monsterId,
      result: battleResult,
      createdAt: FieldValue.serverTimestamp(),
    });

    let rewards = { gold: 0, xp: 0, items: [] as string[] };

    if (battleResult.victory) {
      rewards = {
        gold: Math.floor(battleResult.goldGained * floorData.lootModifier * modifiers.rewardMult),
        xp: Math.floor(battleResult.xpGained * floorData.xpModifier * modifiers.rewardMult),
        items: battleResult.itemIds,
      };

      const newXp = heir.xp + rewards.xp;
      const xpForNextLevel = heir.level * 100;
      const leveledUp = newXp >= xpForNextLevel;

      batch.update(heirRef, {
        gold: FieldValue.increment(rewards.gold),
        xp: leveledUp ? newXp - xpForNextLevel : newXp,
        level: leveledUp ? heir.level + 1 : heir.level,
        inventory: [...heir.inventory, ...rewards.items],
        ...(leveledUp
          ? { unspentStatPoints: (heir.unspentStatPoints ?? 0) + STAT_POINTS_PER_LEVEL }
          : {}),
      });

      const progressRef = lineageRef.collection("dungeonProgress").doc(dungeonId);
      batch.set(
        progressRef,
        {
          [`clearedFloors.${floor}`]: true,
          highestFloor: floor,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    if (battleResult.heirDied) {
      batch.update(heirRef, {
        status: "dead",
        diedAt: FieldValue.serverTimestamp(),
        deathCause: `dungeon:${dungeonId}:floor${floor}:${monsterId}`,
      });

      batch.update(lineageRef, {
        activeHeirId: null,
        generation: FieldValue.increment(1),
        "publicSummary.deadHeirs": FieldValue.increment(1),
        "publicSummary.highestGeneration": lineage.generation + 1,
        "publicSummary.currentClass": null,
        updatedAt: FieldValue.serverTimestamp(),
      });
    } else {
      batch.update(lineageRef, {
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();

    return {
      battleId,
      victory: battleResult.victory,
      heirDied: battleResult.heirDied,
      monsterFaced: monster.name,
      rewards,
      floorCleared: battleResult.victory,
      dungeonCompleted: battleResult.victory && floor === dungeon.floors.length,
      battleRounds: battleResult.rounds,
    };
  }
);
