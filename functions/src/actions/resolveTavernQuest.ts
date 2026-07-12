import { onCall, HttpsError } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "../index.js";
import { generateSeed, weightedRandomChoice } from "../utils/helpers.js";
import type { Heir, Lineage, TavernEvent, EventOutcome, BloodlineEffect } from "../utils/types.js";

import eventsData from "../../../game-data/events.json";
import { addHeirDeathToBatch } from "../utils/death.js";

const events = eventsData.events as TavernEvent[];

interface ResolveTavernQuestRequest {
  lineageId: string;
  heirId: string;
  eventId: string;
  choiceId: string;
}

interface ResolveTavernQuestResponse {
  eventId: string;
  choiceId: string;
  outcome: {
    description: string;
    goldDelta: number;
    xpDelta: number;
    itemRewards: string[];
    effectsAdded: string[];
    heirDied: boolean;
  };
  heirGoldAfter: number;
  heirXpAfter: number;
  leveledUp: boolean;
}

export const resolveTavernQuest = onCall<ResolveTavernQuestRequest>(
  { cors: true },
  async (request): Promise<ResolveTavernQuestResponse> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be signed in");
    }

    const { lineageId, heirId, eventId, choiceId } = request.data;

    if (!lineageId || !heirId || !eventId || !choiceId) {
      throw new HttpsError("invalid-argument", "Missing required fields");
    }

    const uid = request.auth.uid;

    const lineageRef = db.collection("lineages").doc(lineageId);
    const heirRef = lineageRef.collection("heirs").doc(heirId);

    const [lineageDoc, heirDoc] = await Promise.all([
      lineageRef.get(),
      heirRef.get(),
    ]);

    if (!lineageDoc.exists || !heirDoc.exists) {
      throw new HttpsError("not-found", "Lineage or heir not found");
    }

    const lineage = lineageDoc.data() as Lineage;
    const heir = heirDoc.data() as Heir;

    if (lineage.ownerUid !== uid) {
      throw new HttpsError("permission-denied", "You do not own this lineage");
    }

    if (lineage.activeHeirId !== heirId || heir.status !== "alive") {
      throw new HttpsError("failed-precondition", "Heir is not active");
    }
    if (heir.activeMission) {
      throw new HttpsError("failed-precondition", "Finish the active mission first");
    }
    const activeShiftEndsAt = (heir.activeJobShift as { endsAtMs?: number } | null)?.endsAtMs;
    if (activeShiftEndsAt && activeShiftEndsAt > Date.now()) {
      throw new HttpsError("failed-precondition", "Heir is working a job shift");
    }

    const event = events.find((e) => e.id === eventId);
    if (!event) {
      throw new HttpsError("invalid-argument", "Event not found");
    }

    const choice = event.choices.find((c) => c.id === choiceId);
    if (!choice) {
      throw new HttpsError("invalid-argument", "Choice not found");
    }

    if (event.requirements) {
      if (event.requirements.minLevel && heir.level < event.requirements.minLevel) {
        throw new HttpsError("failed-precondition", "Level requirement not met");
      }
      if (event.requirements.minGeneration && lineage.generation < event.requirements.minGeneration) {
        throw new HttpsError("failed-precondition", "Generation requirement not met");
      }
      if (event.requirements.requiredClass && heir.classId !== event.requirements.requiredClass) {
        throw new HttpsError("failed-precondition", "Class requirement not met");
      }
    }

    const seed = generateSeed(lineageId, heirId, `event-${eventId}-${Date.now()}`);

    let outcome: EventOutcome;

    if (choice.statCheck) {
      const statValue = heir.stats[choice.statCheck.stat as keyof typeof heir.stats] || 0;
      const passed = statValue >= choice.statCheck.difficulty;
      outcome = passed
        ? choice.outcomes[0]
        : choice.outcomes[choice.outcomes.length - 1];
    } else {
      const outcomeWeights = choice.outcomes.map((o) => ({ item: o, weight: o.weight }));
      outcome = weightedRandomChoice(seed, outcomeWeights, 1) as EventOutcome;
    }

    const batch = db.batch();

    const newGold = Math.max(0, heir.gold + outcome.goldDelta);
    const newXp = heir.xp + outcome.xpDelta;

    const xpForNextLevel = heir.level * 100;
    const leveledUp = newXp >= xpForNextLevel;
    const finalXp = leveledUp ? newXp - xpForNextLevel : newXp;
    const finalLevel = leveledUp ? heir.level + 1 : heir.level;

    const newInventory = [...heir.inventory, ...outcome.itemRewards];

    batch.update(heirRef, {
      gold: newGold,
      xp: finalXp,
      level: finalLevel,
      inventory: newInventory,
    });

    for (const effectId of outcome.effectsAdded) {
      const effectRef = lineageRef.collection("effects").doc();
      const effect: BloodlineEffect = {
        id: effectRef.id,
        effectId,
        name: effectId,
        description: "",
        scope: effectId.includes("bloodline") || effectId.includes("curse") ? "generations" : "heir",
        remainingGenerations: effectId.includes("bloodline") || effectId.includes("curse") ? 3 : null,
        addedByHeirId: heirId,
        addedAt: FieldValue.serverTimestamp(),
      };
      batch.set(effectRef, effect);
    }

    if (outcome.heirDies) {
      await addHeirDeathToBatch({
        batch,
        lineageRef,
        heirRef,
        lineage,
        heir,
        deathCause: `event:${eventId}`,
      });
    } else {
      batch.update(lineageRef, {
        updatedAt: FieldValue.serverTimestamp(),
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
);
