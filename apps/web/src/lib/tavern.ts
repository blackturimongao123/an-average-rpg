import type { EventChoice, EventOutcome, Stats } from "@bloodline/shared/types";

function seededRandom(seed: string, index: number = 0): number {
  let hash = 0;
  const input = `${seed}-${index}`;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 10000) / 10000;
}

function weightedRandomChoice<T>(
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

export function resolveEventChoiceOutcome(
  choice: EventChoice,
  stats: Stats,
  seed: string
): EventOutcome {
  if (!choice.statCheck) {
    const outcomeWeights = choice.outcomes.map((outcome) => ({
      item: outcome,
      weight: outcome.weight,
    }));
    return weightedRandomChoice(seed, outcomeWeights, 1);
  }

  const statValue = stats[choice.statCheck.stat as keyof Stats] ?? 0;
  const passed = statValue >= choice.statCheck.difficulty;

  if (passed) {
    return choice.outcomes[0];
  }

  return choice.outcomes[choice.outcomes.length - 1];
}
