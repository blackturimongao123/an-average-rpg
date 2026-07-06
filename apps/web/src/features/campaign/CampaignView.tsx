import type { ActiveMission, Heir, MissionCampaignChoice, MissionTemplate } from "@bloodline/shared/types";
import { activeMissionToAdventure } from "@bloodline/shared/adventure";
import { AdventureEventView } from "@/features/adventure/AdventureEventView";

interface CampaignViewProps {
  heir: Heir;
  activeMission: ActiveMission;
  mission: MissionTemplate;
  loading: boolean;
  onChoose: (choice: MissionCampaignChoice) => void;
  onAbandon?: () => void;
}

export function CampaignView({
  heir,
  activeMission,
  mission,
  loading,
  onChoose,
  onAbandon,
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
  };

  const regionLabel =
    campaignState.regionName ?? mission.campaign.regionName ?? mission.name.toUpperCase();
  const isFinalStep =
    !isInterlude && activeMission.currentStep >= activeMission.totalSteps - 1;

  return (
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
    />
  );
}
