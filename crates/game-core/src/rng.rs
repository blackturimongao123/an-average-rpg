use rand::{Rng, SeedableRng};
use rand_chacha::ChaCha8Rng;
use std::hash::{Hash, Hasher};
use std::collections::hash_map::DefaultHasher;

pub struct GameRng {
    rng: ChaCha8Rng,
}

impl GameRng {
    pub fn from_seed_string(seed: &str) -> Self {
        let mut hasher = DefaultHasher::new();
        seed.hash(&mut hasher);
        let hash = hasher.finish();
        
        let mut seed_bytes = [0u8; 32];
        seed_bytes[..8].copy_from_slice(&hash.to_le_bytes());
        seed_bytes[8..16].copy_from_slice(&hash.to_be_bytes());
        seed_bytes[16..24].copy_from_slice(&hash.to_le_bytes());
        seed_bytes[24..32].copy_from_slice(&hash.to_be_bytes());
        
        Self {
            rng: ChaCha8Rng::from_seed(seed_bytes),
        }
    }

    pub fn from_components(lineage_id: &str, heir_id: &str, context: &str, attempt: u32) -> Self {
        let seed = format!("{}-{}-{}-{}", lineage_id, heir_id, context, attempt);
        Self::from_seed_string(&seed)
    }

    pub fn next_u32(&mut self) -> u32 {
        self.rng.gen()
    }

    pub fn next_u64(&mut self) -> u64 {
        self.rng.gen()
    }

    pub fn next_f32(&mut self) -> f32 {
        self.rng.gen()
    }

    pub fn next_f64(&mut self) -> f64 {
        self.rng.gen()
    }

    pub fn range_i32(&mut self, min: i32, max: i32) -> i32 {
        if min >= max {
            return min;
        }
        self.rng.gen_range(min..=max)
    }

    pub fn range_i64(&mut self, min: i64, max: i64) -> i64 {
        if min >= max {
            return min;
        }
        self.rng.gen_range(min..=max)
    }

    pub fn range_u32(&mut self, min: u32, max: u32) -> u32 {
        if min >= max {
            return min;
        }
        self.rng.gen_range(min..=max)
    }

    pub fn chance(&mut self, percent: f32) -> bool {
        self.rng.gen::<f32>() * 100.0 < percent
    }

    pub fn weighted_choice<T: Clone>(&mut self, items: &[(T, u32)]) -> Option<T> {
        if items.is_empty() {
            return None;
        }

        let total_weight: u32 = items.iter().map(|(_, w)| w).sum();
        if total_weight == 0 {
            return None;
        }

        let roll = self.rng.gen_range(0..total_weight);
        let mut cumulative = 0;

        for (item, weight) in items {
            cumulative += weight;
            if roll < cumulative {
                return Some(item.clone());
            }
        }

        Some(items.last()?.0.clone())
    }

    pub fn shuffle<T>(&mut self, slice: &mut [T]) {
        for i in (1..slice.len()).rev() {
            let j = self.rng.gen_range(0..=i);
            slice.swap(i, j);
        }
    }

    pub fn pick<T: Clone>(&mut self, slice: &[T]) -> Option<T> {
        if slice.is_empty() {
            None
        } else {
            let idx = self.rng.gen_range(0..slice.len());
            Some(slice[idx].clone())
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_deterministic_rng() {
        let mut rng1 = GameRng::from_seed_string("test-seed-123");
        let mut rng2 = GameRng::from_seed_string("test-seed-123");
        
        for _ in 0..100 {
            assert_eq!(rng1.next_u32(), rng2.next_u32());
        }
    }

    #[test]
    fn test_different_seeds_different_results() {
        let mut rng1 = GameRng::from_seed_string("seed-a");
        let mut rng2 = GameRng::from_seed_string("seed-b");
        
        let results_differ = (0..10).any(|_| rng1.next_u32() != rng2.next_u32());
        assert!(results_differ);
    }

    #[test]
    fn test_range() {
        let mut rng = GameRng::from_seed_string("range-test");
        
        for _ in 0..100 {
            let val = rng.range_i32(5, 10);
            assert!(val >= 5 && val <= 10);
        }
    }

    #[test]
    fn test_weighted_choice() {
        let mut rng = GameRng::from_seed_string("weighted-test");
        let items = vec![("common", 70u32), ("rare", 25), ("legendary", 5)];
        
        let mut counts = std::collections::HashMap::new();
        for _ in 0..1000 {
            if let Some(item) = rng.weighted_choice(&items) {
                *counts.entry(item).or_insert(0) += 1;
            }
        }
        
        assert!(counts.get(&"common").unwrap_or(&0) > counts.get(&"rare").unwrap_or(&0));
        assert!(counts.get(&"rare").unwrap_or(&0) > counts.get(&"legendary").unwrap_or(&0));
    }
}
