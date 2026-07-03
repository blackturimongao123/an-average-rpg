use crate::types::*;

pub struct EffectEngine;

impl EffectEngine {
    pub fn apply_stat_modifiers(base_stats: &Stats, effects: &[Effect]) -> Stats {
        let mut modified = *base_stats;
        let mut percent_mods: Stats = Stats::default();

        for effect in effects {
            for modifier in &effect.modifiers {
                let stat_value = Self::get_stat_mut(&mut modified, &modifier.stat);
                let percent_value = Self::get_stat_mut(&mut percent_mods, &modifier.stat);

                match modifier.modifier_type {
                    ModifierType::Flat => {
                        *stat_value += modifier.value;
                    }
                    ModifierType::Percent => {
                        *percent_value += modifier.value;
                    }
                    ModifierType::Override => {
                        *stat_value = modifier.value;
                    }
                }
            }
        }

        Self::apply_percent_modifiers(&mut modified, &percent_mods);
        modified
    }

    fn get_stat_mut(stats: &mut Stats, stat_name: &str) -> &mut i32 {
        match stat_name {
            "strength" => &mut stats.strength,
            "dexterity" => &mut stats.dexterity,
            "intelligence" => &mut stats.intelligence,
            "constitution" => &mut stats.constitution,
            "luck" => &mut stats.luck,
            "charisma" => &mut stats.charisma,
            "faith" => &mut stats.faith,
            "infamy" => &mut stats.infamy,
            _ => &mut stats.strength,
        }
    }

    fn apply_percent_modifiers(stats: &mut Stats, percent_mods: &Stats) {
        stats.strength = Self::apply_percent(stats.strength, percent_mods.strength);
        stats.dexterity = Self::apply_percent(stats.dexterity, percent_mods.dexterity);
        stats.intelligence = Self::apply_percent(stats.intelligence, percent_mods.intelligence);
        stats.constitution = Self::apply_percent(stats.constitution, percent_mods.constitution);
        stats.luck = Self::apply_percent(stats.luck, percent_mods.luck);
        stats.charisma = Self::apply_percent(stats.charisma, percent_mods.charisma);
        stats.faith = Self::apply_percent(stats.faith, percent_mods.faith);
        stats.infamy = Self::apply_percent(stats.infamy, percent_mods.infamy);
    }

    fn apply_percent(base: i32, percent: i32) -> i32 {
        if percent == 0 {
            return base;
        }
        let multiplier = 1.0 + (percent as f32 / 100.0);
        (base as f32 * multiplier).round() as i32
    }

    pub fn filter_active_effects(effects: &[Effect], generation: u32) -> Vec<Effect> {
        effects
            .iter()
            .filter(|e| Self::is_effect_active(e, generation))
            .cloned()
            .collect()
    }

    pub fn is_effect_active(effect: &Effect, _generation: u32) -> bool {
        match effect.duration {
            EffectDuration::Permanent => true,
            EffectDuration::Temporary(turns) => turns > 0,
            EffectDuration::UntilDeath => true,
            EffectDuration::Generations(gens) => gens > 0,
        }
    }

    pub fn tick_effect_duration(effect: &mut Effect) -> bool {
        match &mut effect.duration {
            EffectDuration::Permanent => true,
            EffectDuration::Temporary(ref mut turns) => {
                if *turns > 0 {
                    *turns -= 1;
                }
                *turns > 0
            }
            EffectDuration::UntilDeath => true,
            EffectDuration::Generations(ref mut gens) => {
                if *gens > 0 {
                    *gens -= 1;
                }
                *gens > 0
            }
        }
    }

