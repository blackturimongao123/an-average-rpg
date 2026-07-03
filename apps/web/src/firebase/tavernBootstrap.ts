import {
  doc,
  getDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import type { TavernEvent } from "@bloodline/shared/types";
import { resolveEventChoiceOutcome } from "@/lib/tavern";
import { db } from "./config";
import type { Heir } from "@bloodline/shared/types";

import eventsData from "@game-data/events.json";

const events = eventsData.events as TavernEvent[];

function createSeed(lineageId: string, heirId: string, eventId: string): string {
  return `${lineageId}-${heirId}-${eventId}-${Date.now()}`;
}

export async function bootstrapTavernQuest(
  userId: string,
  lineageId: string,
  heirId: string,
  eventId: string,
  choiceId: string
) {
  const event = events.find((entry) => entry.id === eventId);
  if (!event) {
    throw new Error("Event not found");
  }

  const choice = event.choices.find((entry) => entry.id === choiceId);
  if (!choice) {
    throw new Error("Choice not found");
  }

  const lineageRef = doc(db, "lineages", lineageId);
  const heirRef = doc(db, "lineages", lineageId, "heirs", heirId);

  const [lineageDoc, heirDoc] = await Promise.all([getDoc(lineageRef), getDoc(heirRef)]);

  if (!lineageDoc.exists() || !heirDoc.exists()) {
    throw new Error("Lineage or heir not found");
  }

  const lineage = lineageDoc.data();
  const heir = heirDoc.data() as Heir;

  if (lineage.ownerUid !== userId) {
    throw new Error("You do not own this lineage");
  }

  if (heir.status !== "alive") {
    throw new Error("Heir is not alive");
  }

  if (heir.activeJobShift && heir.activeJobShift.endsAtMs > Date.now()) {
    throw new Error("Your heir is currently working a job shift");
  }

  if (event.requirements?.minLevel && heir.level < event.requirements.minLevel) {
    throw new Error("Level requirement not met");
  }

  if (event.requirements?.minGeneration && lineage.generation < event.requirements.minGeneration) {
    throw new Error("Generation requirement not met");
  }

  if (event.requirements?.requiredClass && heir.classId !== event.requirements.requiredClass) {
    throw new Error("Class requirement not met");
  }

  const seed = createSeed(lineageId, heirId, eventId);
  const outcome = resolveEventChoiceOutcome(choice, heir.stats, seed);

  const xpForNextLevel = heir.level * 100;
  const newGold = Math.max(0, heir.gold + outcome.goldDelta);
  const newXp = heir.xp + outcome.xpDelta;
  const leveledUp = newXp >= xpForNextLevel;
  const finalXp = leveledUp ? newXp - xpForNextLevel : newXp;
  const finalLevel = leveledUp ? heir.level + 1 : heir.level;
  const newInventory = [...heir.inventory, ...outcome.itemRewards];

  const batch = writeBatch(db);

  batch.update(heirRef, {
    gold: newGold,
    xp: finalXp,
    level: finalLevel,
    inventory: newInventory,
  });

  if (outcome.heirDies) {
    batch.update(heirRef, {
      status: "dead",
      diedAt: serverTimestamp(),
      deathCause: `event:${eventId}`,
    });

    batch.update(lineageRef, {
      activeHeirId: null,
      generation: lineage.generation + 1,
      updatedAt: serverTimestamp(),
      "publicSummary.deadHeirs": (lineage.publicSummary?.deadHeirs ?? 0) + 1,
      "publicSummary.highestGeneration": Math.max(
        lineage.publicSummary?.highestGeneration ?? lineage.generation,
        lineage.generation + 1
      ),
      "publicSummary.currentClass": null,
    });
  } else {
    batch.update(lineageRef, {
      updatedAt: serverTimestamp(),
    });
  }

  await batch.commit();

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
    heirGoldAfter: newGold,
    heirXpAfter: finalXp,
    leveledUp,
  };
}
