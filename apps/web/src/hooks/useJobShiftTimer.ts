import { useEffect, useState } from "react";
import { useGameStore } from "@/stores/gameStore";
import { completeJobShift } from "@/firebase/jobShift";
import {
  getJobShiftRemainingMs,
  isJobShiftActive,
  isJobShiftComplete,
} from "@/lib/jobs";

export function useJobShiftCountdown() {
  const { heir } = useGameStore();
  const [remainingMs, setRemainingMs] = useState(0);
  const shift = heir?.activeJobShift ?? null;
  const active = isJobShiftActive(shift);

  useEffect(() => {
    if (!shift) {
      setRemainingMs(0);
      return;
    }

    const updateRemaining = () => {
      setRemainingMs(getJobShiftRemainingMs(shift.endsAtMs));
    };

    updateRemaining();
    const interval = window.setInterval(updateRemaining, 1000);
    return () => window.clearInterval(interval);
  }, [shift]);

  return {
    active,
    shift,
    remainingMs,
    readyToComplete: isJobShiftComplete(shift),
  };
}

export function useJobShiftTimer() {
  const { lineage, heir, applyJobShiftRewards } = useGameStore();
  const countdown = useJobShiftCountdown();
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (!lineage || !heir || completing) return;
    if (!countdown.readyToComplete || !countdown.shift) return;

    const activeShift = countdown.shift;
    setCompleting(true);
    completeJobShift(lineage.id, heir.id)
      .then((result) => {
        if (!result || !activeShift) return;

        const shiftJobId = activeShift.jobId;
        const existingRecord = heir.jobRecords[shiftJobId] ?? {
          jobId: shiftJobId,
          level: 1,
          xp: 0,
          position: "apprentice" as const,
          salaryPerDay: 0,
        };

        applyJobShiftRewards({
          gold: heir.gold + result.goldEarned,
          jobId: shiftJobId,
          jobRecord: {
            ...existingRecord,
            xp: existingRecord.xp + result.xpEarned,
          },
        });
      })
      .catch((error) => {
        console.error("Failed to complete job shift:", error);
      })
      .finally(() => {
        setCompleting(false);
      });
  }, [
    lineage,
    heir,
    countdown.readyToComplete,
    countdown.shift,
    completing,
    applyJobShiftRewards,
  ]);

  return countdown;
}
