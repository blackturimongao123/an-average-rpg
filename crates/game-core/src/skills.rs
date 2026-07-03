use crate::types::*;
use std::collections::{HashMap, HashSet};

pub struct SkillTreeEngine;

impl SkillTreeEngine {
    pub fn can_claim_skill(
        heir: &Heir,
        skill: &SkillNode,
        all_skills: &HashMap<String, SkillNode>,
        skill_costs: u32,
    ) -> Result<(), SkillClaimError> {
        if heir.skill_ids.contains(&skill.id) {
            return Err(SkillClaimError::AlreadyOwned);
        }

        if !skill.class_tags.is_empty() && !skill.class_tags.contains(&heir.class_id) {
            return Err(SkillClaimError::WrongClass);
        }

        for required_id in &skill.requires {
            if !heir.skill_ids.contains(required_id) {
                return Err(SkillClaimError::MissingRequirement(required_id.clone()));
            }
        }

        for blocked_id in &skill.blocks {
            if heir.skill_ids.contains(blocked_id) {
                return Err(SkillClaimError::BlockedBySkill(blocked_id.clone()));
            }
        }

        for owned_skill_id in &heir.skill_ids {
            if let Some(owned_skill) = all_skills.get(owned_skill_id) {
                if owned_skill.blocks.contains(&skill.id) {
                    return Err(SkillClaimError::BlockedBySkill(owned_skill_id.clone()));
                }
            }
        }

        if skill_costs > skill.cost {
            return Err(SkillClaimError::InsufficientPoints);
        }

        Ok(())
    }

    pub fn get_available_skills(
        heir: &Heir,
        all_skills: &HashMap<String, SkillNode>,
        available_points: u32,
    ) -> Vec<String> {
        all_skills
            .values()
            .filter(|skill| {
                Self::can_claim_skill(heir, skill, all_skills, available_points).is_ok()
            })
            .map(|s| s.id.clone())
            .collect()
    }

    pub fn get_skill_path(
        from_skill: &str,
        to_skill: &str,
        all_skills: &HashMap<String, SkillNode>,
    ) -> Option<Vec<String>> {
        let target = all_skills.get(to_skill)?;
        
        let mut path = vec![to_skill.to_string()];
        let mut current_requirements: Vec<String> = target.requires.clone();
        let mut visited: HashSet<String> = HashSet::new();
        visited.insert(to_skill.to_string());

        while !current_requirements.is_empty() {
            let req = current_requirements.remove(0);
            
            if visited.contains(&req) {
                continue;
            }
            visited.insert(req.clone());

            if req == from_skill {
                path.push(req);
                break;
            }

            if let Some(skill) = all_skills.get(&req) {
                path.push(req.clone());
                for prereq in &skill.requires {
                    if !visited.contains(prereq) {
                        current_requirements.push(prereq.clone());
                    }
                }
            }
        }

        path.reverse();
        Some(path)
    }

    pub fn calculate_total_skill_cost(skill_ids: &[String], all_skills: &HashMap<String, SkillNode>) -> u32 {
        skill_ids
            .iter()
            .filter_map(|id| all_skills.get(id))
            .map(|s| s.cost)
            .sum()
    }

    pub fn get_blocked_skills(
        heir: &Heir,
        all_skills: &HashMap<String, SkillNode>,
    ) -> Vec<String> {
        let mut blocked = HashSet::new();

        for skill_id in &heir.skill_ids {
            if let Some(skill) = all_skills.get(skill_id) {
                for blocked_id in &skill.blocks {
                    blocked.insert(blocked_id.clone());
                }
            }
        }

        blocked.into_iter().collect()
    }

    pub fn apply_skill_effects(heir: &mut Heir, skill: &SkillNode) {
        heir.skill_ids.push(skill.id.clone());
        
        for effect in &skill.grants {
            if !heir.effect_ids.contains(&effect.id) {
                heir.effect_ids.push(effect.id.clone());
            }
        }
    }
}

#[derive(Debug, Clone, PartialEq)]
pub enum SkillClaimError {
    AlreadyOwned,
    WrongClass,
    MissingRequirement(String),
    BlockedBySkill(String),
    InsufficientPoints,
    SkillNotFound,
    UniqueSkillTaken,
}

impl std::fmt::Display for SkillClaimError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::AlreadyOwned => write!(f, "Skill already owned"),
            Self::WrongClass => write!(f, "Skill not available for this class"),
            Self::MissingRequirement(req) => write!(f, "Missing required skill: {}", req),
            Self::BlockedBySkill(blocker) => write!(f, "Blocked by owned skill: {}", blocker),
            Self::InsufficientPoints => write!(f, "Not enough skill points"),
            Self::SkillNotFound => write!(f, "Skill not found"),
            Self::UniqueSkillTaken => write!(f, "This unique skill is already claimed by another player"),
        }
    }
}

