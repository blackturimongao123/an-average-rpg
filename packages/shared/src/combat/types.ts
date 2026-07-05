import type { Stats } from "../types.js";

export type DamageType = "physical" | "magical" | "holy";

export interface MainAbilityDef {
  id: string;
  name: string;
  description: string;
  damagePercent: number;
  damageType: DamageType;
  scalingStat: keyof Stats;
}

export type CombatTrigger =
  | { type: "combat_start" }
  | { type: "every_n_turns"; n: number }
  | { type: "hp_below_percent"; percent: number; once?: boolean }
  | { type: "target_hp_below_percent"; percent: number }
  | { type: "passive_dodge"; chance: number }
  | { type: "passive_damage_reduction"; percent: number; tags?: string[] }
  | { type: "passive_crit_vs_low_hp"; percent: number; targetHpPercent: number }
  | { type: "lethal_save"; once?: boolean };

export interface ActiveAbilityDef {
  id: string;
  skillId?: string;
  classAbilityId?: string;
  name: string;
  description: string;
  triggerText: string;
  trigger: CombatTrigger;
  replacesMain: boolean;
  damagePercent?: number;
  hitCount?: number;
  healPercentMaxHp?: number;
  bonusCritChance?: number;
  buffDamagePercent?: number;
  buffDurationTurns?: number;
  classIds: string[];
}

export interface MainAbilityModifierDef {
  skillId: string;
  displayLines: string[];
}

export interface CombatData {
  gaugeThreshold: number;
  mainAbilities: Record<string, MainAbilityDef>;
  mainAbilityModifiers: MainAbilityModifierDef[];
  activeAbilities: ActiveAbilityDef[];
}

export interface CombatItemDef {
  id: string;
  weaponDamage?: number;
  stats?: Partial<Stats>;
  armorValue?: number;
}

export interface CombatHeirInput {
  id: string;
  classId: string;
  level: number;
  stats: Stats;
  skillIds: string[];
  equipment: {
    mainWeapon: string | null;
    armor: string | null;
  };
}

export interface CombatMonsterInput {
  id: string;
  name: string;
  hp: number;
  damage: number;
  defense: number;
  dexterity: number;
  traits?: string[];
}

export interface CombatProfileMainAbility {
  id: string;
  name: string;
  description: string;
  damageSummary: string;
  modifierLines: string[];
}

export interface CombatProfileActiveAbility {
  id: string;
  name: string;
  description: string;
  triggerText: string;
  cooldownText?: string;
}

export interface CombatProfile {
  speed: number;
  mainAbility: CombatProfileMainAbility;
  activeAbilities: CombatProfileActiveAbility[];
  passiveNotes: string[];
}

export interface CombatRound {
  tick: number;
  actor: string;
  action: string;
  abilityId?: string;
  abilityName?: string;
  damage: number;
  healing?: number;
  actorHpAfter: number;
  targetHpAfter: number;
  actorGaugeAfter: number;
  isCrit: boolean;
  isMiss: boolean;
  isDodge?: boolean;
  hitCount?: number;
}

export interface CombatResult {
  victory: boolean;
  heirDied: boolean;
  rounds: CombatRound[];
  xpGained: number;
  goldGained: number;
  itemIds: string[];
  finalHeirHp: number;
  finalEnemyHp: number;
}

export interface RandomFn {
  (index: number): number;
}
