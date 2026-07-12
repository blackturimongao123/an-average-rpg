import { migrateEquipment } from "@bloodline/shared/equipment";
import {
  simulateGaugeCombat,
  toLegacyBattleRounds,
  computeCombatSpeed,
  getMonsterCombatSpeed,
  type CombatData,
  type CombatItemDef,
  type RandomFn,
} from "@bloodline/shared/combat";
import type { BattleResult, Heir, Monster } from "@bloodline/shared/types";
import { seededRandom } from "./seededRandom";

import combatDataJson from "@game-data/combat.json";
import itemsData from "@game-data/items.json";

const combatData = combatDataJson as CombatData;

const combatItems: CombatItemDef[] = (itemsData.items as Array<Record<string, unknown>>).map(
  (item) => ({
    id: item.id as string,
    weaponDamage: item.weaponDamage as number | undefined,
    stats: item.stats as CombatItemDef["stats"],
    armorValue: item.armorValue as number | undefined,
  })
);

export function getBattleReplaySpeeds(heir: Heir, monster: Monster) {
  return {
    heirSpeed: computeCombatSpeed(heir.stats.dexterity, heir.skillIds, combatData),
    monsterSpeed: getMonsterCombatSpeed(monster.dexterity),
    gaugeThreshold: combatData.gaugeThreshold ?? 100,
  };
}

export function simulateBattle(
  heir: Heir,
  monster: Monster,
  seed: string,
  startingHpPercent = 100
): BattleResult {
  const equipment = migrateEquipment(heir.equipment as unknown as Record<string, unknown>);
  const rand: RandomFn = (index) => seededRandom(seed, index);

  const result = simulateGaugeCombat(
    {
      id: heir.id,
      classId: heir.classId,
      level: heir.level,
      stats: heir.stats,
      skillIds: heir.skillIds,
      equipment: {
        mainWeapon: equipment.mainWeapon,
        armor: equipment.armor,
      },
    },
    {
      id: monster.id,
      name: monster.name,
      hp: monster.hp,
      damage: monster.damage,
      defense: monster.defense,
      dexterity: monster.dexterity,
      traits: monster.traits,
    },
    combatData,
    combatItems,
    rand,
    {
      startingHpPercent,
      xpReward: monster.xpReward,
      goldMin: monster.goldRewardMin,
      goldMax: monster.goldRewardMax,
      lootRolls: monster.lootTable,
    }
  );

  return {
    victory: result.victory,
    heirDied: result.heirDied,
    rounds: toLegacyBattleRounds(result.rounds),
    xpGained: result.xpGained,
    goldGained: result.goldGained,
    itemIds: result.itemIds,
    finalHeirHp: result.finalHeirHp,
    finalEnemyHp: result.finalEnemyHp,
  };
}
