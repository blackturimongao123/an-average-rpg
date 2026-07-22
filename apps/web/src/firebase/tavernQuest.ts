import { collection, doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { XP_PER_LEVEL } from "@bloodline/shared/constants";
import type { EventOutcome, Heir, Lineage, TavernEvent } from "@bloodline/shared/types";
import { generateSeed, seededRandom } from "@/lib/seededRandom";
import { killHeir } from "./functions";
import { db } from "./config";

import eventsData from "@game-data/events.json";

const events = eventsData.events as TavernEvent[];

function weightedOutcome(seed: string, outcomes: EventOutcome[]): EventOutcome {
  const total = outcomes.reduce((sum, outcome) => sum + outcome.weight, 0);
  let roll = seededRandom(seed, 1) * total;
  for (const outcome of outcomes) {
    roll -= outcome.weight;
    if (roll < 0) return outcome;
  }
  return outcomes[outcomes.length - 1];
}

export function resolvePlayerTavernQuest(
  userId: string,
  lineage: Lineage,
  heir: Heir,
  eventId: string,
  choiceId: string
) {
  void userId;
  const event = events.find((entry) => entry.id === eventId);
  const choice = event?.choices.find((entry) => entry.id === choiceId);
  if (!event || !choice) throw new Error("Encounter choice not found");

  const seed = generateSeed(lineage.id, heir.id, `event-${eventId}-${Date.now()}`);
  const outcome = choice.statCheck
    ? heir.stats[choice.statCheck.stat as keyof typeof heir.stats] >= choice.statCheck.difficulty
      ? choice.outcomes[0]
      : choice.outcomes[choice.outcomes.length - 1]
    : weightedOutcome(seed, choice.outcomes);

  const heirGoldAfter = Math.max(0, heir.gold + outcome.goldDelta);
  const accruedXp = heir.xp + outcome.xpDelta;
  const leveledUp = accruedXp >= XP_PER_LEVEL(heir.level);
  const heirXpAfter = leveledUp ? accruedXp - XP_PER_LEVEL(heir.level) : accruedXp;
  const heirLevelAfter = leveledUp ? heir.level + 1 : heir.level;

  if (outcome.heirDies) {
    void killHeir({ lineageId: lineage.id, heirId: heir.id, deathCause: `event:${eventId}` })
      .catch((error) => console.error("Failed to save encounter death", error));
  } else {
    const batch = writeBatch(db);
    batch.update(doc(db, "lineages", lineage.id, "heirs", heir.id), {
      gold: heirGoldAfter,
      xp: heirXpAfter,
      level: heirLevelAfter,
      inventory: [...heir.inventory, ...outcome.itemRewards],
    });
    for (const effectId of outcome.effectsAdded) {
      const effectRef = doc(collection(db, "lineages", lineage.id, "effects"));
      batch.set(effectRef, {
        id: effectRef.id,
        effectId,
        name: effectId,
        description: "",
        scope: effectId.includes("bloodline") || effectId.includes("curse") ? "generations" : "heir",
        remainingGenerations: effectId.includes("bloodline") || effectId.includes("curse") ? 3 : null,
        addedByHeirId: heir.id,
        addedAt: serverTimestamp(),
      });
    }
    void batch.commit().catch((error) => console.error("Failed to save encounter", error));
  }

  return {
    eventId,
    choiceId,
    outcome: {
      description: outcome.description,
      goldDelta: outcome.goldDelta,
      xpDelta: outcome.xpDelta,
      itemRewards: outcome.itemRewards,
      effectsAdded: outcome.effectsAdded,
      heirDied: outcome.heirDies,
    },
    heirGoldAfter,
    heirXpAfter,
    leveledUp,
    heirLevelAfter,
  };
}
