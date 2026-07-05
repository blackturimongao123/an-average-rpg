import type {
  CombatData,
  CombatHeirInput,
  CombatItemDef,
  CombatProfile,
  MainAbilityDef,
  ActiveAbilityDef,
} from "./types.js";
import { computeCombatSpeed, computeEffectiveStats, getWeaponDamage } from "./stats.js";

function formatDamageSummary(main: MainAbilityDef): string {
  const statLabel = main.scalingStat.charAt(0).toUpperCase() + main.scalingStat.slice(1);
  const typeLabel = main.damageType === "physical" ? "Physical" : main.damageType === "holy" ? "Holy" : "Magical";
  return `Deal ${main.damagePercent}% ${typeLabel} Damage (scales with ${statLabel}).`;
}

function abilityOwned(ability: ActiveAbilityDef, skillIds: string[], classId: string): boolean {
  if (!ability.classIds.includes(classId)) return false;
  if (ability.skillId) return skillIds.includes(ability.skillId);
  return Boolean(ability.classAbilityId);
}

function isPassiveDisplay(ability: ActiveAbilityDef): boolean {
  const t = ability.trigger.type;
  return (
    t === "passive_dodge" ||
    t === "passive_damage_reduction" ||
    t === "passive_crit_vs_low_hp" ||
    t === "lethal_save"
  );
}

function cooldownText(ability: ActiveAbilityDef): string | undefined {
  const t = ability.trigger;
  if (t.type === "every_n_turns") return `Every ${t.n} turns`;
  if (t.type === "hp_below_percent" && t.once) return "Once per battle";
  if (t.type === "lethal_save") return "Once per battle";
  if (t.type === "combat_start") return "Combat start";
  return undefined;
}

export function buildCombatProfile(
  heir: CombatHeirInput,
  items: CombatItemDef[],
  combatData: CombatData
): CombatProfile | null {
  const main = combatData.mainAbilities[heir.classId];
  if (!main) return null;

  const stats = computeEffectiveStats(heir.stats, heir.equipment, items);
  const speed = computeCombatSpeed(stats.dexterity, heir.skillIds, combatData);

  const modifierLines = combatData.mainAbilityModifiers
    .filter((mod) => heir.skillIds.includes(mod.skillId))
    .flatMap((mod) => mod.displayLines);

  const ownedActives = combatData.activeAbilities.filter(
    (ability) => abilityOwned(ability, heir.skillIds, heir.classId) && !isPassiveDisplay(ability)
  );

  const passiveNotes = combatData.activeAbilities
    .filter((ability) => abilityOwned(ability, heir.skillIds, heir.classId) && isPassiveDisplay(ability))
    .map((ability) => `${ability.name}: ${ability.triggerText}`);

  // Class passives from classAbilityId without skill requirement
  for (const ability of combatData.activeAbilities) {
    if (
      ability.classAbilityId &&
      ability.classIds.includes(heir.classId) &&
      !ability.skillId &&
      isPassiveDisplay(ability) &&
      !passiveNotes.some((n) => n.startsWith(ability.name))
    ) {
      passiveNotes.push(`${ability.name}: ${ability.triggerText}`);
    }
  }

  return {
    speed,
    mainAbility: {
      id: main.id,
      name: main.name,
      description: main.description,
      damageSummary: formatDamageSummary(main),
      modifierLines,
    },
    activeAbilities: ownedActives.map((ability) => ({
      id: ability.id,
      name: ability.name,
      description: ability.description,
      triggerText: ability.triggerText,
      cooldownText: cooldownText(ability),
    })),
    passiveNotes,
  };
}
