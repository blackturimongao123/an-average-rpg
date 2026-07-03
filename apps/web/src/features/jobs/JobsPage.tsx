import { useState } from "react";
import { useGameStore } from "@/stores/gameStore";
import { startJobShift, getJobsForHeir } from "@/firebase/jobShift";
import { useJobShiftCountdown } from "@/hooks/useJobShiftTimer";
import { getFirebaseErrorMessage } from "@/lib/firebaseErrors";
import {
  calculateJobGoldReward,
  calculateJobXpReward,
  formatJobCountdown,
  isBaseClassJob,
  MAX_JOB_HOURS,
} from "@/lib/jobs";
import { capitalize } from "@/lib/utils";
import {
  Briefcase,
  Coins,
  Star,
  Shield,
  BookOpen,
  Hammer,
  Skull,
  Clock,
  Check,
  TreePine,
  X,
  Swords,
  Target,
  Flame,
  Snowflake,
  Sparkles,
  Heart,
  Crosshair,
  PawPrint,
  Eye,
  Compass,
} from "lucide-react";

const jobIcons: Record<string, typeof Shield> = {
  guard: Shield,
  pit_handler: Swords,
  garrison_sergeant: Shield,
  weaponsmith: Hammer,
  mercenary_captain: Swords,
  paladin_order: Skull,
  fence: Coins,
  contract_broker: Target,
  street_con_artist: Sparkles,
  dock_rigger: Compass,
  night_runner: Eye,
  apothecary_assistant: Skull,
  scribe: BookOpen,
  kiln_stoker: Flame,
  icehouse_keeper: Snowflake,
  leyline_surveyor: Sparkles,
  familiar_keeper: PawPrint,
  rune_engraver: Hammer,
  gravekeeper: Skull,
  hospice_caretaker: Heart,
  inquisition_aide: Shield,
  shrine_guard: Shield,
  temple_augur: Eye,
  spirit_warden: Skull,
  trail_warden: TreePine,
  range_instructor: Crosshair,
  kennel_master: PawPrint,
  border_patrol: TreePine,
  bounty_tracker: Target,
  wilderness_guide: Compass,
};

const hourOptions = Array.from({ length: MAX_JOB_HOURS }, (_, index) => index + 1);

