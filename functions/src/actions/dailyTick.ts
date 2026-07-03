import { onSchedule } from "firebase-functions/v2/scheduler";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "../index.js";
import type { Lineage, Heir, BloodlineEffect } from "../utils/types.js";

export const dailyTick = onSchedule(
  {
    schedule: "0 0 * * *",
    timeZone: "UTC",
    retryCount: 3,
  },
  async () => {
    console.log("Running daily tick...");

    const lineagesSnapshot = await db.collection("lineages").get();

    let processed = 0;
    let errors = 0;

    for (const lineageDoc of lineagesSnapshot.docs) {
      try {
        await processLineageDailyTick(lineageDoc.id);
        processed++;
      } catch (error) {
        console.error(`Error processing lineage ${lineageDoc.id}:`, error);
        errors++;
      }
    }

    console.log(`Daily tick completed. Processed: ${processed}, Errors: ${errors}`);
  }
);

async function processLineageDailyTick(lineageId: string): Promise<void> {
  const lineageRef = db.collection("lineages").doc(lineageId);
  const lineageDoc = await lineageRef.get();

  if (!lineageDoc.exists) return;

  const lineage = lineageDoc.data() as Lineage;

  if (!lineage.activeHeirId) return;

  const heirRef = lineageRef.collection("heirs").doc(lineage.activeHeirId);
  const heirDoc = await heirRef.get();

  if (!heirDoc.exists) return;

  const heir = heirDoc.data() as Heir;

  if (heir.status !== "alive") return;

  const batch = db.batch();

  const effectsSnapshot = await lineageRef.collection("effects").get();

  let dailyGoldBonus = 0;

  for (const effectDoc of effectsSnapshot.docs) {
    const effect = effectDoc.data() as BloodlineEffect;

    if (effect.effectId === "royal_stipend") {
      dailyGoldBonus += 5;
    }
  }

  let jobSalary = 0;
  for (const [, jobRecord] of Object.entries(heir.jobRecords)) {
    jobSalary += jobRecord.salaryPerDay;
  }

  const totalGoldGained = dailyGoldBonus + jobSalary;

  if (totalGoldGained > 0) {
    batch.update(heirRef, {
      gold: FieldValue.increment(totalGoldGained),
    });
  }

  batch.update(lineageRef, {
    updatedAt: FieldValue.serverTimestamp(),
  });

  await batch.commit();
}