impl std::error::Error for SkillClaimError {}

pub fn create_skill_node(
    id: &str,
    name: &str,
    description: &str,
    cost: u32,
    class_tags: Vec<&str>,
    requires: Vec<&str>,
    blocks: Vec<&str>,
    position: (f32, f32),
) -> SkillNode {
    SkillNode {
        id: id.to_string(),
        name: name.to_string(),
        description: description.to_string(),
        class_tags: class_tags.into_iter().map(String::from).collect(),
        cost,
        requires: requires.into_iter().map(String::from).collect(),
        blocks: blocks.into_iter().map(String::from).collect(),
        grants: Vec::new(),
        position: Position2D {
            x: position.0,
            y: position.1,
        },
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_skills() -> HashMap<String, SkillNode> {
        let mut skills = HashMap::new();
        
        skills.insert(
            "basic_combat".to_string(),
            create_skill_node("basic_combat", "Basic Combat", "Foundation of combat", 1, vec![], vec![], vec![], (0.0, 0.0)),
        );
        
        skills.insert(
            "shield_wall".to_string(),
            create_skill_node("shield_wall", "Shield Wall", "Defensive stance", 2, vec!["fighter"], vec!["basic_combat"], vec!["dual_wield"], (1.0, 0.0)),
        );
        
        skills.insert(
            "dual_wield".to_string(),
            create_skill_node("dual_wield", "Dual Wield", "Wield two weapons", 2, vec!["rogue", "fighter"], vec!["basic_combat"], vec!["shield_wall"], (1.0, 1.0)),
        );
        
        skills.insert(
            "power_strike".to_string(),
            create_skill_node("power_strike", "Power Strike", "Heavy attack", 3, vec!["fighter"], vec!["basic_combat"], vec![], (2.0, 0.0)),
        );

        skills
    }

    fn create_test_heir() -> Heir {
        let mut heir = Heir::new(
            "test-uid".to_string(),
            "test-lineage".to_string(),
            1,
            "fighter".to_string(),
        );
        heir.skill_ids = vec!["basic_combat".to_string()];
        heir
    }

    #[test]
    fn test_can_claim_available_skill() {
        let heir = create_test_heir();
        let skills = create_test_skills();
        let shield_wall = skills.get("shield_wall").unwrap();

        let result = SkillTreeEngine::can_claim_skill(&heir, shield_wall, &skills, 10);
        assert!(result.is_ok());
    }

    #[test]
    fn test_cannot_claim_blocked_skill() {
        let mut heir = create_test_heir();
        heir.skill_ids.push("shield_wall".to_string());
        let skills = create_test_skills();
        let dual_wield = skills.get("dual_wield").unwrap();

        let result = SkillTreeEngine::can_claim_skill(&heir, dual_wield, &skills, 10);
        assert!(matches!(result, Err(SkillClaimError::BlockedBySkill(_))));
    }

    #[test]
    fn test_cannot_claim_missing_requirement() {
        let mut heir = create_test_heir();
        heir.skill_ids.clear();
        let skills = create_test_skills();
        let shield_wall = skills.get("shield_wall").unwrap();

        let result = SkillTreeEngine::can_claim_skill(&heir, shield_wall, &skills, 10);
        assert!(matches!(result, Err(SkillClaimError::MissingRequirement(_))));
    }

    #[test]
    fn test_class_restriction() {
        let mut heir = create_test_heir();
        heir.class_id = "mage".to_string();
        let skills = create_test_skills();
        let shield_wall = skills.get("shield_wall").unwrap();

        let result = SkillTreeEngine::can_claim_skill(&heir, shield_wall, &skills, 10);
        assert!(matches!(result, Err(SkillClaimError::WrongClass)));
    }

    #[test]
    fn test_get_available_skills() {
        let heir = create_test_heir();
        let skills = create_test_skills();

        let available = SkillTreeEngine::get_available_skills(&heir, &skills, 10);
        
        assert!(available.contains(&"shield_wall".to_string()));
        assert!(available.contains(&"dual_wield".to_string()));
        assert!(available.contains(&"power_strike".to_string()));
        assert!(!available.contains(&"basic_combat".to_string()));
    }

    #[test]
    fn test_get_blocked_skills() {
        let mut heir = create_test_heir();
        heir.skill_ids.push("shield_wall".to_string());
        let skills = create_test_skills();

        let blocked = SkillTreeEngine::get_blocked_skills(&heir, &skills);
        
        assert!(blocked.contains(&"dual_wield".to_string()));
    }
}
