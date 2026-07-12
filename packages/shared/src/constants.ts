import type { AdventurerRank } from "./types.js";

export const STAT_NAMES: Record<string, string> = {
  strength: "Strength",
  dexterity: "Dexterity",
  intelligence: "Intelligence",
  constitution: "Constitution",
  luck: "Luck",
  charisma: "Charisma",
  faith: "Faith",
  infamy: "Infamy",
};

export const STAT_ABBREVIATIONS: Record<string, string> = {
  strength: "STR",
  dexterity: "DEX",
  intelligence: "INT",
  constitution: "CON",
  luck: "LCK",
  charisma: "CHA",
  faith: "FTH",
  infamy: "INF",
};

export const STAT_COLORS: Record<string, string> = {
  strength: "#ef4444",
  dexterity: "#22c55e",
  intelligence: "#3b82f6",
  constitution: "#f97316",
  luck: "#eab308",
  charisma: "#ec4899",
  faith: "#a855f7",
  infamy: "#6b7280",
};

export const CLASS_IDS = ["warrior", "rogue", "mage", "priest", "ranger"] as const;

export const RACE_IDS = ["human", "half_elf", "half_orc", "tiefling"] as const;

export const JOB_IDS = ["guard", "scribe", "fence", "gravekeeper", "trail_warden"] as const;

export const DUNGEON_IDS = ["goblin_caves", "undead_crypt", "dragon_lair"] as const;

export const RARITY_COLORS: Record<string, string> = {
  common: "#9ca3af",
  uncommon: "#22c55e",
  rare: "#3b82f6",
  epic: "#a855f7",
  legendary: "#f97316",
  mythic: "#06b6d4",
  unique: "#fde047",
  cursed: "#7f1d1d",
  heirloom: "#fbbf24",
};

export const RARITY_ORDER = [
  "common",
  "uncommon",
  "rare",
  "epic",
  "legendary",
  "mythic",
  "unique",
  "cursed",
  "heirloom",
];

export const MERCHANT_STOCK_SIZE = 5;

export const MERCHANT_REROLL_MS = 8 * 60 * 60 * 1000;

export const STAT_POINTS_PER_LEVEL = 3;

export const SKILL_POINTS_PER_LEVEL = 3;

export const getCharacterSkillPointsPool = (level: number): number =>
  level * SKILL_POINTS_PER_LEVEL;

export const CLASS_ACCENT_COLORS: Record<string, string> = {
  warrior: "#ef4444",
  rogue: "#22c55e",
  mage: "#3b82f6",
  priest: "#a855f7",
  ranger: "#eab308",
};

export const SKILL_GRID_SIZE = 88;

export const NODE_RADIUS_BY_TYPE: Record<string, number> = {
  minor: 24,
  passive: 32,
  active: 40,
  special: 48,
};

export const DEFAULT_NODE_RADIUS = 36;

export const MAX_ITEM_LEVEL = 100;

export const MISSION_COOLDOWN_MS = 10 * 60 * 1000;

export const MERCHANT_RARITY_WEIGHTS: Record<string, number> = {
  common: 50,
  uncommon: 28,
  rare: 14,
  epic: 6,
  legendary: 2,
};

export const JOB_POSITIONS = ["apprentice", "worker", "specialist", "master", "guildmaster"] as const;

export const JOB_POSITION_NAMES: Record<string, string> = {
  apprentice: "Apprentice",
  worker: "Worker",
  specialist: "Specialist",
  master: "Master",
  guildmaster: "Guildmaster",
};

export const HEIR_STATUS_COLORS: Record<string, string> = {
  alive: "#22c55e",
  dead: "#ef4444",
  pending: "#eab308",
};

export const XP_PER_LEVEL = (level: number): number => level * 100;

export const MAX_HP = (constitution: number, level: number): number =>
  50 + constitution * 10 + level * 8;

export const BANK_STARTING_SLOTS = 10;

export const INHERITANCE_RATE = 0.1;

export const BASE_CRIT_CHANCE = 5;

export const BASE_HIT_CHANCE = 70;

export const MIN_HIT_CHANCE = 20;

export const MAX_HIT_CHANCE = 95;

export const MAX_CRIT_CHANCE = 50;

export const ADVENTURER_RANKS = ["F", "E", "D", "C", "B", "A", "S", "SS", "SSS"] as const;

export const MISSION_BOARD_SIZE = 5;

export const MISSION_BOARD_REROLL_MS = 60 * 60 * 1000;

export const ADVENTURER_RANK_XP_THRESHOLDS: Record<AdventurerRank, number> = {
  F: 0,
  E: 100,
  D: 250,
  C: 500,
  B: 900,
  A: 1500,
  S: 2400,
  SS: 3600,
  SSS: 5200,
};

export const DIFFICULTY_RANK_COLORS: Record<AdventurerRank, string> = {
  F: "#9ca3af",
  E: "#22c55e",
  D: "#3b82f6",
  C: "#06b6d4",
  B: "#a855f7",
  A: "#f97316",
  S: "#ef4444",
  SS: "#ec4899",
  SSS: "#fbbf24",
};

export const rankIndex = (rank: AdventurerRank): number =>
  ADVENTURER_RANKS.indexOf(rank);

export const getNextAdventurerRank = (rank: AdventurerRank): AdventurerRank | null => {
  const index = rankIndex(rank);
  if (index < 0 || index >= ADVENTURER_RANKS.length - 1) {
    return null;
  }
  return ADVENTURER_RANKS[index + 1];
};

export const getRankXpToNextRank = (rank: AdventurerRank): number | null => {
  const next = getNextAdventurerRank(rank);
  if (!next) {
    return null;
  }
  return ADVENTURER_RANK_XP_THRESHOLDS[next];
};

export const applyAdventurerRankXp = (
  rank: AdventurerRank,
  rankXp: number,
  gained: number
): { rank: AdventurerRank; rankXp: number; rankedUp: boolean } => {
  let nextRank = rank;
  let nextXp = rankXp + gained;
  let rankedUp = false;

  while (true) {
    const threshold = getRankXpToNextRank(nextRank);
    if (threshold === null || nextXp < threshold) {
      break;
    }
    nextXp -= threshold;
    const upgraded = getNextAdventurerRank(nextRank);
    if (!upgraded) {
      break;
    }
    nextRank = upgraded;
    rankedUp = true;
  }

  return { rank: nextRank, rankXp: nextXp, rankedUp };
};

/** Cloud Functions + Scheduler region — must match web `getFunctions(app, region)`. */
export const FIREBASE_FUNCTIONS_REGION = "europe-west1";
