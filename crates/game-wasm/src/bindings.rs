use game_core::{
    combat::CombatEngine,
    dungeons::DungeonEngine,
    effects::EffectEngine,
    inheritance::InheritanceEngine,
    jobs::JobEngine,
    rng::GameRng,
    skills::SkillTreeEngine,
    types::*,
};
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn simulate_combat(heir_json: &str, monster_json: &str, seed: &str) -> Result<String, JsValue> {
    let heir: Heir = serde_json::from_str(heir_json)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse heir: {}", e)))?;
    
    let monster: Monster = serde_json::from_str(monster_json)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse monster: {}", e)))?;

    let mut engine = CombatEngine::new(seed);
    let result = engine.resolve_battle(&heir, &monster);

    serde_json::to_string(&result)
        .map_err(|e| JsValue::from_str(&format!("Failed to serialize result: {}", e)))
}

#[wasm_bindgen]
pub fn preview_inheritance(
    heir_json: &str,
    lineage_json: &str,
    effects_json: &str,
) -> Result<String, JsValue> {
    let heir: Heir = serde_json::from_str(heir_json)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse heir: {}", e)))?;
    
    let lineage: Lineage = serde_json::from_str(lineage_json)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse lineage: {}", e)))?;
    
    let effects: Vec<Effect> = serde_json::from_str(effects_json)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse effects: {}", e)))?;

    let result = InheritanceEngine::resolve_death(&heir, &lineage, &effects, &[], &[]);

    serde_json::to_string(&result)
        .map_err(|e| JsValue::from_str(&format!("Failed to serialize result: {}", e)))
}

#[wasm_bindgen]
pub fn apply_stat_effects(stats_json: &str, effects_json: &str) -> Result<String, JsValue> {
    let stats: Stats = serde_json::from_str(stats_json)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse stats: {}", e)))?;
    
    let effects: Vec<Effect> = serde_json::from_str(effects_json)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse effects: {}", e)))?;

    let modified = EffectEngine::apply_stat_modifiers(&stats, &effects);

    serde_json::to_string(&modified)
        .map_err(|e| JsValue::from_str(&format!("Failed to serialize stats: {}", e)))
}

#[wasm_bindgen]
pub fn check_skill_availability(
    heir_json: &str,
    skill_json: &str,
    all_skills_json: &str,
    available_points: u32,
) -> Result<String, JsValue> {
    let heir: Heir = serde_json::from_str(heir_json)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse heir: {}", e)))?;
    
    let skill: SkillNode = serde_json::from_str(skill_json)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse skill: {}", e)))?;
    
    let all_skills: std::collections::HashMap<String, SkillNode> = serde_json::from_str(all_skills_json)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse skills: {}", e)))?;

    let result = SkillTreeEngine::can_claim_skill(&heir, &skill, &all_skills, available_points);

    #[derive(Serialize)]
    struct SkillCheckResult {
        can_claim: bool,
        error: Option<String>,
    }

    let check_result = match result {
        Ok(()) => SkillCheckResult {
            can_claim: true,
            error: None,
        },
        Err(e) => SkillCheckResult {
            can_claim: false,
            error: Some(e.to_string()),
        },
    };

    serde_json::to_string(&check_result)
        .map_err(|e| JsValue::from_str(&format!("Failed to serialize result: {}", e)))
}

#[wasm_bindgen]
pub fn get_available_skills(
    heir_json: &str,
    all_skills_json: &str,
    available_points: u32,
) -> Result<String, JsValue> {
    let heir: Heir = serde_json::from_str(heir_json)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse heir: {}", e)))?;
    
    let all_skills: std::collections::HashMap<String, SkillNode> = serde_json::from_str(all_skills_json)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse skills: {}", e)))?;

    let available = SkillTreeEngine::get_available_skills(&heir, &all_skills, available_points);

    serde_json::to_string(&available)
        .map_err(|e| JsValue::from_str(&format!("Failed to serialize result: {}", e)))
}

#[wasm_bindgen]
pub fn calculate_max_hp(constitution: i32, level: u32) -> i32 {
    game_core::combat::calculate_max_hp(constitution, level)
}

#[wasm_bindgen]
pub fn calculate_armor_reduction(armor: i32) -> f32 {
    game_core::combat::calculate_armor_reduction(armor)
}

#[wasm_bindgen]
pub fn generate_random_seed() -> String {
    uuid::Uuid::new_v4().to_string()
}

#[wasm_bindgen]
pub fn get_dungeon_progress(
    cleared_floors_json: &str,
    dungeon_json: &str,
) -> Result<String, JsValue> {
    let cleared_floors: Vec<u32> = serde_json::from_str(cleared_floors_json)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse floors: {}", e)))?;
    
    let dungeon: DungeonData = serde_json::from_str(dungeon_json)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse dungeon: {}", e)))?;

    let progress = DungeonEngine::get_dungeon_progress(&cleared_floors, &dungeon);

    serde_json::to_string(&progress)
        .map_err(|e| JsValue::from_str(&format!("Failed to serialize progress: {}", e)))
}

#[derive(Serialize, Deserialize)]
pub struct JobShiftPreview {
    pub estimated_salary: i64,
    pub estimated_xp: u64,
    pub current_position: String,
    pub progress_to_promotion: f32,
}

#[wasm_bindgen]
pub fn preview_job_shift(
    heir_json: &str,
    job_data_json: &str,
) -> Result<String, JsValue> {
    let heir: Heir = serde_json::from_str(heir_json)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse heir: {}", e)))?;
    
    let job_data: JobData = serde_json::from_str(job_data_json)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse job: {}", e)))?;

    let job_record = heir.job_records.get(&job_data.id);
    
    let (position, progress) = match job_record {
        Some(record) => {
            let threshold_idx = match record.position {
                JobPosition::Apprentice => 0,
                JobPosition::Worker => 1,
                JobPosition::Specialist => 2,
                JobPosition::Master => 3,
                JobPosition::Guildmaster => 4,
            };
            
            let threshold = job_data.promotion_thresholds
                .get(threshold_idx)
                .copied()
                .unwrap_or(u64::MAX);
            
            let progress = if threshold > 0 {
                (record.xp as f32 / threshold as f32).min(1.0)
            } else {
                1.0
            };
            
            (format!("{:?}", record.position), progress)
        }
        None => ("Apprentice".to_string(), 0.0),
    };

    let position_multiplier = match position.as_str() {
        "Apprentice" => 0.5,
        "Worker" => 1.0,
        "Specialist" => 1.5,
        "Master" => 2.0,
        "Guildmaster" => 3.0,
        _ => 0.5,
    };

    let preview = JobShiftPreview {
        estimated_salary: (job_data.base_salary as f64 * position_multiplier) as i64,
        estimated_xp: job_data.xp_per_shift,
        current_position: position,
        progress_to_promotion: progress,
    };

    serde_json::to_string(&preview)
        .map_err(|e| JsValue::from_str(&format!("Failed to serialize preview: {}", e)))
}

#[wasm_bindgen]
pub fn generate_heir_name(family_name: &str, generation: u32, seed: &str) -> String {
    let mut rng = GameRng::from_seed_string(seed);
    game_core::inheritance::generate_heir_name(family_name, generation, &mut rng)
}
