import type { AdventureEventStep, DungeonData, DungeonFloor } from "../types.js";
import type { FloorChoiceModifiers } from "./index.js";

export interface DungeonEventOutcome {
  logText: string;
  rewards: { gold: number; xp: number; items: string[] };
  floorCleared: boolean;
  dungeonCompleted: boolean;
  heirHealFlat: number;
}

function choiceIdLower(choiceId?: string): string {
  return (choiceId ?? "").toLowerCase();
}

function isCombatChoiceId(choiceId: string): boolean {
  const id = choiceIdLower(choiceId);
  return (
    id.includes("engage")
    || id.includes("ambush")
    || id.includes("fight")
    || id.includes("force")
    || id.includes("push")
  );
}

function isAvoidChoiceId(choiceId: string): boolean {
  const id = choiceIdLower(choiceId);
  return (
    id.includes("safe")
    || id.includes("camp")
    || id.includes("rest")
    || id.includes("persuade")
    || id.includes("sneak")
    || id.includes("bribe")
    || id.includes("retreat")
    || id.includes("light_rest")
  );
}

/** Whether a floor approach choice should resolve as combat (missions-style). */
export function choiceTriggersDungeonBattle(
  approach: AdventureEventStep,
  choiceId: string,
  floor: DungeonFloor
): boolean {
  const id = choiceIdLower(choiceId);
  if (!id) return false;

  if (floor.bossId) {
    return isCombatChoiceId(id);
  }

  const eventType = approach.eventType ?? "hazard";

  if (eventType === "combat") {
    if (isAvoidChoiceId(id)) return false;
    return isCombatChoiceId(id) || id.includes("explore") || id.includes("scout");
  }

  if (isAvoidChoiceId(id)) return false;
  if (isCombatChoiceId(id) || id.includes("explore") || id.includes("scout")) return true;

  return false;
}

function seededUnit(seed: string, salt: number): number {
  let hash = 0;
  const input = `${seed}:${salt}`;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 10000) / 10000;
}

export function resolveDungeonEventOutcome(
  dungeon: DungeonData,
  floor: number,
  choiceId: string,
  seed: string,
  modifiers: FloorChoiceModifiers
): DungeonEventOutcome {
  const floorData = dungeon.floors[floor - 1];
  const approach = floorData?.approach;
  const id = choiceIdLower(choiceId);

  const baseGold = Math.floor(10 * floor * (floorData?.lootModifier ?? 1));
  const baseXp = Math.floor(15 * floor * (floorData?.xpModifier ?? 1));
  const variance = 0.85 + seededUnit(seed, 1) * 0.3;

  let rewardMult = 0;
  let logText = "You press on without fighting.";

  if (id.includes("camp") || id.includes("rest")) {
    logText = "You make camp and recover your strength.";
  } else if (id.includes("safe")) {
    rewardMult = 0.25;
    logText = "You take the cautious route and slip past unnoticed.";
  } else if (id.includes("persuade") || id.includes("sneak") || id.includes("bribe")) {
    rewardMult = 0.55;
    logText = "You avoid a fight and still come away with something.";
  } else if (id.includes("retreat")) {
    logText = floorData?.bossId
      ? "You fall back from the boss chamber — the threat remains."
      : "You reposition and move on without engaging.";
  } else if (id.includes("scout")) {
    rewardMult = 0.35;
    logText = "Scouting ahead reveals a few scraps worth taking.";
  } else {
    rewardMult = 0.2;
    logText = `${approach?.title ?? "The floor"} passes without combat.`;
  }

  const rewards = {
    gold: Math.floor(baseGold * rewardMult * variance * modifiers.rewardMult),
    xp: Math.floor(baseXp * rewardMult * variance * modifiers.rewardMult),
    items: [] as string[],
  };

  const isBossRetreat = Boolean(floorData?.bossId) && id.includes("retreat");
  const floorCleared = !isBossRetreat;
  const dungeonCompleted = floorCleared && floor === dungeon.floors.length;

  return {
    logText,
    rewards,
    floorCleared,
    dungeonCompleted,
    heirHealFlat: modifiers.heirHealFlat,
  };
}
