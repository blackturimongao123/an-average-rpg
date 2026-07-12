import type { ActiveMission, Heir, MissionCampaignChoice, MissionTemplate } from "@bloodline/shared/types";
import { activeMissionToAdventure } from "@bloodline/shared/adventure";
import { AdventureEventView, type AdventurePartyMember } from "@/features/adventure/AdventureEventView";

interface CampaignViewProps {
  heir: Heir;
  activeMission: ActiveMission;
  mission: MissionTemplate;
  loading: boolean;
  onChoose: (choice: MissionCampaignChoice) => void;
  onAbandon?: () => void;
  partyMembers?: AdventurePartyMember[];
  choicesDisabled?: boolean;
  leaderHint?: string;
}

export function CampaignView({
  heir,
  activeMission,
  mission,
  loading,
  onChoose,
  onAbandon,
  partyMembers,
  choicesDisabled,
  leaderHint,
}: CampaignViewProps) {
  const { step, choices, title, isInterlude, progressLabel } = activeMissionToAdventure(
    mission,
    activeMission
  );
  const campaignState = activeMission.campaignState ?? {
    supplies: 30,
    maxSupplies: 30,
    morale: 78,
    stagesRemaining: mission.campaign.steps.length + 2,
    maxStages: mission.campaign.steps.length + 2,
    eventLog: [],
    runGold: 0,
    runXp: 0,
    runItems: [],
    hpPercent: 100,
    regionName: mission.campaign.regionName,
    seenRandomEventIds: [],
    seenSecretEventIds: [],
    choiceHistory: [],
    restUsesCount: 0,
  };

  const regionLabel =
    campaignState.regionName ?? mission.campaign.regionName ?? mission.name.toUpperCase();
  const isFinalStep =
    !isInterlude && activeMission.currentStep >= activeMission.totalSteps - 1;
  const objectives = (mission.campaign.objectives ?? []).flatMap((objective) => {
    const progress = campaignState.objectiveProgress?.find(
      (entry) => entry.objectiveId === objective.id
    );
    if (objective.hiddenUntilDiscovered && !progress?.discovered) return [];
    return [{ objective, progress }];
  });

  return (
    <div className="space-y-3">
      {objectives.length > 0 && (
        <section className="rounded-lg border border-amber-900/40 bg-stone-950/70 p-3">
          <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wider text-stone-400">
            <span>Objectives</span>
            <span>{campaignState.maxStages - campaignState.stagesRemaining} / {campaignState.maxStages} stages used</span>
          </div>
          <div className="space-y-1.5">
            {objectives.map(({ objective, progress }) => (
              <div key={objective.id} className="flex items-center justify-between text-sm">
                <span className={progress?.completed ? "text-emerald-300" : "text-stone-200"}>
                  {progress?.completed ? "✓ " : ""}{objective.label}
                  {objective.kind !== "main" && (
                    <span className="ml-2 text-xs text-stone-500">{objective.kind}</span>
                  )}
                </span>
                <span className="text-stone-400">
                  {progress?.current ?? 0}/{progress?.target ?? objective.target}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
      <AdventureEventView
      heir={heir}
      eventTitle={title}
      regionLabel={regionLabel}
      progressLabel={progressLabel}
      step={step}
      choices={choices}
      loading={loading}
      onChoose={onChoose}
      onAbandon={onAbandon}
      supplies={{ current: campaignState.supplies, max: campaignState.maxSupplies }}
      morale={campaignState.morale}
      hpPercent={campaignState.hpPercent}
      showRunResources
      eventLog={campaignState.eventLog}
      journeyNodes={mission.campaign.steps.map((s) => ({ eventType: s.eventType }))}
      journeyCurrent={activeMission.currentStep}
      possibleRewards={mission.rewards}
      eventTypeLabel={step.eventType ?? mission.type}
      difficultyLabel={`${mission.difficulty}-Rank`}
      footerHint={
        isInterlude
          ? "Unexpected detour — resolve this before the contract continues"
          : isFinalStep
            ? "Final stage — choice completes contract"
            : "Choose an action to advance"
      }
      partyMembers={partyMembers}
      choicesDisabled={choicesDisabled}
      leaderHint={leaderHint}
      />
    </div>
  );
}
