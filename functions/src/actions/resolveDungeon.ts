import { onCall, HttpsError } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import { STAT_POINTS_PER_LEVEL } from "@bloodline/shared/constants";
import { db } from "../index.js";
import {
  generateSeed,
  seededRandom,
  seededRandomInt,
  seededRandomChoice,
  calculateMaxHp,
  calculateHitChance,
  calculateCritChance,
  calculateArmorReduction,
} from "../utils/helpers.js";
import type { Heir, Lineage, Monster, BattleResult, BattleRound } from "../utils/types.js";

import dungeonsData from "../../../game-data/dungeons.json";

const dungeons = dungeonsData.dungeons;
const monstersMap = new Map(dungeonsData.monsters.map((m) => [m.id, m as Monster]));

interface ResolveDungeonRequest {
  lineageId: string;
  heirId: string;
  dungeonId: string;
  floor: number;
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

    const { lineageId, heirId, dungeonId, floor } = request.data;

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

    const seed = generateSeed(lineageId, heirId, `dungeon-${dungeonId}-${floor}-${Date.now()}`);

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
      damage: Math.floor(baseMonster.damage * floorScaling),
      defense: Math.floor(baseMonster.defense * floorScaling),
      xpReward: Math.floor(baseMonster.xpReward * floorScaling),
      goldRewardMin: Math.floor(baseMonster.goldRewardMin * floorScaling),
      goldRewardMax: Math.floor(baseMonster.goldRewardMax * floorScaling),
    };

    const battleResult = simulateBattle(heir, monster, seed);

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
      monsterId,
      result: battleResult,
      createdAt: FieldValue.serverTimestamp(),
    });

    let rewards = { gold: 0, xp: 0, items: [] as string[] };

    if (battleResult.victory) {
      rewards = {
        gold: Math.floor(battleResult.goldGained * floorData.lootModifier),
        xp: Math.floor(battleResult.xpGained * floorData.xpModifier),
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

function simulateBattle(heir: Heir, monster: Monster, seed: string): BattleResult {
  let heirHp = calculateMaxHp(heir.stats.constitution, heir.level);
  let monsterHp = monster.hp;

  const rounds: BattleRound[] = [];
  let roundNum = 0;

  const heirDamage = 10 + heir.stats.strength;
  const heirDefense = 5 + Math.floor(heir.stats.constitution / 2);
  const heirHitChance = calculateHitChance(heir.stats.dexterity, monster.dexterity);
  const heirCritChance = calculateCritChance(heir.stats.luck);

  const monsterHitChance = calculateHitChance(monster.dexterity, heir.stats.dexterity);

  const heirGoesFirst = heir.stats.dexterity >= monster.dexterity;

  while (heirHp > 0 && monsterHp > 0 && roundNum < 100) {
    roundNum++;
    const seedIdx = roundNum * 10;

    if (heirGoesFirst) {
      const heirRound = performAttack(
        seed,
        seedIdx,
        heir.id,
        heirDamage,
        heirHitChance,
        heirCritChance,
        monster.defense,
        heirHp,
        monsterHp,
        roundNum
      );
      monsterHp = heirRound.targetHpAfter;
      rounds.push(heirRound);

      if (monsterHp <= 0) break;

      const monsterRound = performAttack(
        seed,
        seedIdx + 5,
        monster.id,
        monster.damage,
        monsterHitChance,
        5,
        heirDefense,
        monsterHp,
        heirHp,
        roundNum
      );
      heirHp = monsterRound.targetHpAfter;
      rounds.push(monsterRound);
    } else {
      const monsterRound = performAttack(
        seed,
        seedIdx,
        monster.id,
        monster.damage,
        monsterHitChance,
        5,
        heirDefense,
        monsterHp,
        heirHp,
        roundNum
      );
      heirHp = monsterRound.targetHpAfter;
      rounds.push(monsterRound);

      if (heirHp <= 0) break;

      const heirRound = performAttack(
        seed,
        seedIdx + 5,
        heir.id,
        heirDamage,
        heirHitChance,
        heirCritChance,
        monster.defense,
        heirHp,
        monsterHp,
        roundNum
      );
      monsterHp = heirRound.targetHpAfter;
      rounds.push(heirRound);
    }
  }

  const victory = monsterHp <= 0 && heirHp > 0;
  const heirDied = heirHp <= 0;

  let xpGained = 0;
  let goldGained = 0;
  const itemIds: string[] = [];

  if (victory) {
    xpGained = monster.xpReward;
    goldGained = seededRandomInt(seed, monster.goldRewardMin, monster.goldRewardMax, 999);

    for (let i = 0; i < monster.lootTable.length; i++) {
      const loot = monster.lootTable[i];
      const roll = seededRandom(seed, 1000 + i) * 100;
      if (roll < loot.weight) {
        const qty = seededRandomInt(seed, loot.minQuantity, loot.maxQuantity, 1001 + i);
        for (let j = 0; j < qty; j++) {
          itemIds.push(loot.itemId);
        }
      }
    }
  }

  return {
    victory,
    heirDied,
    rounds,
    xpGained,
    goldGained,
    itemIds,
    finalHeirHp: Math.max(0, heirHp),
    finalEnemyHp: Math.max(0, monsterHp),
  };
}

function performAttack(
  seed: string,
  seedIdx: number,
  actorId: string,
  baseDamage: number,
  hitChance: number,
  critChance: number,
  targetDefense: number,
  actorHp: number,
  targetHp: number,
  round: number
): BattleRound {
  const hitRoll = seededRandom(seed, seedIdx) * 100;
  const isMiss = hitRoll > hitChance;

  const critRoll = seededRandom(seed, seedIdx + 1) * 100;
  const isCrit = !isMiss && critRoll < critChance;

  let damage = 0;
  if (!isMiss) {
    const rawDamage = isCrit ? baseDamage * 2 : baseDamage;
    const reduction = calculateArmorReduction(targetDefense);
    damage = Math.max(1, Math.floor(rawDamage * (1 - reduction)));
  }

  return {
    round,
    actor: actorId,
    action: isCrit ? "critical_strike" : "attack",
    damage,
    actorHpAfter: actorHp,
    targetHpAfter: Math.max(0, targetHp - damage),
    isCrit,
    isMiss,
  };
}