export function JobsPage() {
  const { lineage, heir, setActiveJobShift } = useGameStore();
  const { active, shift, remainingMs } = useJobShiftCountdown();
  const [planningJobId, setPlanningJobId] = useState<string | null>(null);
  const [selectedHours, setSelectedHours] = useState(6);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const availableJobs = heir ? getJobsForHeir(heir) : [];
  const previewGold = calculateJobGoldReward(selectedHours);
  const previewXp = calculateJobXpReward(selectedHours);

  const openShiftPlanner = (jobId: string) => {
    setError("");
    setSelectedHours(6);
    setPlanningJobId(jobId);
  };

  const closeShiftPlanner = () => {
    if (loading) return;
    setPlanningJobId(null);
    setError("");
  };

  const handleStartShift = async () => {
    if (!lineage || !heir || !planningJobId || active) return;

    setError("");
    setLoading(true);

    try {
      const activeJobShift = await startJobShift(
        lineage.id,
        heir.id,
        heir,
        planningJobId,
        selectedHours
      );
      setActiveJobShift(activeJobShift);
      setPlanningJobId(null);
    } catch (err: unknown) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!heir) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Create an heir to work jobs</p>
      </div>
    );
  }

  if (active && shift) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Briefcase className="w-8 h-8 text-gold" />
          <div>
            <h1 className="font-display text-2xl font-bold">On Duty</h1>
            <p className="text-muted-foreground">Your heir is working in the background</p>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-display text-xl font-semibold mb-2">{shift.jobName}</h2>
          <p className="text-muted-foreground mb-6">
            {heir.name} committed to a {shift.hoursCommitted}-hour shift. While on duty, tavern
            quests and dungeons are unavailable. You can still visit the bank, skills, and character
            tabs.
          </p>

          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className="p-4 rounded-md bg-secondary/50 text-center">
              <Clock className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-2xl font-display font-bold">{formatJobCountdown(remainingMs)}</p>
              <p className="text-xs text-muted-foreground mt-1">Time remaining</p>
            </div>
            <div className="p-4 rounded-md bg-secondary/50 text-center">
              <Coins className="w-5 h-5 text-gold mx-auto mb-2" />
              <p className="text-2xl font-display font-bold gold-text">{shift.goldReward}</p>
              <p className="text-xs text-muted-foreground mt-1">Gold on completion</p>
            </div>
            <div className="p-4 rounded-md bg-secondary/50 text-center">
              <Star className="w-5 h-5 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-display font-bold">{shift.xpReward}</p>
              <p className="text-xs text-muted-foreground mt-1">Job XP on completion</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Rewards are paid automatically when the timer reaches zero, even if this tab is closed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Briefcase className="w-8 h-8 text-gold" />
        <div>
          <h1 className="font-display text-2xl font-bold">Jobs</h1>
          <p className="text-muted-foreground">
            Idle work for {capitalize(heir.classId)} characters — commit real hours and earn gold
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-destructive/20 text-destructive text-sm mb-6">
          {error}
        </div>
      )}

      {availableJobs.length === 0 ? (
        <div className="card p-6">
          <p className="text-muted-foreground">No jobs are available for your class yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {availableJobs.map((job) => {
            const Icon = jobIcons[job.id] || Briefcase;
            const isPlanning = planningJobId === job.id;
            const heirJobRecord = heir.jobRecords[job.id];
            const position = heirJobRecord?.position ?? "apprentice";
            const jobXp = heirJobRecord?.xp ?? 0;
            const jobScope = isBaseClassJob(job) ? "General" : "Specialized";

            return (
              <div key={job.id} className="card p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                    <Icon className="w-6 h-6 text-gold" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h2 className="font-display text-xl font-semibold">{job.name}</h2>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          isBaseClassJob(job)
                            ? "bg-secondary text-muted-foreground"
                            : "bg-primary/15 text-primary"
                        }`}
                      >
                        {jobScope}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground capitalize">
                      {capitalize(heir.classId)} • {position} • {jobXp} job XP
                    </p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">{job.description}</p>

                {!isPlanning ? (
                  <button
                    type="button"
                    onClick={() => openShiftPlanner(job.id)}
                    className="btn-primary w-full sm:w-auto"
                  >
                    Work Shift
                  </button>
                ) : (
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Choose shift length</h3>
                      <button
                        type="button"
                        onClick={closeShiftPlanner}
                        disabled={loading}
                        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                        aria-label="Cancel shift planning"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2 mb-4">
                      {hourOptions.map((hours) => {
                        const isSelected = selectedHours === hours;
                        const gold = calculateJobGoldReward(hours);

                        return (
                          <button
                            key={hours}
                            type="button"
                            onClick={() => setSelectedHours(hours)}
                            className={`rounded-md border px-2 py-3 text-center transition-colors ${
                              isSelected
                                ? "border-primary bg-primary/20 text-primary"
                                : "border-border bg-secondary/40 hover:border-primary/40"
                            }`}
                          >
                            <div className="text-sm font-semibold">{hours}h</div>
                            <div className="text-xs text-muted-foreground mt-1">{gold}g</div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="p-4 rounded-md bg-secondary/50 mb-4">
                      <h4 className="font-semibold mb-2">Shift preview</h4>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span>
                          Duration:{" "}
                          <strong>
                            {selectedHours} hour{selectedHours === 1 ? "" : "s"}
                          </strong>
                        </span>
                        <span>
                          Gold reward: <strong className="gold-text">{previewGold}</strong>
                        </span>
                        <span>
                          Job XP: <strong>{previewXp}</strong>
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Examples: 1 hour = 5 gold, 6 hours = 50 gold, 12 hours = 100 gold.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={handleStartShift}
                        disabled={loading}
                        className="btn-primary flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          "Starting shift..."
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            Commit to {selectedHours}-Hour Shift
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={closeShiftPlanner}
                        disabled={loading}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
