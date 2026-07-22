import {
  ALL_JOBS,
  calculateJobGoldReward,
  calculateJobXpReward,
  getAvailableJobsForHeir,
  isJobAvailableForHeir,
  isJobShiftActive,
} from "@/lib/jobs";
import type { ActiveJobShift, Heir, JobRecord, Lineage } from "@bloodline/shared/types";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "./config";
import { leavePartyClient } from "./partyClient";

export { getAvailableJobsForHeir as getJobsForHeir };

export function startJobShift(
  lineage: Lineage,
  heir: Heir,
  jobId: string,
  hours: number
): ActiveJobShift {
  if (isJobShiftActive(heir.activeJobShift)) {
    throw new Error("Your heir is already committed to a job shift");
  }

  const job = ALL_JOBS.find((entry) => entry.id === jobId);
  if (!job) {
    throw new Error("Job not found");
  }

  if (!isJobAvailableForHeir(job, heir)) {
    throw new Error("This job is not available for your class or subclass path");
  }

  const now = Date.now();
  const activeJobShift: ActiveJobShift = {
    jobId,
    jobName: job.name,
    hoursCommitted: hours,
    goldReward: calculateJobGoldReward(hours),
    xpReward: calculateJobXpReward(hours),
    startedAtMs: now,
    endsAtMs: now + hours * 60 * 60 * 1000,
  };

  if (lineage.partyId) {
    void leavePartyClient(heir.ownerUid, lineage)
      .catch((error) => console.error("Failed to save party departure", error));
  }

  void updateDoc(doc(db, "lineages", lineage.id, "heirs", heir.id), {
    activeJobShift,
  }).catch((error) => console.error("Failed to save job shift", error));

  return activeJobShift;
}

export function completeJobShift(
  lineageId: string,
  heir: Heir
): { goldEarned: number; xpEarned: number; jobName: string } | null {
  const heirRef = doc(db, "lineages", lineageId, "heirs", heir.id);
  const shift = heir.activeJobShift;

  if (!shift) {
    return null;
  }

  if (Date.now() < shift.endsAtMs) {
    throw new Error("Job shift is still in progress");
  }

  const existingRecord = heir.jobRecords?.[shift.jobId] ?? {
    jobId: shift.jobId,
    level: 1,
    xp: 0,
    position: "apprentice",
    salaryPerDay: ALL_JOBS.find((entry) => entry.id === shift.jobId)?.baseSalary ?? 0,
  };

  const updatedRecord: JobRecord = {
    ...existingRecord,
    xp: existingRecord.xp + shift.xpReward,
  };

  void updateDoc(heirRef, {
    activeJobShift: null,
    gold: heir.gold + shift.goldReward,
    jobRecords: {
      ...(heir.jobRecords ?? {}),
      [shift.jobId]: updatedRecord,
    },
  }).catch((error) => console.error("Failed to save completed job shift", error));

  return {
    goldEarned: shift.goldReward,
    xpEarned: shift.xpReward,
    jobName: shift.jobName,
  };
}
