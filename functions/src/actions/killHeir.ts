import { onCall, HttpsError } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "../index.js";
import type { Heir, Lineage, KillHeirRequest, KillHeirResponse, BloodlineEffect } from "../utils/types.js";

export const killHeir = onCall<KillHeirRequest>(
  { cors: true },
  async (request): Promise<KillHeirResponse> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be signed in");
    }

    const { lineageId, heirId, deathCause } = request.data;

    if (!lineageId || !heirId) {
      throw new HttpsError("invalid-argument", "Lineage ID and Heir ID are required");
    }

    const uid = request.auth.uid;

    const lineageRef = db.collection("lineages").doc(lineageId);
    const heirRef = lineageRef.collection("heirs").doc(heirId);

    const [lineageDoc, heirDoc] = await Promise.all([
      lineageRef.get(),
      heirRef.get(),
    ]);

    if (!lineageDoc.exists) {
      throw new HttpsError("not-found", "Lineage not found");
    }

    if (!heirDoc.exists) {
      throw new HttpsError("not-found", "Heir not found");
    }

    const lineage = lineageDoc.data() as Lineage;
    const heir = heirDoc.data() as Heir;

    if (lineage.ownerUid !== uid) {
      throw new HttpsError("permission-denied", "You do not own this lineage");
    }

    if (heir.status !== "alive") {
      throw new HttpsError("failed-precondition", "Heir is not alive");
    }

    const inheritanceRate = 0.1;
    const goldInherited = Math.floor(heir.gold * inheritanceRate);

    const itemsInherited: string[] = [];
    const itemsLost: string[] = [...heir.inventory];

    const effectsInherited: string[] = [];
    const effectsExpired: string[] = [];

    const effectsSnapshot = await lineageRef.collection("effects").get();
    const batch = db.batch();

    effectsSnapshot.forEach((doc) => {
      const effect = doc.data() as BloodlineEffect;
      
      if (effect.scope === "bloodline") {
        effectsInherited.push(effect.effectId);
      } else if (effect.scope === "generations") {
        if (effect.remainingGenerations && effect.remainingGenerations > 1) {
          batch.update(doc.ref, {
            remainingGenerations: effect.remainingGenerations - 1,
          });
          effectsInherited.push(effect.effectId);
        } else {
          batch.delete(doc.ref);
          effectsExpired.push(effect.effectId);
        }
      } else if (effect.scope === "heir") {
        batch.delete(doc.ref);
        effectsExpired.push(effect.effectId);
      }
    });

    const uniqueSkillsReleased: string[] = heir.skillIds.filter((s) =>
      s.startsWith("unique_")
    );

    for (const skillId of uniqueSkillsReleased) {
      const skillRef = db.doc(`world/uniqueSkills/skills/${skillId}`);
      batch.update(skillRef, {
        holderUid: null,
        holderLineageId: null,
        holderHeirId: null,
        releasedAt: FieldValue.serverTimestamp(),
      });
    }

    batch.update(heirRef, {
      status: "dead",
      diedAt: FieldValue.serverTimestamp(),
      deathCause: deathCause || "unknown",
    });

    const newGeneration = lineage.generation + 1;

    batch.update(lineageRef, {
      activeHeirId: null,
      generation: newGeneration,
      bankGold: FieldValue.increment(goldInherited),
      updatedAt: FieldValue.serverTimestamp(),
      "publicSummary.deadHeirs": FieldValue.increment(1),
      "publicSummary.highestGeneration": newGeneration,
      "publicSummary.currentClass": null,
    });

    await batch.commit();

    return {
      previousHeirId: heirId,
      goldInherited,
      itemsInherited,
      itemsLost,
      effectsInherited,
      effectsExpired,
      uniqueSkillsReleased,
    };
  }
);
