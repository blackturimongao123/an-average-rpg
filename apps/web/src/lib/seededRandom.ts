/** Deterministic PRNG for client-side game sims (tavern, combat, missions). */

export function seededRandom(seed: string, index: number = 0): number {
  let hash = 0;
  const input = `${seed}-${index}`;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 10000) / 10000;
}

export function seededRandomChoice<T>(seed: string, items: T[], index: number = 0): T {
  const rand = seededRandom(seed, index);
  const idx = Math.floor(rand * items.length);
  return items[idx];
}

export function weightedSeededRandomChoice<T>(
  seed: string,
  items: Array<{ item: T; weight: number }>,
  index: number = 0
): T {
  const totalWeight = items.reduce((sum, entry) => sum + entry.weight, 0);
  const roll = seededRandom(seed, index) * totalWeight;
  let cumulative = 0;

  for (const entry of items) {
    cumulative += entry.weight;
    if (roll < cumulative) {
      return entry.item;
    }
  }

  return items[items.length - 1].item;
}

export function generateSeed(lineageId: string, heirId: string, context: string): string {
  const input = `${lineageId}-${heirId}-${context}-${Date.now()}`;
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, "0").repeat(4).slice(0, 32);
}
