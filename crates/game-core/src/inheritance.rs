use crate::effects::EffectEngine;
use crate::rng::GameRng;
use crate::types::*;

pub struct InheritanceEngine;

impl InheritanceEngine {
    pub fn resolve_death(
        heir: &Heir,
        lineage: &Lineage,
        active_effects: &[Effect],
        equipped_items: &[ItemData],
        inventory_items: &[ItemData],
    ) -> InheritanceResult {
        let (inherited_effects, expired_effects) =
            EffectEngine::process_death_effects(active_effects);

        let (inherited_items, lost_items) =
            Self::process_item_inheritance(equipped_items, inventory_items);

        let gold_inherited = Self::calculate_gold_inheritance(heir.gold, lineage);

        let unique_skills_released = Self::find_releasable_unique_skills(heir);

        let new_heir = Self::create_next_heir(
            &heir.owner_uid,
            &heir.lineage_id,
            lineage.generation + 1,
        );

        InheritanceResult {
            previous_heir_id: heir.id.clone(),
            new_heir,
            gold_inherited,
            items_inherited: inherited_items,
            items_lost: lost_items,
            effects_inherited: inherited_effects.iter().map(|e| e.id.clone()).collect(),
            effects_expired: expired_effects.iter().map(|e| e.id.clone()).collect(),
            unique_skills_released,
        }
    }

    fn process_item_inheritance(
        equipped: &[ItemData],
        inventory: &[ItemData],
    ) -> (Vec<String>, Vec<String>) {
        let mut inherited = Vec::new();
        let mut lost = Vec::new();

        for item in equipped.iter().chain(inventory.iter()) {
            if item.is_heirloom {
                inherited.push(item.id.clone());
            } else if item.is_soulbound {
                lost.push(item.id.clone());
            } else {
                lost.push(item.id.clone());
            }
        }

        (inherited, lost)
    }

    fn calculate_gold_inheritance(carried_gold: i64, _lineage: &Lineage) -> i64 {
        let inheritance_rate = 0.1;
        (carried_gold as f64 * inheritance_rate).floor() as i64
    }

    fn find_releasable_unique_skills(heir: &Heir) -> Vec<String> {
        heir.skill_ids
            .iter()
            .filter(|s| s.starts_with("unique_"))
            .cloned()
            .collect()
    }

    fn create_next_heir(owner_uid: &str, lineage_id: &str, generation: u32) -> Heir {
        Heir {
            id: uuid::Uuid::new_v4().to_string(),
            owner_uid: owner_uid.to_string(),
            lineage_id: lineage_id.to_string(),
            generation,
            name: String::new(),
            status: HeirStatus::Pending,
            class_id: String::new(),
            race_id: "human".to_string(),
            level: 1,
            xp: 0,
            gold: 0,
            stats: Stats::with_base(5),
            skill_ids: Vec::new(),
            effect_ids: Vec::new(),
            equipment: Equipment::default(),
            inventory: Vec::new(),
            job_records: std::collections::HashMap::new(),
            seed: uuid::Uuid::new_v4().to_string(),
        }
    }

    pub fn finalize_heir(
        heir: &mut Heir,
        class_data: &ClassData,
        race_data: &RaceData,
        name: String,
        inherited_effects: &[String],
        inherited_gold: i64,
        inherited_items: &[String],
    ) {
        heir.name = name;
        heir.class_id = class_data.id.clone();
        heir.race_id = race_data.id.clone();
        heir.status = HeirStatus::Alive;

        let mut stats = class_data.starting_stats;
        stats.strength += race_data.stat_modifiers.strength;
        stats.dexterity += race_data.stat_modifiers.dexterity;
        stats.intelligence += race_data.stat_modifiers.intelligence;
        stats.constitution += race_data.stat_modifiers.constitution;
        stats.luck += race_data.stat_modifiers.luck;
        stats.charisma += race_data.stat_modifiers.charisma;
        stats.faith += race_data.stat_modifiers.faith;
        stats.infamy += race_data.stat_modifiers.infamy;
        heir.stats = stats;

        heir.skill_ids = class_data.starting_skills.clone();

        heir.equipment = class_data.starting_equipment.clone();

        heir.effect_ids = inherited_effects.to_vec();
        heir.gold = inherited_gold;
        heir.inventory = inherited_items.to_vec();
    }