    pub fn process_death_effects(effects: &[Effect]) -> (Vec<Effect>, Vec<Effect>) {
        let mut inherited = Vec::new();
        let mut expired = Vec::new();

        for effect in effects {
            match effect.scope {
                EffectScope::Heir => {
                    expired.push(effect.clone());
                }
                EffectScope::Bloodline => {
                    inherited.push(effect.clone());
                }
                EffectScope::Generations(gens) => {
                    if gens > 1 {
                        let mut new_effect = effect.clone();
                        new_effect.scope = EffectScope::Generations(gens - 1);
                        inherited.push(new_effect);
                    } else {
                        expired.push(effect.clone());
                    }
                }
            }
        }

        (inherited, expired)
    }

    pub fn can_stack_effect(existing: &[Effect], new_effect: &Effect) -> bool {
        !existing.iter().any(|e| e.id == new_effect.id)
    }
}

pub fn create_buff(
    id: &str,
    name: &str,
    stat: &str,
    value: i32,
    duration: u32,
) -> Effect {
    Effect {
        id: id.to_string(),
        name: name.to_string(),
        description: format!("+{} {} for {} turns", value, stat, duration),
        effect_type: EffectType::Buff,
        scope: EffectScope::Heir,
        duration: EffectDuration::Temporary(duration),
        modifiers: vec![StatModifier {
            stat: stat.to_string(),
            modifier_type: ModifierType::Flat,
            value,
        }],
    }
}

pub fn create_bloodline_effect(
    id: &str,
    name: &str,
    description: &str,
    modifiers: Vec<StatModifier>,
    generations: u32,
) -> Effect {
    Effect {
        id: id.to_string(),
        name: name.to_string(),
        description: description.to_string(),
        effect_type: EffectType::Blessing,
        scope: if generations == 0 {
            EffectScope::Bloodline
        } else {
            EffectScope::Generations(generations)
        },
        duration: EffectDuration::Permanent,
        modifiers,
    }
}

pub fn create_curse(
    id: &str,
    name: &str,
    description: &str,
    modifiers: Vec<StatModifier>,
    generations: u32,
) -> Effect {
    Effect {
        id: id.to_string(),
        name: name.to_string(),
        description: description.to_string(),
        effect_type: EffectType::Curse,
        scope: if generations == 0 {
            EffectScope::Bloodline
        } else {
            EffectScope::Generations(generations)
        },
        duration: EffectDuration::Permanent,
        modifiers,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_flat_modifier() {
        let base_stats = Stats::with_base(10);
        let buff = create_buff("str_buff", "Strength Buff", "strength", 5, 3);
        
        let modified = EffectEngine::apply_stat_modifiers(&base_stats, &[buff]);
        
        assert_eq!(modified.strength, 15);
        assert_eq!(modified.dexterity, 10);
    }

    #[test]
    fn test_percent_modifier() {
        let base_stats = Stats::with_base(100);
        let effect = Effect {
            id: "percent_buff".to_string(),
            name: "Percent Buff".to_string(),
            description: "Test".to_string(),
            effect_type: EffectType::Buff,
            scope: EffectScope::Heir,
            duration: EffectDuration::Temporary(5),
            modifiers: vec![StatModifier {
                stat: "strength".to_string(),
                modifier_type: ModifierType::Percent,
                value: 50,
            }],
        };
        
        let modified = EffectEngine::apply_stat_modifiers(&base_stats, &[effect]);
        
        assert_eq!(modified.strength, 150);
    }

    #[test]
    fn test_death_effect_processing() {
        let heir_effect = create_buff("temp", "Temp", "strength", 5, 3);
        let bloodline_effect = create_bloodline_effect(
            "royal_blood",
            "Royal Blood",
            "Blessed by kings",
            vec![StatModifier {
                stat: "charisma".to_string(),
                modifier_type: ModifierType::Flat,
                value: 2,
            }],
            0,
        );
        let gen_effect = create_bloodline_effect(
            "promise",
            "King's Promise",
            "Lasts 3 generations",
            vec![],
            3,
        );

        let effects = vec![heir_effect, bloodline_effect, gen_effect];
        let (inherited, expired) = EffectEngine::process_death_effects(&effects);

        assert_eq!(expired.len(), 1);
        assert_eq!(inherited.len(), 2);
    }
}
