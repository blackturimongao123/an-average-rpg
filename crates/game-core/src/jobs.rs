use crate::rng::GameRng;
use crate::types::*;

pub struct JobEngine;

impl JobEngine {
    pub fn work_shift(
        heir: &mut Heir,
        job_data: &JobData,
        rng: &mut GameRng,
    ) -> JobShiftResult {
        let job_record = heir.job_records
            .entry(job_data.id.clone())
            .or_insert_with(|| JobRecord {
                job_id: job_data.id.clone(),
                level: 1,
                xp: 0,
                position: JobPosition::Apprentice,
                salary_per_day: job_data.base_salary,
            });

        let salary_earned = Self::calculate_salary(job_record, job_data);
        heir.gold += salary_earned;

        let xp_earned = Self::calculate_xp(job_data, job_record.position);
        job_record.xp += xp_earned;

        let promoted = Self::check_promotion(job_record, job_data);

        let event = Self::roll_job_event(job_data, job_record, rng);

        let skills_unlocked = Self::check_skill_unlocks(job_record, job_data, heir);

        JobShiftResult {
            salary_earned,
            xp_earned,
            promoted,
            new_position: if promoted { Some(job_record.position) } else { None },
            event,
            skills_unlocked,
        }
    }

    fn calculate_salary(job_record: &JobRecord, job_data: &JobData) -> i64 {
        let position_multiplier = match job_record.position {
            JobPosition::Apprentice => 0.5,
            JobPosition::Worker => 1.0,
            JobPosition::Specialist => 1.5,
            JobPosition::Master => 2.0,
            JobPosition::Guildmaster => 3.0,
        };

        let level_bonus = (job_record.level as f64 - 1.0) * 0.1;
        
        let base = job_data.base_salary as f64;
        (base * position_multiplier * (1.0 + level_bonus)).round() as i64
    }

    fn calculate_xp(job_data: &JobData, position: JobPosition) -> u64 {
        let position_multiplier = match position {
            JobPosition::Apprentice => 1.0,
            JobPosition::Worker => 0.8,
            JobPosition::Specialist => 0.6,
            JobPosition::Master => 0.4,
            JobPosition::Guildmaster => 0.2,
        };

        (job_data.xp_per_shift as f64 * position_multiplier).round() as u64
    }

    fn check_promotion(job_record: &mut JobRecord, job_data: &JobData) -> bool {
        let threshold_idx = match job_record.position {
            JobPosition::Apprentice => 0,
            JobPosition::Worker => 1,
            JobPosition::Specialist => 2,
            JobPosition::Master => 3,
            JobPosition::Guildmaster => return false,
        };

        if threshold_idx >= job_data.promotion_thresholds.len() {
            return false;
        }

        let threshold = job_data.promotion_thresholds[threshold_idx];
        
        if job_record.xp >= threshold {
            job_record.position = match job_record.position {
                JobPosition::Apprentice => JobPosition::Worker,
                JobPosition::Worker => JobPosition::Specialist,
                JobPosition::Specialist => JobPosition::Master,
                JobPosition::Master => JobPosition::Guildmaster,
                JobPosition::Guildmaster => JobPosition::Guildmaster,
            };
            job_record.level += 1;
            job_record.xp = 0;
            true
        } else {
            false
        }
    }

    fn roll_job_event(
        job_data: &JobData,
        job_record: &JobRecord,
        rng: &mut GameRng,
    ) -> Option<JobEvent> {
        if !rng.chance(15.0) {
            return None;
        }

        let events = Self::get_job_events(&job_data.id, job_record.position);
        rng.pick(&events)
    }

    fn get_job_events(job_id: &str, position: JobPosition) -> Vec<JobEvent> {
        let mut events = Vec::new();

        match job_id {
            "guard" => {
                events.push(JobEvent {
                    id: "guard_bribe".to_string(),
                    description: "A merchant offers you gold to look the other way.".to_string(),
                    gold_delta: 50,
                    xp_delta: 0,
                    infamy_delta: 1,
                });
                events.push(JobEvent {
                    id: "guard_commendation".to_string(),
                    description: "Your captain commends your diligence.".to_string(),
                    gold_delta: 10,
                    xp_delta: 25,
                    infamy_delta: 0,
                });
            }
            "blacksmith" => {
                events.push(JobEvent {
                    id: "smith_masterwork".to_string(),
                    description: "You craft an exceptional piece!".to_string(),
                    gold_delta: 30,
                    xp_delta: 50,
                    infamy_delta: 0,
                });
                if position == JobPosition::Master || position == JobPosition::Guildmaster {
                    events.push(JobEvent {
                        id: "smith_noble_order".to_string(),
                        description: "A noble commissions custom armor.".to_string(),
                        gold_delta: 100,
                        xp_delta: 75,
                        infamy_delta: 0,
                    });
                }
            }
            "scribe" => {
                events.push(JobEvent {
                    id: "scribe_secret".to_string(),
                    description: "You discover a secret in the documents...".to_string(),
                    gold_delta: 0,
                    xp_delta: 30,
                    infamy_delta: 0,
                });
            }
            "gravekeeper" => {
                events.push(JobEvent {
                    id: "grave_treasure".to_string(),
                    description: "You find something valuable while digging.".to_string(),
                    gold_delta: 25,
                    xp_delta: 10,
                    infamy_delta: 1,
                });
                events.push(JobEvent {
                    id: "grave_undead".to_string(),
                    description: "The dead stir... but you calm them.".to_string(),
                    gold_delta: 0,
                    xp_delta: 40,
                    infamy_delta: 0,
                });
            }
            _ => {}
        }

        events
    }

