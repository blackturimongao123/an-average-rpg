use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Copy, Serialize, Deserialize, Default, PartialEq)]
pub struct Stats {
    pub strength: i32,
    pub dexterity: i32,
    pub intelligence: i32,
    pub constitution: i32,
    pub luck: i32,
    pub charisma: i32,
    pub faith: i32,
    pub infamy: i32,
}

impl Stats {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn with_base(base: i32) -> Self {
        Self {
            strength: base,
            dexterity: base,
            intelligence: base,
            constitution: base,
            luck: base,
            charisma: base,
            faith: base,
            infamy: 0,
        }
    }
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum HeirStatus {
    Alive,
    Dead,
    Pending,
}

impl Default for HeirStatus {
    fn default() -> Self {
        Self::Pending
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Heir {
    pub id: String,
    pub owner_uid: String,
    pub lineage_id: String,
    pub generation: u32,
    pub name: String,
    pub status: HeirStatus,
    pub class_id: String,
    pub race_id: String,
    pub level: u32,
    pub xp: u64,
    pub gold: i64,
    pub stats: Stats,
    pub skill_ids: Vec<String>,
    pub effect_ids: Vec<String>,
    pub equipment: Equipment,
    pub inventory: Vec<String>,
    pub job_records: std::collections::HashMap<String, JobRecord>,
    pub seed: String,
}

impl Heir {
    pub fn new(owner_uid: String, lineage_id: String, generation: u32, class_id: String) -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            owner_uid,
            lineage_id,
            generation,
            name: String::new(),
            status: HeirStatus::Pending,
            class_id,
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
            seed: Uuid::new_v4().to_string(),
        }
    }

    pub fn max_hp(&self) -> i32 {
        50 + self.stats.constitution * 10 + (self.level as i32) * 8
    }

