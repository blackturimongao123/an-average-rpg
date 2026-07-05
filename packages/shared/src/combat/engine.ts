import type {
  ActiveAbilityDef,
  CombatData,
  CombatHeirInput,
  CombatItemDef,
  CombatMonsterInput,
  CombatResult,
  CombatRound,
  MainAbilityDef,
  RandomFn,
} from "./types.js";
import {
  calculateArmorReduction,
  calculateCritChance,
  calculateHitChance,
  calculateMaxHp,
  computeCombatSpeed,
  computeEffectiveStats,
  getArmorValue,
  getWeaponDamage,
} from "./stats.js";

interface Fighter {
  id: string;
  isHeir: boolean;
  hp: number;
  maxHp: number;
  speed: number;
  gauge: number;
  defense: number;
  dexterity: number;
  luck: number;
  scalingStat: number;
  weaponDamage: number;
  traits: string[];
  heirTurnCount: number;
  usedOnce: Set<string>;
  damageBuffPercent: number;
  damageBuffTurns: number;
}

interface ResolvedAction {
  abilityId: string;
  abilityName: string;
  action: string;
  damagePercent: number;
  hitCount: number;
  healPercentMaxHp: number;
  bonusCrit: number;
  isMain: boolean;
}

function abilityUnlocked(
  ability: ActiveAbilityDef,
  skillIds: string[],
  classId: string
): boolean {
  if (!ability.classIds.includes(classId)) return false;
  if (ability.skillId) return skillIds.includes(ability.skillId);
  if (ability.classAbilityId) return true;
  return false;
}

function getOwnedActives(
  combatData: CombatData,
  skillIds: string[],
  classId: string
): ActiveAbilityDef[] {
  return combatData.activeAbilities.filter((a) => abilityUnlocked(a, skillIds, classId));
}

function triggerPriority(ability: ActiveAbilityDef): number {
  const t = ability.trigger.type;
  if (t === "combat_start") return 100;
  if (t === "target_hp_below_percent") return 90;
  if (t === "hp_below_percent") return 80;
  if (t === "every_n_turns") return 70;
  if (t === "lethal_save") return 10;
  return 0;
}

function resolveHeirAction(
  heir: Fighter,
  target: Fighter,
  main: MainAbilityDef,
  actives: ActiveAbilityDef[],
  combatStartPending: boolean
): ResolvedAction | null {
  const sorted = [...actives]
    .filter((a) => a.replacesMain || a.trigger.type === "combat_start" || a.trigger.type === "hp_below_percent")
    .sort((a, b) => triggerPriority(b) - triggerPriority(a));

  for (const ability of sorted) {
    const trigger = ability.trigger;
    const onceKey = ability.id;

    if (trigger.type === "combat_start" && combatStartPending) {
      if (ability.replacesMain) continue;
      return toAction(ability, main, false);
    }

    if (trigger.type === "target_hp_below_percent") {
      const threshold = target.maxHp * (trigger.percent / 100);
      if (target.hp > 0 && target.hp <= threshold) {
        return toAction(ability, main, ability.replacesMain);
      }
    }

    if (trigger.type === "hp_below_percent") {
      const threshold = heir.maxHp * (trigger.percent / 100);
      if (heir.hp <= threshold) {
        if (trigger.once && heir.usedOnce.has(onceKey)) continue;
        if (!ability.replacesMain && trigger.once) {
          heir.usedOnce.add(onceKey);
          return toAction(ability, main, false);
        }
        if (ability.replacesMain) {
          return toAction(ability, main, true);
        }
      }
    }

    if (trigger.type === "every_n_turns" && ability.replacesMain) {
      if (heir.heirTurnCount > 0 && heir.heirTurnCount % trigger.n === 0) {
        return toAction(ability, main, true);
      }
    }
  }

  return toAction(null, main, true);
}

function toAction(
  ability: ActiveAbilityDef | null,
  main: MainAbilityDef,
  isMain: boolean
): ResolvedAction {
  if (!ability || isMain) {
    return {
      abilityId: main.id,
      abilityName: main.name,
      action: main.id,
      damagePercent: main.damagePercent,
      hitCount: 1,
      healPercentMaxHp: 0,
      bonusCrit: 0,
      isMain: true,
    };
  }

  return {
    abilityId: ability.id,
    abilityName: ability.name,
    action: ability.id,
    damagePercent: ability.damagePercent ?? main.damagePercent,
    hitCount: ability.hitCount ?? 1,
    healPercentMaxHp: ability.healPercentMaxHp ?? 0,
    bonusCrit: ability.bonusCritChance ?? 0,
    isMain: false,
  };
}

