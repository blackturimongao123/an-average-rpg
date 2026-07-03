import type { Heir, JobData } from "@bloodline/shared/types";

import jobsData from "@game-data/jobs.json";

import { getSubclassChain } from "./skills";

export const ALL_JOBS = jobsData.jobs as JobData[];

export const MIN_JOB_HOURS = 1;
export const MAX_JOB_HOURS = 12;

export function isBaseClassJob(job: JobData): boolean {
  return !job.subclassTags?.length;
}

export function isJobAvailableForHeir(job: JobData, heir: Heir): boolean {
  if (!job.classTags.includes(heir.classId)) {
    return false;
  }

  if (isBaseClassJob(job)) {
    return true;
  }

  const chain = getSubclassChain(heir.subclassId);
  if (chain.length === 0) {
    return false;
  }

  return job.subclassTags!.some((tag) => chain.includes(tag));
}

export function getAvailableJobsForHeir(heir: Heir): JobData[] {
  return ALL_JOBS.filter((job) => isJobAvailableForHeir(job, heir)).sort((left, right) => {
    const leftBase = isBaseClassJob(left) ? 0 : 1;
    const rightBase = isBaseClassJob(right) ? 0 : 1;
    if (leftBase !== rightBase) {
      return leftBase - rightBase;
    }
    return left.name.localeCompare(right.name);
  });
}

export function getJobById(jobId: string): JobData | undefined {
  return ALL_JOBS.find((job) => job.id === jobId);
}

export function calculateJobGoldReward(hours: number): number {
  if (hours < MIN_JOB_HOURS || hours > MAX_JOB_HOURS) return 0;
  if (hours <= 6) {
    return Math.round(5 + (hours - 1) * 9);
  }
  return Math.round(50 + (hours - 6) * (50 / 6));
}

export function calculateJobXpReward(hours: number): number {
  if (hours < MIN_JOB_HOURS || hours > MAX_JOB_HOURS) return 0;
  return Math.round(3 + (hours - 1) * (57 / 11));
}

export function formatJobCountdown(remainingMs: number): string {
  if (remainingMs <= 0) return "00:00:00";

  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => value.toString().padStart(2, "0"))
    .join(":");
}

export function getJobShiftRemainingMs(
  endsAtMs: number,
  nowMs: number = Date.now()
): number {
  return Math.max(0, endsAtMs - nowMs);
}

export function isJobShiftActive(
  activeJobShift: { endsAtMs: number } | null | undefined,
  nowMs: number = Date.now()
): boolean {
  if (!activeJobShift) return false;
  return nowMs < activeJobShift.endsAtMs;
}

export function isJobShiftComplete(
  activeJobShift: { endsAtMs: number } | null | undefined,
  nowMs: number = Date.now()
): boolean {
  if (!activeJobShift) return false;
  return nowMs >= activeJobShift.endsAtMs;
}
