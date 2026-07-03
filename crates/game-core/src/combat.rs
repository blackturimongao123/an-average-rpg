use crate::rng::GameRng;
use crate::types::*;

pub struct CombatEngine {
    rng: GameRng,
}

impl CombatEngine {
    pub fn new(seed: &str) -> Self {
        Self {
            rng: GameRng::from_seed_string(seed),
        }
    }

    pub fn resolve_battle(&mut self, heir: &Heir, monster: &Monster) -> BattleResult {
        let mut heir_hp = heir.max_hp();
        let mut monster_hp = monster.hp;
        let mut rounds = Vec::new();
        let mut round_num = 0u32;

        let heir_damage = self.calculate_heir_damage(heir);
        let heir_defense = self.calculate_heir_defense(heir);
        let heir_hit_chance = self.calculate_hit_chance(heir.stats.dexterity, monster.dexterity);
        let heir_crit_chance = self.calculate_crit_chance(heir.stats.luck);
        
        let monster_hit_chance = self.calculate_hit_chance(monster.dexterity, heir.stats.dexterity);
        
        let heir_goes_first = heir.stats.dexterity >= monster.dexterity;

        while heir_hp > 0 && monster_hp > 0 && round_num < 100 {
            round_num += 1;

            if heir_goes_first {
                let round = self.heir_attacks(
                    round_num, heir, heir_damage, heir_hit_chance, heir_crit_chance,
                    &mut monster_hp, heir_hp, monster.defense,
                );
                rounds.push(round);

                if monster_hp <= 0 {
                    break;
                }

                let round = self.monster_attacks(
                    round_num, monster, monster_hit_chance,
                    &mut heir_hp, monster_hp, heir_defense,
                );
                rounds.push(round);
            } else {
                let round = self.monster_attacks(
                    round_num, monster, monster_hit_chance,
                    &mut heir_hp, monster_hp, heir_defense,
                );
                rounds.push(round);

                if heir_hp <= 0 {
                    break;
                }

                let round = self.heir_attacks(
                    round_num, heir, heir_damage, heir_hit_chance, heir_crit_chance,
                    &mut monster_hp, heir_hp, monster.defense,
                );
                rounds.push(round);
            }
        }

        let victory = monster_hp <= 0 && heir_hp > 0;
        let heir_died = heir_hp <= 0;

        let (xp_gained, gold_gained, item_ids) = if victory {
            let gold = self.rng.range_i64(monster.gold_reward_min, monster.gold_reward_max);
            let items = self.roll_loot(&monster.loot_table);
            (monster.xp_reward, gold, items)
        } else {
            (0, 0, Vec::new())
        };

        BattleResult {
            victory,
            heir_died,
            rounds,
            xp_gained,
            gold_gained,
            item_ids,
            final_heir_hp: heir_hp.max(0),
            final_enemy_hp: monster_hp.max(0),
        }
    }

    fn heir_attacks(
        &mut self,
        round: u32,
        heir: &Heir,
        base_damage: i32,
        hit_chance: f32,
        crit_chance: f32,
        monster_hp: &mut i32,
        heir_hp: i32,
        monster_defense: i32,
    ) -> BattleRound {
        let is_miss = !self.rng.chance(hit_chance);
        let is_crit = !is_miss && self.rng.chance(crit_chance);
        
        let damage = if is_miss {
            0
        } else {
            let raw_damage = if is_crit { base_damage * 2 } else { base_damage };
            self.apply_armor_reduction(raw_damage, monster_defense)
        };

        *monster_hp -= damage;

        BattleRound {
            round,
            actor: heir.id.clone(),
            action: if is_crit { "critical_strike".to_string() } else { "attack".to_string() },
            damage,
            actor_hp_after: heir_hp,
            target_hp_after: *monster_hp,
            is_crit,
            is_miss,
        }
    }

    fn monster_attacks(
        &mut self,
        round: u32,
        monster: &Monster,
        hit_chance: f32,
        heir_hp: &mut i32,
        monster_hp: i32,
        heir_defense: i32,
    ) -> BattleRound {
        let is_miss = !self.rng.chance(hit_chance);
        
        let damage = if is_miss {
            0
        } else {
            self.apply_armor_reduction(monster.damage, heir_defense)
        };

        *heir_hp -= damage;

        BattleRound {
            round,
            actor: monster.id.clone(),
            action: "attack".to_string(),
            damage,
            actor_hp_after: monster_hp,
            target_hp_after: *heir_hp,
            is_crit: false,
            is_miss,
        }
    }