function getCritBonus(
  heir: Fighter,
  target: Fighter,
  skillIds: string[],
  actives: ActiveAbilityDef[],
  bonusCrit: number
): number {
  let extra = bonusCrit;
  if (skillIds.includes("battle_instinct")) extra += 5;
  if (skillIds.includes("weapon_flow")) extra += 10;
  if (skillIds.includes("thousand_cuts")) extra += 10;

  for (const ability of actives) {
    if (ability.trigger.type === "passive_crit_vs_low_hp") {
      const threshold = target.maxHp * (ability.trigger.targetHpPercent / 100);
      if (target.hp > 0 && target.hp <= threshold) {
        extra += ability.trigger.percent;
      }
    }
  }

  return extra;
}

function getDamageMultiplier(heir: Fighter, skillIds: string[]): number {
  let mult = 1 + heir.damageBuffPercent / 100;
  if (skillIds.includes("blood_heat")) {
    const missing = 1 - heir.hp / heir.maxHp;
    mult += missing * 0.35;
  }
  if (skillIds.includes("arcane_bolt")) mult += 0.15;
  if (skillIds.includes("hunters_mark")) mult += 0.1;
  return mult;
}

function rollAttack(
  seedIdx: number,
  rand: RandomFn,
  attacker: Fighter,
  defender: Fighter,
  baseDamage: number,
  critBonus: number
): { damage: number; isCrit: boolean; isMiss: boolean } {
  const hitRoll = rand(seedIdx) * 100;
  const isMiss = hitRoll > calculateHitChance(attacker.dexterity, defender.dexterity);

  const critRoll = rand(seedIdx + 1) * 100;
  const isCrit = !isMiss && critRoll < calculateCritChance(attacker.luck, critBonus);

  let damage = 0;
  if (!isMiss) {
    const raw = isCrit ? baseDamage * 2 : baseDamage;
    const reduction = calculateArmorReduction(defender.defense);
    damage = Math.max(1, Math.floor(raw * (1 - reduction)));
  }

  return { damage, isCrit, isMiss };
}

function tryDodge(
  defender: Fighter,
  actives: ActiveAbilityDef[],
  seedIdx: number,
  rand: RandomFn
): boolean {
  for (const ability of actives) {
    if (ability.trigger.type === "passive_dodge") {
      const roll = rand(seedIdx + 2) * 100;
      if (roll < ability.trigger.chance) return true;
    }
  }
  return false;
}

function damageReductionVsTraits(
  defenderActives: ActiveAbilityDef[],
  attackerTraits: string[]
): number {
  let reduction = 0;
  for (const ability of defenderActives) {
    if (ability.trigger.type !== "passive_damage_reduction") continue;
    const tags = ability.trigger.tags ?? [];
    if (tags.some((tag) => attackerTraits.includes(tag))) {
      reduction += ability.trigger.percent / 100;
    }
  }
  return Math.min(0.75, reduction);
}

function applyLethalSave(heir: Fighter, actives: ActiveAbilityDef[], damage: number): number {
  if (heir.hp - damage > 0) return damage;
  for (const ability of actives) {
    if (ability.trigger.type !== "lethal_save") continue;
    const onceKey = ability.id;
    if (heir.usedOnce.has(onceKey)) continue;
    heir.usedOnce.add(onceKey);
    return Math.max(0, heir.hp - 1);
  }
  return damage;
}

