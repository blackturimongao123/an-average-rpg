import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatGold(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return amount.toString();
}

export function calculateMaxHp(constitution: number, level: number): number {
  return 50 + constitution * 10 + level * 8;
}

export function calculateXpForLevel(level: number): number {
  return level * 100;
}

export function getStatColor(stat: string): string {
  const colors: Record<string, string> = {
    strength: "text-red-400",
    dexterity: "text-green-400",
    intelligence: "text-blue-400",
    constitution: "text-orange-400",
    luck: "text-yellow-400",
    charisma: "text-pink-400",
    faith: "text-purple-400",
    infamy: "text-gray-400",
  };
  return colors[stat] || "text-foreground";
}

export function getRarityColor(rarity: string): string {
  const colors: Record<string, string> = {
    common: "text-gray-400",
    uncommon: "text-green-400",
    rare: "text-blue-400",
    epic: "text-purple-400",
    legendary: "text-orange-400",
    mythic: "text-cyan-400",
    unique: "text-yellow-300",
    cursed: "text-red-900",
    heirloom: "text-gold",
  };
  return colors[rarity] || "text-foreground";
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatStatName(stat: string): string {
  const names: Record<string, string> = {
    strength: "Strength",
    dexterity: "Dexterity",
    intelligence: "Intelligence",
    constitution: "Constitution",
    luck: "Luck",
    charisma: "Charisma",
    faith: "Faith",
    infamy: "Infamy",
  };
  return names[stat] || capitalize(stat);
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