    pub fn calculate_race_from_bloodline(
        parent_race: &str,
        effects: &[Effect],
        rng: &mut GameRng,
    ) -> String {
        for effect in effects {
            if effect.effect_type == EffectType::Mutation {
                if let Some(race_change) = Self::get_mutation_race_change(effect) {
                    return race_change;
                }
            }
        }

        if rng.chance(5.0) {
            return Self::random_rare_ancestry(rng);
        }

        parent_race.to_string()
    }

    fn get_mutation_race_change(effect: &Effect) -> Option<String> {
        if effect.id.contains("vampirism") {
            Some("dhampir".to_string())
        } else if effect.id.contains("lycanthropy") {
            Some("werewolf".to_string())
        } else if effect.id.contains("draconic") {
            Some("dragonborn".to_string())
        } else {
            None
        }
    }

    fn random_rare_ancestry(rng: &mut GameRng) -> String {
        let ancestries = vec![
            ("half_elf", 40u32),
            ("half_orc", 30),
            ("tiefling", 20),
            ("aasimar", 10),
        ];
        
        rng.weighted_choice(&ancestries).unwrap_or("human".to_string())
    }
}

pub fn generate_heir_name(family_name: &str, generation: u32, rng: &mut GameRng) -> String {
    let first_names = vec![
        "Aldric", "Brennan", "Cedric", "Dorian", "Edmund", "Finnian", "Gareth", "Hadrian",
        "Isolde", "Jocelyn", "Katarina", "Lydia", "Mira", "Nadia", "Ophelia", "Petra",
        "Roland", "Sebastian", "Theron", "Ulric", "Vera", "Wilhelm", "Xander", "Yara", "Zara",
    ];

    let first_name = rng.pick(&first_names).unwrap_or("Unknown".to_string());
    
    if generation > 1 {
        let numerals = ["", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
        let numeral_idx = ((generation - 1) as usize).min(numerals.len() - 1);
        if !numerals[numeral_idx].is_empty() && rng.chance(30.0) {
            return format!("{} {} {}", first_name, family_name, numerals[numeral_idx]);
        }
    }

    format!("{} {}", first_name, family_name)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_heir() -> Heir {
        let mut heir = Heir::new(
            "test-uid".to_string(),
            "test-lineage".to_string(),
            3,
            "fighter".to_string(),
        );
        heir.gold = 1000;
        heir.status = HeirStatus::Alive;
        heir
    }

    fn create_test_lineage() -> Lineage {
        Lineage::new("test-uid".to_string(), "Ashworth".to_string())
    }

    #[test]
    fn test_death_resolution() {
        let heir = create_test_heir();
        let lineage = create_test_lineage();
        
        let result = InheritanceEngine::resolve_death(
            &heir,
            &lineage,
            &[],
            &[],
            &[],
        );

        assert_eq!(result.previous_heir_id, heir.id);
        assert_eq!(result.new_heir.generation, lineage.generation + 1);
        assert_eq!(result.new_heir.status, HeirStatus::Pending);
        assert_eq!(result.gold_inherited, 100);
    }

    #[test]
    fn test_heirloom_inheritance() {
        let heirloom = ItemData {
            id: "family_sword".to_string(),
            name: "Family Sword".to_string(),
            description: "Passed down through generations".to_string(),
            item_type: ItemType::Weapon,
            rarity: ItemRarity::Heirloom,
            stats: None,
            effects: vec![],
            value: 1000,
            is_bankable: true,
            is_soulbound: false,
            is_heirloom: true,
        };

        let normal_item = ItemData {
            id: "rusty_sword".to_string(),
            name: "Rusty Sword".to_string(),
            description: "A worn weapon".to_string(),
            item_type: ItemType::Weapon,
            rarity: ItemRarity::Common,
            stats: None,
            effects: vec![],
            value: 10,
            is_bankable: true,
            is_soulbound: false,
            is_heirloom: false,
        };

        let heir = create_test_heir();
        let lineage = create_test_lineage();
        
        let result = InheritanceEngine::resolve_death(
            &heir,
            &lineage,
            &[],
            &[heirloom, normal_item],
            &[],
        );

        assert!(result.items_inherited.contains(&"family_sword".to_string()));
        assert!(result.items_lost.contains(&"rusty_sword".to_string()));
    }

    #[test]
    fn test_name_generation() {
        let mut rng = GameRng::from_seed_string("name-test");
        let name = generate_heir_name("Ashworth", 1, &mut rng);
        
        assert!(name.contains("Ashworth"));
        assert!(!name.is_empty());
    }
}
