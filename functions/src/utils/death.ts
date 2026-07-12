import { FieldValue, type DocumentReference, type WriteBatch } from "firebase-admin/firestore";
import type { BloodlineEffect, Heir, Lineage } from "./types.js";

interface SettleHeirDeathInput {
  batch: WriteBatch;
  lineageRef: DocumentReference;
  heirRef: DocumentReference;
  lineage: Lineage;
  heir: Heir;
  deathCause: string;
}

export async function addHeirDeathToBatch({
  batch,
  lineageRef,
  heirRef,
  lineage,
  heir,
  deathCause,
}: SettleHeirDeathInput): Promise<void> {
  const effectsSnapshot = await lineageRef.collection("effects").get();
  for (const effectDoc of effectsSnapshot.docs) {
    const effect = effectDoc.data() as BloodlineEffect;
    if (effect.scope === "heir") {
      batch.delete(effectDoc.ref);
    } else if (effect.scope === "generations") {
      if ((effect.remainingGenerations ?? 0) > 1) {
        batch.update(effectDoc.ref, {
          remainingGenerations: (effect.remainingGenerations ?? 0) - 1,
        });
      } else {
        batch.delete(effectDoc.ref);
      }
    }
  }

  for (const skillId of heir.skillIds.filter((id) => id.startsWith("unique_"))) {
    batch.set(
      lineageRef.firestore.doc(`world/uniqueSkills/skills/${skillId}`),
      {
        holderUid: null,
        holderLineageId: null,
        holderHeirId: null,
        releasedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }

  batch.update(heirRef, {
    status: "dead",
    diedAt: FieldValue.serverTimestamp(),
    deathCause,
    activeJobShift: null,
    activeMission: null,
  });

  const newGeneration = lineage.generation + 1;
  batch.update(lineageRef, {
    activeHeirId: null,
    generation: newGeneration,
    bankGold: FieldValue.increment(Math.floor(Math.max(0, heir.gold) * 0.1)),
    updatedAt: FieldValue.serverTimestamp(),
    "publicSummary.deadHeirs": FieldValue.increment(1),
    "publicSummary.highestGeneration": newGeneration,
    "publicSummary.currentClass": null,
  });
}
