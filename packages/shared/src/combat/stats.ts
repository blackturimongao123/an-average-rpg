import type { Stats } from "../types.js";
import type { CombatData, CombatItemDef } from "./types.js";

export function computeEffectiveStats(
  base: Stats,
  equipment: { mainWeapon: string | null; armor: string | null },
  items: CombatItemDef[]
): Stats {
  const result = { ...base };
  const itemMap = new Map(items.map((item) => [item.id, item]));

  for (const itemId of [equipment.mainWeapon, equipment.armor]) {
    if (!itemId) continue;
    const item = itemMap.get(itemId);
    if (!item?.stats) continue;
    for (const [stat, value] of Object.entries(item.stats)) {
      const key = stat as keyof Stats;
      result[key] += value ?? 0;
    }
  }

  return result;
}

export function getWeaponDamage(
  equipment: { mainWeapon: string | null },
  items: CombatItemDef[]
): number {
  if (!equipment.mainWeapon) return 5;
  const item = items.find((entry) => entry.id === equipment.mainWeapon);
  return item?.weaponDamage ?? 5;
}

export function getArmorValue(
  equipment: { armor: string | null },
  items: CombatItemDef[]
): number {
  if (!equipment.armor) return 0;
  const item = items.find((entry) => entry.id === equipment.armor);
  return item?.armorValue ?? Math.floor((item?.stats?.constitution ?? 0) * 2);
}

export function computeCombatSpeed(
  dexterity: number,
  skillIds: string[],
  combatData: CombatData
): number {
  let speed = 8 + dexterity * 1.5;
  if (skillIds.includes("pain_engine")) speed *= 1.15;
  if (skillIds.includes("weapon_flow")) speed *= 1.08;
  return Math.floor(speed);
}

export function calculateMaxHp(constitution: number, level: number): number {
  return 50 + constitution * 10 + level * 8;
}

export function calculateHitChance(attackerDex: number, defenderDex: number): number {
  const base = 70;
  const dexDiff = attackerDex - defenderDex;
  return Math.max(20, Math.min(95, base + dexDiff));
}

export function calculateCritChance(luck: number, bonus = 0): number {
  const base = 5;
  const luckBonus = luck * 0.4;
  return Math.max(5, Math.min(50, base + luckBonus + bonus));
}

export function calculateArmorReduction(armor: number): number {
  return armor / (armor + 100);
}