export function simulateGaugeCombat(
  heirInput: CombatHeirInput,
  monsterInput: CombatMonsterInput,
  combatData: CombatData,
  items: CombatItemDef[],
  rand: RandomFn,
  options?: {
    xpReward?: number;
    goldMin?: number;
    goldMax?: number;
    lootRolls?: Array<{ itemId: string; weight: number; minQuantity: number; maxQuantity: number }>;
  }
): CombatResult {
  const main = combatData.mainAbilities[heirInput.classId];
  if (!main) {
    throw new Error(`No main ability for class ${heirInput.classId}`);
  }

  const stats = computeEffectiveStats(heirInput.stats, heirInput.equipment, items);
  const weaponDamage = getWeaponDamage(heirInput.equipment, items);
  const armorValue = getArmorValue(heirInput.equipment, items);
  const heirDefense = 5 + Math.floor(stats.constitution / 2) + armorValue;
  const heirSpeed = computeCombatSpeed(stats.dexterity, heirInput.skillIds, combatData);
  const scalingStat = stats[main.scalingStat];

  const heirMaxHp = calculateMaxHp(stats.constitution, heirInput.level);
  const actives = getOwnedActives(combatData, heirInput.skillIds, heirInput.classId);

  const heir: Fighter = {
    id: heirInput.id,
    isHeir: true,
    hp: heirMaxHp,
    maxHp: heirMaxHp,
    speed: heirSpeed,
    gauge: 0,
    defense: heirDefense,
    dexterity: stats.dexterity,
    luck: stats.luck,
    scalingStat,
    weaponDamage,
    traits: [],
    heirTurnCount: 0,
    usedOnce: new Set(),
    damageBuffPercent: 0,
    damageBuffTurns: 0,
  };

  const monster: Fighter = {
    id: monsterInput.id,
    isHeir: false,
    hp: monsterInput.hp,
    maxHp: monsterInput.hp,
    speed: 8 + monsterInput.dexterity * 1.5,
    gauge: 0,
    defense: monsterInput.defense,
    dexterity: monsterInput.dexterity,
    luck: 5,
    scalingStat: monsterInput.damage,
    weaponDamage: monsterInput.damage,
    traits: monsterInput.traits ?? [],
    heirTurnCount: 0,
    usedOnce: new Set(),
    damageBuffPercent: 0,
    damageBuffTurns: 0,
  };

  const rounds: CombatRound[] = [];
  let tick = 0;
  let combatStartPending = true;
  const threshold = combatData.gaugeThreshold;
  const fighters = [heir, monster];

  while (heir.hp > 0 && monster.hp > 0 && tick < 500) {
    tick++;

    for (const fighter of fighters) {
      fighter.gauge += fighter.speed;
    }

    const ready = fighters
      .filter((f) => f.gauge >= threshold && f.hp > 0)
      .sort((a, b) => b.gauge - a.gauge || b.dexterity - a.dexterity);

    if (ready.length === 0) continue;

    const actor = ready[0]!;
    actor.gauge -= threshold;

    const target = actor.id === heir.id ? monster : heir;
    const seedBase = tick * 20;

    if (actor.isHeir) {
      // Combat-start buffs (non-replacing)
      if (combatStartPending) {
        for (const ability of actives) {
          if (ability.trigger.type !== "combat_start") continue;
          if (ability.buffDamagePercent) {
            heir.damageBuffPercent = ability.buffDamagePercent;
            heir.damageBuffTurns = ability.buffDurationTurns ?? 3;
          }
          rounds.push({
            tick,
            actor: heir.id,
            action: ability.id,
            abilityId: ability.id,
            abilityName: ability.name,
            damage: 0,
            healing: 0,
            actorHpAfter: heir.hp,
            targetHpAfter: monster.hp,
            actorGaugeAfter: Math.floor(actor.gauge),
            isCrit: false,
            isMiss: false,
          });
        }
        combatStartPending = false;
      }

      actor.heirTurnCount += 1;
      if (actor.damageBuffTurns > 0) {
        actor.damageBuffTurns -= 1;
        if (actor.damageBuffTurns <= 0) actor.damageBuffPercent = 0;
      }

      const resolved = resolveHeirAction(heir, monster, main, actives, false);
      if (!resolved) continue;

      let totalDamage = 0;
      let totalHealing = 0;
      let anyCrit = false;
      let anyMiss = false;

      if (resolved.healPercentMaxHp > 0) {
        totalHealing = Math.floor(heir.maxHp * (resolved.healPercentMaxHp / 100));
        heir.hp = Math.min(heir.maxHp, heir.hp + totalHealing);
      }

      const baseDamage = Math.floor(
        (actor.weaponDamage + actor.scalingStat) * (resolved.damagePercent / 100) * getDamageMultiplier(heir, heirInput.skillIds)
      );

      const critBonus = getCritBonus(heir, monster, heirInput.skillIds, actives, resolved.bonusCrit);

      for (let hit = 0; hit < resolved.hitCount; hit++) {
        const result = rollAttack(seedBase + hit * 3, rand, heir, monster, baseDamage, critBonus);
        totalDamage += result.damage;
        anyCrit = anyCrit || result.isCrit;
        anyMiss = anyMiss || result.isMiss;
      }

      monster.hp = Math.max(0, monster.hp - totalDamage);

      rounds.push({
        tick,
        actor: heir.id,
        action: resolved.action,
        abilityId: resolved.abilityId,
        abilityName: resolved.abilityName,
        damage: totalDamage,
        healing: totalHealing > 0 ? totalHealing : undefined,
        actorHpAfter: heir.hp,
        targetHpAfter: monster.hp,
        actorGaugeAfter: Math.floor(actor.gauge),
        isCrit: anyCrit,
        isMiss: anyMiss && totalDamage === 0,
        hitCount: resolved.hitCount,
      });
    } else {
      // Monster attack
      if (tryDodge(heir, actives, seedBase, rand)) {
        rounds.push({
          tick,
          actor: monster.id,
          action: "attack",
          abilityName: "Strike",
          damage: 0,
          actorHpAfter: monster.hp,
          targetHpAfter: heir.hp,
          actorGaugeAfter: Math.floor(actor.gauge),
          isCrit: false,
          isMiss: false,
          isDodge: true,
        });
        continue;
      }

      let baseDamage = monster.weaponDamage;
      const traitReduction = damageReductionVsTraits(actives, monster.traits);
      if (traitReduction > 0) {
        baseDamage = Math.floor(baseDamage * (1 - traitReduction));
      }

      const result = rollAttack(seedBase, rand, monster, heir, baseDamage, 0);
      let damage = result.damage;
      damage = applyLethalSave(heir, actives, damage);
      heir.hp = Math.max(0, heir.hp - damage);

      rounds.push({
        tick,
        actor: monster.id,
        action: "attack",
        abilityName: "Strike",
        damage,
        actorHpAfter: monster.hp,
        targetHpAfter: heir.hp,
        actorGaugeAfter: Math.floor(actor.gauge),
        isCrit: result.isCrit,
        isMiss: result.isMiss,
      });
    }
  }

  const victory = monster.hp <= 0 && heir.hp > 0;
  const heirDied = heir.hp <= 0;

  let xpGained = 0;
  let goldGained = 0;
  const itemIds: string[] = [];

  if (victory && options) {
    xpGained = options.xpReward ?? 0;
    if (options.goldMin !== undefined && options.goldMax !== undefined) {
      const roll = rand(999);
      goldGained =
        options.goldMin +
        Math.floor(roll * (options.goldMax - options.goldMin + 1));
    }
    if (options.lootRolls) {
      for (let i = 0; i < options.lootRolls.length; i++) {
        const loot = options.lootRolls[i]!;
        const roll = rand(1000 + i) * 100;
        if (roll < loot.weight) {
          const qtyRoll = rand(1001 + i);
          const qty =
            loot.minQuantity +
            Math.floor(qtyRoll * (loot.maxQuantity - loot.minQuantity + 1));
          for (let j = 0; j < qty; j++) itemIds.push(loot.itemId);
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
    finalHeirHp: Math.max(0, heir.hp),
    finalEnemyHp: Math.max(0, monster.hp),
  };
}

/** Map gauge combat rounds to legacy BattleRound shape for API compatibility. */
export function toLegacyBattleRounds(
  rounds: CombatRound[]
): Array<{
  round: number;
  actor: string;
  action: string;
  abilityId?: string;
  abilityName?: string;
  damage: number;
  healing?: number;
  actorHpAfter: number;
  targetHpAfter: number;
  actorGaugeAfter?: number;
  isCrit: boolean;
  isMiss: boolean;
  isDodge?: boolean;
  hitCount?: number;
}> {
  return rounds.map((r, index) => ({
    round: r.tick,
    actor: r.actor,
    action: r.action,
    abilityId: r.abilityId,
    abilityName: r.abilityName,
    damage: r.damage,
    healing: r.healing,
    actorHpAfter: r.actorHpAfter,
    targetHpAfter: r.targetHpAfter,
    actorGaugeAfter: r.actorGaugeAfter,
    isCrit: r.isCrit,
    isMiss: r.isMiss,
    isDodge: r.isDodge,
    hitCount: r.hitCount,
  }));
}