    fn calculate_heir_damage(&self, heir: &Heir) -> i32 {
        let base_weapon_damage = 10;
        let stat_bonus = heir.stats.strength;
        base_weapon_damage + stat_bonus
    }

    fn calculate_heir_defense(&self, heir: &Heir) -> i32 {
        let base_armor = 5;
        let constitution_bonus = heir.stats.constitution / 2;
        base_armor + constitution_bonus
    }

    fn calculate_hit_chance(&self, attacker_dex: i32, defender_dex: i32) -> f32 {
        let base_chance = 70.0;
        let dex_diff = (attacker_dex - defender_dex) as f32;
        (base_chance + dex_diff).clamp(20.0, 95.0)
    }

    fn calculate_crit_chance(&self, luck: i32) -> f32 {
        let base_crit = 5.0;
        let luck_bonus = luck as f32 * 0.4;
        (base_crit + luck_bonus).clamp(5.0, 50.0)
    }

    fn apply_armor_reduction(&self, damage: i32, armor: i32) -> i32 {
        let reduction = armor as f32 / (armor as f32 + 100.0);
        let reduced_damage = damage as f32 * (1.0 - reduction);
        reduced_damage.round() as i32
    }

    fn roll_loot(&mut self, loot_table: &[LootEntry]) -> Vec<String> {
        let mut items = Vec::new();
        
        for entry in loot_table {
            let roll = self.rng.next_f32() * 100.0;
            let chance = entry.weight as f32;
            
            if roll < chance {
                let quantity = self.rng.range_u32(entry.min_quantity, entry.max_quantity);
                for _ in 0..quantity {
                    items.push(entry.item_id.clone());
                }
            }
        }
        
        items
    }
}

pub fn calculate_max_hp(constitution: i32, level: u32) -> i32 {
    50 + constitution * 10 + (level as i32) * 8
}

pub fn calculate_damage(weapon_damage: i32, main_stat: i32, class_scaling: f32) -> i32 {
    weapon_damage + (main_stat as f32 * class_scaling).round() as i32
}

pub fn calculate_armor_reduction(armor: i32) -> f32 {
    armor as f32 / (armor as f32 + 100.0)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_heir() -> Heir {
        let mut heir = Heir::new(
            "test-uid".to_string(),
            "test-lineage".to_string(),
            1,
            "fighter".to_string(),
        );
        heir.stats = Stats {
            strength: 10,
            dexterity: 8,
            intelligence: 5,
            constitution: 8,
            luck: 5,
            charisma: 5,
            faith: 3,
            infamy: 0,
        };
        heir.level = 5;
        heir.status = HeirStatus::Alive;
        heir
    }

    fn create_test_monster() -> Monster {
        Monster {
            id: "test-monster".to_string(),
            name: "Goblin".to_string(),
            level: 3,
            hp: 50,
            damage: 8,
            defense: 5,
            dexterity: 6,
            xp_reward: 25,
            gold_reward_min: 5,
            gold_reward_max: 15,
            loot_table: vec![
                LootEntry {
                    item_id: "gold_coin".to_string(),
                    weight: 50,
                    min_quantity: 1,
                    max_quantity: 3,
                },
            ],
        }
    }

    #[test]
    fn test_combat_determinism() {
        let heir = create_test_heir();
        let monster = create_test_monster();
        
        let mut engine1 = CombatEngine::new("battle-seed-123");
        let mut engine2 = CombatEngine::new("battle-seed-123");
        
        let result1 = engine1.resolve_battle(&heir, &monster);
        let result2 = engine2.resolve_battle(&heir, &monster);
        
        assert_eq!(result1.victory, result2.victory);
        assert_eq!(result1.rounds.len(), result2.rounds.len());
        assert_eq!(result1.gold_gained, result2.gold_gained);
    }

    #[test]
    fn test_combat_resolves() {
        let heir = create_test_heir();
        let monster = create_test_monster();
        
        let mut engine = CombatEngine::new("test-battle");
        let result = engine.resolve_battle(&heir, &monster);
        
        assert!(!result.rounds.is_empty());
        assert!(result.heir_died || result.victory);
    }

    #[test]
    fn test_max_hp_calculation() {
        assert_eq!(calculate_max_hp(10, 1), 50 + 100 + 8);
        assert_eq!(calculate_max_hp(5, 10), 50 + 50 + 80);
    }

    #[test]
    fn test_armor_reduction() {
        assert!((calculate_armor_reduction(100) - 0.5).abs() < 0.01);
        assert!((calculate_armor_reduction(0) - 0.0).abs() < 0.01);
    }
}
