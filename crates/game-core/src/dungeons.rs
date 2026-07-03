use crate::combat::CombatEngine;
use crate::rng::GameRng;
use crate::types::*;
use std::collections::HashMap;

pub struct DungeonEngine;

impl DungeonEngine {
    pub fn attempt_floor(
        heir: &Heir,
        dungeon: &DungeonData,
        floor: u32,
        monsters: &HashMap<String, Monster>,
        seed: &str,
    ) -> DungeonAttemptResult {
        let floor_data = match dungeon.floors.get(floor as usize - 1) {
            Some(f) => f,
            None => return DungeonAttemptResult::floor_not_found(),
        };

        let mut rng = GameRng::from_seed_string(seed);

        let monster_id = if floor_data.floor == dungeon.floors.len() as u32 {
            floor_data.boss_id.clone().unwrap_or_else(|| {
                rng.pick(&floor_data.monster_pool).unwrap_or_default()
            })
        } else {
            rng.pick(&floor_data.monster_pool).unwrap_or_default()
        };

        let monster = match monsters.get(&monster_id) {
            Some(m) => Self::scale_monster(m, floor_data),
            None => return DungeonAttemptResult::monster_not_found(),
        };

        let mut combat_engine = CombatEngine::new(seed);
        let battle_result = combat_engine.resolve_battle(heir, &monster);

        let rewards = if battle_result.victory {
            DungeonRewards {
                gold: (battle_result.gold_gained as f32 * floor_data.loot_modifier) as i64,
                xp: (battle_result.xp_gained as f32 * floor_data.xp_modifier) as u64,
                items: battle_result.item_ids.clone(),
            }
        } else {
            DungeonRewards::default()
        };

        DungeonAttemptResult {
            success: true,
            floor,
            victory: battle_result.victory,
            heir_died: battle_result.heir_died,
            monster_faced: monster_id,
            battle: battle_result,
            rewards,
            floor_cleared: battle_result.victory,
            dungeon_completed: battle_result.victory && floor == dungeon.floors.len() as u32,
        }
    }

    fn scale_monster(base: &Monster, floor_data: &DungeonFloor) -> Monster {
        let floor_scaling = 1.0 + (floor_data.floor as f32 - 1.0) * 0.15;
        
        Monster {
            id: base.id.clone(),
            name: base.name.clone(),
            level: base.level + floor_data.floor - 1,
            hp: (base.hp as f32 * floor_scaling).round() as i32,
            damage: (base.damage as f32 * floor_scaling).round() as i32,
            defense: (base.defense as f32 * floor_scaling).round() as i32,
            dexterity: base.dexterity,
            xp_reward: (base.xp_reward as f32 * floor_scaling) as u64,
            gold_reward_min: (base.gold_reward_min as f32 * floor_scaling) as i64,
            gold_reward_max: (base.gold_reward_max as f32 * floor_scaling) as i64,
            loot_table: base.loot_table.clone(),
        }
    }

    pub fn can_enter_dungeon(heir: &Heir, dungeon: &DungeonData) -> Result<(), DungeonError> {
        if heir.level < dungeon.required_level {
            return Err(DungeonError::LevelTooLow(dungeon.required_level));
        }

        Ok(())
    }

    pub fn get_dungeon_progress(
        cleared_floors: &[u32],
        dungeon: &DungeonData,
    ) -> DungeonProgress {
        let highest_cleared = cleared_floors.iter().max().copied().unwrap_or(0);
        let total_floors = dungeon.floors.len() as u32;
        
        DungeonProgress {
            dungeon_id: dungeon.id.clone(),
            highest_floor_cleared: highest_cleared,
            total_floors,
            is_completed: highest_cleared >= total_floors,
            next_floor: if highest_cleared < total_floors {
                Some(highest_cleared + 1)
            } else {
                None
            },
        }
    }

    pub fn generate_dungeon_seed(lineage_id: &str, heir_id: &str, dungeon_id: &str, floor: u32, attempt: u32) -> String {
        format!("{}-{}-{}-{}-{}", lineage_id, heir_id, dungeon_id, floor, attempt)
    }
}

#[derive(Debug, Clone)]
pub struct DungeonAttemptResult {
    pub success: bool,
    pub floor: u32,
    pub victory: bool,
    pub heir_died: bool,
    pub monster_faced: String,
    pub battle: BattleResult,
    pub rewards: DungeonRewards,
    pub floor_cleared: bool,
    pub dungeon_completed: bool,
}

impl DungeonAttemptResult {
    fn floor_not_found() -> Self {
        Self {
            success: false,
            floor: 0,
            victory: false,
            heir_died: false,
            monster_faced: String::new(),
            battle: BattleResult {
                victory: false,
                heir_died: false,
                rounds: vec![],
                xp_gained: 0,
                gold_gained: 0,
                item_ids: vec![],
                final_heir_hp: 0,
                final_enemy_hp: 0,
            },
            rewards: DungeonRewards::default(),
            floor_cleared: false,
            dungeon_completed: false,
        }
    }

    fn monster_not_found() -> Self {
        Self::floor_not_found()
    }
}

#[derive(Debug, Clone, Default)]
pub struct DungeonRewards {
    pub gold: i64,
    pub xp: u64,
    pub items: Vec<String>,
}

