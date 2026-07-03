import { Link } from "react-router-dom";
import { Briefcase, Clock } from "lucide-react";
import { useJobShiftCountdown } from "@/hooks/useJobShiftTimer";
import { formatJobCountdown } from "@/lib/jobs";

export function JobShiftBanner() {
  const { active, shift, remainingMs } = useJobShiftCountdown();

  if (!active || !shift) {
    return null;
  }

  return (
    <div className="bg-primary/10 border-b border-primary/20 px-6 py-3">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="flex items-center gap-2 text-sm">
          <Briefcase className="w-4 h-4 text-primary" />
          <span>
            Working as <span className="font-semibold text-foreground">{shift.jobName}</span> for{" "}
            {shift.hoursCommitted} hour{shift.hoursCommitted === 1 ? "" : "s"}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{formatJobCountdown(remainingMs)} remaining</span>
          </div>
          <span className="text-muted-foreground">
            Reward: <span className="gold-text font-medium">{shift.goldReward} gold</span>
          </span>
          <span className="text-xs text-muted-foreground">
            Tavern and dungeons are unavailable until the shift ends.
          </span>
          <Link to="/jobs" className="text-primary hover:underline text-xs">
            View job
          </Link>
        </div>
      </div>
    </div>
  );
}
