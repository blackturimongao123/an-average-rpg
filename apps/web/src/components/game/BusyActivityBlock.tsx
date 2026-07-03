import { Link } from "react-router-dom";
import { Briefcase, Clock } from "lucide-react";
import { useGameStore } from "@/stores/gameStore";
import { useJobShiftCountdown } from "@/hooks/useJobShiftTimer";
import { formatJobCountdown } from "@/lib/jobs";

interface BusyActivityBlockProps {
  activityName: string;
}

export function BusyActivityBlock({ activityName }: BusyActivityBlockProps) {
  const { heir } = useGameStore();
  const { active, shift, remainingMs } = useJobShiftCountdown();

  if (!active || !shift || !heir) {
    return null;
  }

  return (
    <div className="card p-6 mb-6 border-primary/30 bg-primary/5">
      <div className="flex items-start gap-3">
        <Briefcase className="w-6 h-6 text-primary mt-0.5" />
        <div>
          <h2 className="font-display text-lg font-semibold mb-1">Currently On Duty</h2>
          <p className="text-muted-foreground mb-3">
            {heir.name} is working as {shift.jobName} and cannot visit the {activityName} until the
            shift ends.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary" />
              {formatJobCountdown(remainingMs)} remaining
            </span>
            <span>
              Expected pay: <span className="gold-text font-medium">{shift.goldReward} gold</span>
            </span>
            <Link to="/jobs" className="text-primary hover:underline">
              Go to Jobs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function useIsHeirBusyOnJob(): boolean {
  const { active } = useJobShiftCountdown();
  return active;
}