    pub fn is_alive(&self) -> bool {
        self.status == HeirStatus::Alive
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct Equipment {
    pub weapon: Option<String>,
    pub armor: Option<String>,
    pub accessory: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JobRecord {
    pub job_id: String,
    pub level: u32,
    pub xp: u64,
    pub position: JobPosition,
    pub salary_per_day: i64,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum JobPosition {
    Apprentice,
    Worker,
    Specialist,
    Master,
    Guildmaster,
}

impl Default for JobPosition {
    fn default() -> Self {
        Self::Apprentice
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Lineage {
    pub id: String,
    pub owner_uid: String,
    pub family_name: String,
    pub generation: u32,
    pub active_heir_id: Option<String>,
    pub bank_gold: i64,
    pub bank_slots: u32,
}

impl Lineage {
    pub fn new(owner_uid: String, family_name: String) -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            owner_uid,
            family_name,
            generation: 1,
            active_heir_id: None,
            bank_gold: 0,
            bank_slots: 10,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BattleResult {
    pub victory: bool,
    pub heir_died: bool,
    pub rounds: Vec<BattleRound>,
    pub xp_gained: u64,
    pub gold_gained: i64,
    pub item_ids: Vec<String>,
    pub final_heir_hp: i32,
    pub final_enemy_hp: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BattleRound {
    pub round: u32,
    pub actor: String,
    pub action: String,
    pub damage: i32,
    pub actor_hp_after: i32,
    pub target_hp_after: i32,
    pub is_crit: bool,
    pub is_miss: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Monster {
    pub id: String,
    pub name: String,
    pub level: u32,
    pub hp: i32,
    pub damage: i32,
    pub defense: i32,
    pub dexterity: i32,
    pub xp_reward: u64,
    pub gold_reward_min: i64,
    pub gold_reward_max: i64,
    pub loot_table: Vec<LootEntry>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LootEntry {
    pub item_id: String,
    pub weight: u32,
    pub min_quantity: u32,
    pub max_quantity: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClassData {
    pub id: String,
    pub name: String,
    pub description: String,
    pub main_stat: String,
    pub starting_stats: Stats,
    pub stat_growth: Stats,
    pub starting_skills: Vec<String>,
    pub starting_equipment: Equipment,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RaceData {
    pub id: String,
    pub name: String,
    pub description: String,
    pub stat_modifiers: Stats,
    pub special_traits: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SkillNode {
    pub id: String,
    pub name: String,
    pub description: String,
    pub class_tags: Vec<String>,
    pub cost: u32,
    pub requires: Vec<String>,
    pub blocks: Vec<String>,
    pub grants: Vec<Effect>,
    pub position: Position2D,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, Default)]
pub struct Position2D {
    pub x: f32,
    pub y: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Effect {
    pub id: String,
    pub name: String,
    pub description: String,
    pub effect_type: EffectType,
    pub scope: EffectScope,
    pub duration: EffectDuration,
    pub modifiers: Vec<StatModifier>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum EffectType {
    Buff,
    Debuff,
    Curse,
    Blessing,
    Mutation,
    Passive,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum EffectScope {
    Heir,
    Bloodline,
    Generations(u32),
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum EffectDuration {
    Permanent,
    Temporary(u32),
    UntilDeath,
    Generations(u32),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StatModifier {
    pub stat: String,
    pub modifier_type: ModifierType,
    pub value: i32,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum ModifierType {
    Flat,
    Percent,
    Override,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JobData {
    pub id: String,
    pub name: String,
    pub description: String,
    pub base_salary: i64,
    pub xp_per_shift: u64,
    pub required_stats: Option<Stats>,
    pub unlocked_skills: Vec<String>,
    pub promotion_thresholds: Vec<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DungeonData {
    pub id: String,
    pub name: String,
    pub description: String,
    pub floors: Vec<DungeonFloor>,
    pub required_level: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DungeonFloor {
    pub floor: u32,
    pub monster_pool: Vec<String>,
    pub boss_id: Option<String>,
    pub loot_modifier: f32,
    pub xp_modifier: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TavernEvent {
    pub id: String,
    pub name: String,
    pub description: String,
    pub requirements: EventRequirements,
    pub choices: Vec<EventChoice>,
    pub weight: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct EventRequirements {
    pub min_level: Option<u32>,
    pub min_generation: Option<u32>,
    pub required_class: Option<String>,
    pub required_job: Option<String>,
    pub required_stats: Option<Stats>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventChoice {
    pub id: String,
    pub text: String,
    pub stat_check: Option<StatCheck>,
    pub outcomes: Vec<EventOutcome>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StatCheck {
    pub stat: String,
    pub difficulty: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventOutcome {
    pub weight: u32,
    pub description: String,
    pub gold_delta: i64,
    pub xp_delta: u64,
    pub item_rewards: Vec<String>,
    pub effects_added: Vec<String>,
    pub effects_removed: Vec<String>,
    pub heir_dies: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ItemData {
    pub id: String,
    pub name: String,
    pub description: String,
    pub item_type: ItemType,
    pub rarity: ItemRarity,
    pub stats: Option<Stats>,
    pub effects: Vec<String>,
    pub value: i64,
    pub is_bankable: bool,
    pub is_soulbound: bool,
    pub is_heirloom: bool,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum ItemType {
    Weapon,
    Armor,
    Accessory,
    Consumable,
    Material,
    Quest,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum ItemRarity {
    Common,
    Uncommon,
    Rare,
    Epic,
    Legendary,
    Cursed,
    Heirloom,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UniqueSkill {
    pub skill_id: String,
    pub holder_uid: Option<String>,
    pub holder_lineage_id: Option<String>,
    pub holder_heir_id: Option<String>,
    pub release_condition: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BankItem {
    pub id: String,
    pub item_id: String,
    pub quantity: u32,
    pub deposited_at: String,
    pub deposited_by_heir_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InheritanceResult {
    pub previous_heir_id: String,
    pub new_heir: Heir,
    pub gold_inherited: i64,
    pub items_inherited: Vec<String>,
    pub items_lost: Vec<String>,
    pub effects_inherited: Vec<String>,
    pub effects_expired: Vec<String>,
    pub unique_skills_released: Vec<String>,
}
