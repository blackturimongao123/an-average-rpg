import {
  ALL_JOBS,
  calculateJobGoldReward,
  calculateJobXpReward,
  getAvailableJobsForHeir,
  isJobAvailableForHeir,
  isJobShiftActive,
} from "@/lib/jobs";
import type { ActiveJobShift, Heir, JobRecord } from "@bloodline/shared/types";
import { doc, getDoc, updateDoc, writeBatch, serverTimestamp } from "firebase/firestore";
import { db } from "./config";

export { getAvailableJobsForHeir as getJobsForHeir };

async function leavePartyOnJobStart(lineageId: string, partyId: string | null | undefined, uid: string) {
  if (!partyId) return;

  const partyRef = doc(db, "parties", partyId);
  const lineageRef = doc(db, "lineages", lineageId);
  const partyDoc = await getDoc(partyRef);

  if (!partyDoc.exists()) {
    await updateDoc(lineageRef, { partyId: null });
    return;
  }

  const party = partyDoc.data();
  const memberUids = (party.memberUids as string[]).filter((id) => id !== uid);
  const memberLineageIds = (party.memberLineageIds as string[]).filter((id) => id !== lineageId);

  const batch = writeBatch(db);
  if (memberUids.length === 0) {
    batch.delete(partyRef);
  } else {
    const updates: Record<string, unknown> = { memberUids, memberLineageIds };
    if (party.leaderUid === uid) {
      updates.leaderUid = memberUids[0];
      updates.leaderLineageId = memberLineageIds[0];
    }
    batch.update(partyRef, updates);
  }
  batch.update(lineageRef, { partyId: null, updatedAt: serverTimestamp() });
  await batch.commit();
}

export async function startJobShift(
  lineageId: string,
  heirId: string,
  heir: Heir,
  jobId: string,
  hours: number
): Promise<ActiveJobShift> {
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

  const lineageRef = doc(db, "lineages", lineageId);
  const lineageDoc = await getDoc(lineageRef);
  const lineageData = lineageDoc.data();
  if (lineageData?.partyId) {
    await leavePartyOnJobStart(lineageId, lineageData.partyId as string, heir.ownerUid);
  }

  await updateDoc(doc(db, "lineages", lineageId, "heirs", heirId), {
    activeJobShift,
  });

  return activeJobShift;
}

export async function completeJobShift(
  lineageId: string,
  heirId: string
): Promise<{ goldEarned: number; xpEarned: number; jobName: string } | null> {
  const heirRef = doc(db, "lineages", lineageId, "heirs", heirId);
  const heirDoc = await getDoc(heirRef);

  if (!heirDoc.exists()) {
    throw new Error("Heir not found");
  }

  const heirData = heirDoc.data();
  const shift = heirData.activeJobShift as ActiveJobShift | null | undefined;

  if (!shift) {
    return null;
  }

  if (Date.now() < shift.endsAtMs) {
    throw new Error("Job shift is still in progress");
  }

  const existingRecord = (heirData.jobRecords?.[shift.jobId] as JobRecord | undefined) ?? {
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

  await updateDoc(heirRef, {
    activeJobShift: null,
    gold: (heirData.gold ?? 0) + shift.goldReward,
    jobRecords: {
      ...(heirData.jobRecords ?? {}),
      [shift.jobId]: updatedRecord,
    },
  });

  return {
    goldEarned: shift.goldReward,
    xpEarned: shift.xpReward,
    jobName: shift.jobName,
  };
}