#[derive(Debug, Clone)]
pub struct DungeonProgress {
    pub dungeon_id: String,
    pub highest_floor_cleared: u32,
    pub total_floors: u32,
    pub is_completed: bool,
    pub next_floor: Option<u32>,
}

#[derive(Debug, Clone, PartialEq)]
pub enum DungeonError {
    LevelTooLow(u32),
    DungeonNotFound,
    FloorNotAccessible,
    AlreadyInDungeon,
}

impl std::fmt::Display for DungeonError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::LevelTooLow(required) => write!(f, "Level {} required", required),
            Self::DungeonNotFound => write!(f, "Dungeon not found"),
            Self::FloorNotAccessible => write!(f, "Floor not accessible"),
            Self::AlreadyInDungeon => write!(f, "Already in dungeon"),
        }
    }
}

impl std::error::Error for DungeonError {}

pub fn create_dungeon_data(
    id: &str,
    name: &str,
    description: &str,
    required_level: u32,
    floor_count: u32,
    monster_pool: Vec<String>,
    boss_id: Option<String>,
) -> DungeonData {
    let floors: Vec<DungeonFloor> = (1..=floor_count)
        .map(|floor| DungeonFloor {
            floor,
            monster_pool: monster_pool.clone(),
            boss_id: if floor == floor_count { boss_id.clone() } else { None },
            loot_modifier: 1.0 + (floor as f32 - 1.0) * 0.1,
            xp_modifier: 1.0 + (floor as f32 - 1.0) * 0.1,
        })
        .collect();

    DungeonData {
        id: id.to_string(),
        name: name.to_string(),
        description: description.to_string(),
        floors,
        required_level,
    }
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
            strength: 12,
            dexterity: 10,
            intelligence: 5,
            constitution: 10,
            luck: 5,
            charisma: 5,
            faith: 3,
            infamy: 0,
        };
        heir.level = 5;
        heir.status = HeirStatus::Alive;
        heir
    }

    fn create_test_dungeon() -> DungeonData {
        create_dungeon_data(
            "goblin_caves",
            "Goblin Caves",
            "A cave system infested with goblins",
            1,
            10,
            vec!["goblin".to_string(), "goblin_archer".to_string()],
            Some("goblin_king".to_string()),
        )
    }

    fn create_test_monsters() -> HashMap<String, Monster> {
        let mut monsters = HashMap::new();
        
        monsters.insert("goblin".to_string(), Monster {
            id: "goblin".to_string(),
            name: "Goblin".to_string(),
            level: 1,
            hp: 30,
            damage: 5,
            defense: 3,
            dexterity: 6,
            xp_reward: 15,
            gold_reward_min: 3,
            gold_reward_max: 8,
            loot_table: vec![],
        });

        monsters.insert("goblin_king".to_string(), Monster {
            id: "goblin_king".to_string(),
            name: "Goblin King".to_string(),
            level: 10,
            hp: 150,
            damage: 20,
            defense: 15,
            dexterity: 8,
            xp_reward: 200,
            gold_reward_min: 50,
            gold_reward_max: 100,
            loot_table: vec![],
        });

        monsters
    }

    #[test]
    fn test_dungeon_attempt_determinism() {
        let heir = create_test_heir();
        let dungeon = create_test_dungeon();
        let monsters = create_test_monsters();
        let seed = "test-seed-123";

        let result1 = DungeonEngine::attempt_floor(&heir, &dungeon, 1, &monsters, seed);
        let result2 = DungeonEngine::attempt_floor(&heir, &dungeon, 1, &monsters, seed);

        assert_eq!(result1.victory, result2.victory);
        assert_eq!(result1.heir_died, result2.heir_died);
        assert_eq!(result1.rewards.gold, result2.rewards.gold);
    }

    #[test]
    fn test_floor_scaling() {
        let heir = create_test_heir();
        let dungeon = create_test_dungeon();
        let monsters = create_test_monsters();

        let result_floor1 = DungeonEngine::attempt_floor(&heir, &dungeon, 1, &monsters, "seed1");
        let result_floor5 = DungeonEngine::attempt_floor(&heir, &dungeon, 5, &monsters, "seed1");

        assert!(result_floor5.rewards.xp >= result_floor1.rewards.xp || !result_floor5.victory);
    }

    #[test]
    fn test_level_requirement() {
        let mut heir = create_test_heir();
        heir.level = 1;
        
        let dungeon = DungeonData {
            id: "hard_dungeon".to_string(),
            name: "Hard Dungeon".to_string(),
            description: "For experienced adventurers".to_string(),
            floors: vec![],
            required_level: 10,
        };

        let result = DungeonEngine::can_enter_dungeon(&heir, &dungeon);
        assert!(matches!(result, Err(DungeonError::LevelTooLow(10))));
    }

    #[test]
    fn test_dungeon_progress() {
        let dungeon = create_test_dungeon();
        let cleared = vec![1, 2, 3];

        let progress = DungeonEngine::get_dungeon_progress(&cleared, &dungeon);

        assert_eq!(progress.highest_floor_cleared, 3);
        assert_eq!(progress.next_floor, Some(4));
        assert!(!progress.is_completed);
    }
}