    fn check_skill_unlocks(
        job_record: &JobRecord,
        job_data: &JobData,
        heir: &Heir,
    ) -> Vec<String> {
        job_data
            .unlocked_skills
            .iter()
            .filter(|skill_id| !heir.skill_ids.contains(skill_id))
            .filter(|_| job_record.level >= 3)
            .cloned()
            .collect()
    }

    pub fn can_take_job(heir: &Heir, job_data: &JobData) -> Result<(), JobError> {
        if let Some(ref required_stats) = job_data.required_stats {
            if heir.stats.strength < required_stats.strength {
                return Err(JobError::InsufficientStats("strength".to_string()));
            }
            if heir.stats.dexterity < required_stats.dexterity {
                return Err(JobError::InsufficientStats("dexterity".to_string()));
            }
            if heir.stats.intelligence < required_stats.intelligence {
                return Err(JobError::InsufficientStats("intelligence".to_string()));
            }
        }

        Ok(())
    }

    pub fn get_job_summary(heir: &Heir, job_id: &str) -> Option<JobSummary> {
        let record = heir.job_records.get(job_id)?;
        
        Some(JobSummary {
            job_id: job_id.to_string(),
            level: record.level,
            xp: record.xp,
            position: record.position,
            total_earned: 0,
        })
    }
}

#[derive(Debug, Clone)]
pub struct JobShiftResult {
    pub salary_earned: i64,
    pub xp_earned: u64,
    pub promoted: bool,
    pub new_position: Option<JobPosition>,
    pub event: Option<JobEvent>,
    pub skills_unlocked: Vec<String>,
}

#[derive(Debug, Clone)]
pub struct JobEvent {
    pub id: String,
    pub description: String,
    pub gold_delta: i64,
    pub xp_delta: u64,
    pub infamy_delta: i32,
}

#[derive(Debug, Clone)]
pub struct JobSummary {
    pub job_id: String,
    pub level: u32,
    pub xp: u64,
    pub position: JobPosition,
    pub total_earned: i64,
}

#[derive(Debug, Clone, PartialEq)]
pub enum JobError {
    InsufficientStats(String),
    JobNotAvailable,
    AlreadyWorking,
}

impl std::fmt::Display for JobError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::InsufficientStats(stat) => write!(f, "Insufficient {}", stat),
            Self::JobNotAvailable => write!(f, "Job not available"),
            Self::AlreadyWorking => write!(f, "Already working another job"),
        }
    }
}

impl std::error::Error for JobError {}

pub fn create_job_data(
    id: &str,
    name: &str,
    description: &str,
    base_salary: i64,
    xp_per_shift: u64,
) -> JobData {
    JobData {
        id: id.to_string(),
        name: name.to_string(),
        description: description.to_string(),
        base_salary,
        xp_per_shift,
        required_stats: None,
        unlocked_skills: Vec::new(),
        promotion_thresholds: vec![100, 300, 600, 1000],
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_heir() -> Heir {
        Heir::new(
            "test-uid".to_string(),
            "test-lineage".to_string(),
            1,
            "fighter".to_string(),
        )
    }

    fn create_test_job() -> JobData {
        create_job_data("guard", "City Guard", "Protect the city", 20, 15)
    }

    #[test]
    fn test_work_shift_earns_gold() {
        let mut heir = create_test_heir();
        let job = create_test_job();
        let mut rng = GameRng::from_seed_string("job-test");
        
        let initial_gold = heir.gold;
        let result = JobEngine::work_shift(&mut heir, &job, &mut rng);
        
        assert!(result.salary_earned > 0);
        assert_eq!(heir.gold, initial_gold + result.salary_earned);
    }

    #[test]
    fn test_work_shift_gains_xp() {
        let mut heir = create_test_heir();
        let job = create_test_job();
        let mut rng = GameRng::from_seed_string("job-test");
        
        JobEngine::work_shift(&mut heir, &job, &mut rng);
        
        let record = heir.job_records.get("guard").unwrap();
        assert!(record.xp > 0);
    }

    #[test]
    fn test_promotion_after_threshold() {
        let mut heir = create_test_heir();
        let job = create_test_job();
        let mut rng = GameRng::from_seed_string("promo-test");
        
        heir.job_records.insert("guard".to_string(), JobRecord {
            job_id: "guard".to_string(),
            level: 1,
            xp: 99,
            position: JobPosition::Apprentice,
            salary_per_day: 20,
        });
        
        let result = JobEngine::work_shift(&mut heir, &job, &mut rng);
        
        assert!(result.promoted);
        assert_eq!(result.new_position, Some(JobPosition::Worker));
    }

    #[test]
    fn test_salary_increases_with_position() {
        let job = create_test_job();
        
        let apprentice_record = JobRecord {
            job_id: "guard".to_string(),
            level: 1,
            xp: 0,
            position: JobPosition::Apprentice,
            salary_per_day: 20,
        };
        
        let master_record = JobRecord {
            job_id: "guard".to_string(),
            level: 4,
            xp: 0,
            position: JobPosition::Master,
            salary_per_day: 20,
        };
        
        let apprentice_salary = JobEngine::calculate_salary(&apprentice_record, &job);
        let master_salary = JobEngine::calculate_salary(&master_record, &job);
        
        assert!(master_salary > apprentice_salary);
    }
}
