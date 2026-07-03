import { randomBytes, createHash } from "crypto";
import type { Stats } from "./types.js";

export function generateId(): string {
  return randomBytes(16).toString("hex");
}

export function generateSeed(lineageId: string, heirId: string, context: string): string {
  const input = `${lineageId}-${heirId}-${context}-${Date.now()}`;
  return createHash("sha256").update(input).digest("hex").slice(0, 32);
}

export function seededRandom(seed: string, index: number = 0): number {
  const hash = createHash("sha256").update(`${seed}-${index}`).digest();
  const value = hash.readUInt32BE(0);
  return value / 0xffffffff;
}

export function seededRandomInt(seed: string, min: number, max: number, index: number = 0): number {
  const rand = seededRandom(seed, index);
  return Math.floor(rand * (max - min + 1)) + min;
}

export function seededRandomChoice<T>(seed: string, items: T[], index: number = 0): T {
  const rand = seededRandom(seed, index);
  const idx = Math.floor(rand * items.length);
  return items[idx];
}

export function weightedRandomChoice<T>(
  seed: string,
  items: Array<{ item: T; weight: number }>,
  index: number = 0
): T | null {
  if (items.length === 0) return null;

  const totalWeight = items.reduce((sum, i) => sum + i.weight, 0);
  if (totalWeight === 0) return null;

  const roll = seededRandom(seed, index) * totalWeight;
  let cumulative = 0;

  for (const { item, weight } of items) {
    cumulative += weight;
    if (roll < cumulative) {
      return item;
    }
  }

  return items[items.length - 1].item;
}

export function calculateMaxHp(constitution: number, level: number): number {
  return 50 + constitution * 10 + level * 8;
}

export function calculateDamage(weaponDamage: number, mainStat: number, classScaling: number = 1.0): number {
  return Math.floor(weaponDamage + mainStat * classScaling);
}

export function calculateArmorReduction(armor: number): number {
  return armor / (armor + 100);
}

export function calculateHitChance(attackerDex: number, defenderDex: number): number {
  const base = 70;
  const dexDiff = attackerDex - defenderDex;
  return Math.max(20, Math.min(95, base + dexDiff));
}

export function calculateCritChance(luck: number): number {
  const base = 5;
  const luckBonus = luck * 0.4;
  return Math.max(5, Math.min(50, base + luckBonus));
}

export function applyStatModifiers(
  baseStats: Stats,
  modifiers: Array<{ stat: keyof Stats; type: "flat" | "percent"; value: number }>
): Stats {
  const result = { ...baseStats };
  const percentMods: Partial<Record<keyof Stats, number>> = {};

  for (const mod of modifiers) {
    if (mod.type === "flat") {
      result[mod.stat] += mod.value;
    } else if (mod.type === "percent") {
      percentMods[mod.stat] = (percentMods[mod.stat] || 0) + mod.value;
    }
  }

  for (const [stat, percent] of Object.entries(percentMods)) {
    const key = stat as keyof Stats;
    result[key] = Math.floor(result[key] * (1 + percent / 100));
  }

  return result;
}

export function validateUsername(username: string): boolean {
  if (!username || typeof username !== "string") return false;
  const trimmed = username.trim();
  if (trimmed.length < 2 || trimmed.length > 30) return false;
  if (trimmed === "." || trimmed === "..") return false;
  if (/[\x00-\x1F\x7F/]/.test(trimmed)) return false;
  return true;
}

export function validateFamilyName(name: string): boolean {
  if (!name || typeof name !== "string") return false;
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 30) return false;
  if (trimmed === "." || trimmed === "..") return false;
  if (/[\x00-\x1F\x7F/]/.test(trimmed)) return false;
  return true;
}

export function validateHeirName(name: string): boolean {
  if (!name || typeof name !== "string") return false;
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 50) return false;
  if (trimmed === "." || trimmed === "..") return false;
  if (/[\x00-\x1F\x7F/]/.test(trimmed)) return false;
  return true;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
