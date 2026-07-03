import { onCall, HttpsError } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "../index.js";
import { generateSeed, seededRandom } from "../utils/helpers.js";
import type { Heir, Lineage, JobRecord, JobPosition } from "../utils/types.js";

import jobsData from "../../../game-data/jobs.json";

interface JobData {
  id: string;
  name: string;
  baseSalary: number;
  xpPerShift: number;
  promotionThresholds: number[];
  unlockedSkills: string[];
}

const jobs = jobsData.jobs as JobData[];

interface WorkJobShiftRequest {
  lineageId: string;
  heirId: string;
  jobId: string;
}

interface JobEvent {
  id: string;
  description: string;
  goldDelta: number;
  xpDelta: number;
  infamyDelta: number;
}

interface WorkJobShiftResponse {
  salaryEarned: number;
  xpEarned: number;
  promoted: boolean;
  newPosition: JobPosition | null;
  event: JobEvent | null;
  skillsUnlocked: string[];
  heirGoldAfter: number;
}

const POSITION_MULTIPLIERS: Record<JobPosition, number> = {
  apprentice: 0.5,
  worker: 1.0,
  specialist: 1.5,
  master: 2.0,
  guildmaster: 3.0,
};

const POSITION_ORDER: JobPosition[] = ["apprentice", "worker", "specialist", "master", "guildmaster"];

export const workJobShift = onCall<WorkJobShiftRequest>(
  { cors: true },
  async (request): Promise<WorkJobShiftResponse> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be signed in");
    }

    const { lineageId, heirId, jobId } = request.data;

    if (!lineageId || !heirId || !jobId) {
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

    if (heir.status !== "alive") {
      throw new HttpsError("failed-precondition", "Heir is not alive");
    }

    const jobData = jobs.find((j) => j.id === jobId);
    if (!jobData) {
      throw new HttpsError("invalid-argument", "Job not found");
    }

    let jobRecord: JobRecord = heir.jobRecords[jobId] || {
      jobId,
      level: 1,
      xp: 0,
      position: "apprentice" as JobPosition,
      salaryPerDay: jobData.baseSalary,
    };

    const positionMultiplier = POSITION_MULTIPLIERS[jobRecord.position];
    const levelBonus = (jobRecord.level - 1) * 0.1;
    const salaryEarned = Math.floor(
      jobData.baseSalary * positionMultiplier * (1 + levelBonus)
    );

    const positionXpMultiplier = 1 - POSITION_ORDER.indexOf(jobRecord.position) * 0.2;
    const xpEarned = Math.floor(jobData.xpPerShift * Math.max(0.2, positionXpMultiplier));

    jobRecord.xp += xpEarned;

    let promoted = false;
    let newPosition: JobPosition | null = null;

    const positionIdx = POSITION_ORDER.indexOf(jobRecord.position);
    if (positionIdx < POSITION_ORDER.length - 1) {
      const threshold = jobData.promotionThresholds[positionIdx];
      if (jobRecord.xp >= threshold) {
        jobRecord.position = POSITION_ORDER[positionIdx + 1];
        jobRecord.level += 1;
        jobRecord.xp = 0;
        jobRecord.salaryPerDay = Math.floor(
          jobData.baseSalary * POSITION_MULTIPLIERS[jobRecord.position]
        );
        promoted = true;
        newPosition = jobRecord.position;
      }
    }

    const seed = generateSeed(lineageId, heirId, `job-${jobId}-${Date.now()}`);
    let event: JobEvent | null = null;

    if (seededRandom(seed, 0) < 0.15) {
      event = rollJobEvent(jobId, jobRecord.position, seed);
    }

    const skillsUnlocked: string[] = [];
    if (jobRecord.level >= 3) {
      for (const skillId of jobData.unlockedSkills) {
        if (!heir.skillIds.includes(skillId)) {
          skillsUnlocked.push(skillId);
        }
      }
    }

    const batch = db.batch();

    let totalGoldEarned = salaryEarned;
    if (event) {
      totalGoldEarned += event.goldDelta;
    }

    const newGold = Math.max(0, heir.gold + totalGoldEarned);
    const updatedJobRecords = { ...heir.jobRecords, [jobId]: jobRecord };

    batch.update(heirRef, {
      gold: newGold,
      jobRecords: updatedJobRecords,
    });

    batch.update(lineageRef, {
      updatedAt: FieldValue.serverTimestamp(),
    });

    await batch.commit();

    return {
      salaryEarned,
      xpEarned,
      promoted,
      newPosition,
      event,
      skillsUnlocked,
      heirGoldAfter: newGold,
    };
  }
);

function rollJobEvent(jobId: string, position: JobPosition, seed: string): JobEvent | null {
  const events: JobEvent[] = [];

  switch (jobId) {
    case "guard":
      events.push({
        id: "guard_bribe",
        description: "A merchant offers you gold to look the other way.",
        goldDelta: 50,
        xpDelta: 0,
        infamyDelta: 1,
      });
      events.push({
        id: "guard_commendation",
        description: "Your captain commends your diligence.",
        goldDelta: 10,
        xpDelta: 25,
        infamyDelta: 0,
      });
      break;

    case "weaponsmith":
    case "fence":
      events.push({
        id: "smith_masterwork",
        description: "You craft an exceptional piece!",
        goldDelta: 30,
        xpDelta: 50,
        infamyDelta: 0,
      });
      if (position === "master" || position === "guildmaster") {
        events.push({
          id: "smith_noble_order",
          description: "A noble commissions custom armor.",
          goldDelta: 100,
          xpDelta: 75,
          infamyDelta: 0,
        });
      }
      break;

    case "scribe":
      events.push({
        id: "scribe_secret",
        description: "You discover a secret in the documents...",
        goldDelta: 0,
        xpDelta: 30,
        infamyDelta: 0,
      });
      break;

    case "gravekeeper":
      events.push({
        id: "grave_treasure",
        description: "You find something valuable while digging.",
        goldDelta: 25,
        xpDelta: 10,
        infamyDelta: 1,
      });
      events.push({
        id: "grave_undead",
        description: "The dead stir... but you calm them.",
        goldDelta: 0,
        xpDelta: 40,
        infamyDelta: 0,
      });
      break;
  }

  if (events.length === 0) return null;

  const idx = Math.floor(seededRandom(seed, 1) * events.length);
  return events[idx];
}
