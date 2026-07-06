import type {
  ActiveMission,
  AdventurerRank,
  CampaignRunState,
  Heir,
  Lineage,
  MissionCampaignChoice,
  MissionCampaignStep,
  MissionTemplate,
} from "../types.js";
import type { MissionInterludePools } from "./missionInterludeEligibility.js";
import {
  applyChoiceToCampaignState,
  createInitialCampaignState,
} from "./campaignState.js";
import {
  appendChoiceHistory,
  applyChoiceToStateWithHistory,
  clearMissionInterlude,
  getActiveMissionStep,
  recordInterludeTriggered,
  stepTriggersCombat,
  tryRollMissionInterlude,
} from "./missionInterludes.js";

export interface AdvanceMissionCampaignInput {
  mission: MissionTemplate;
  activeMission: ActiveMission;
  lineage: Pick<Lineage, "id" | "generation" | "publicSummary">;
  heir: Pick<Heir, "id" | "level" | "stats" | "classId" | "generation" | "completedMissionIds">;
  adventurerRank: AdventurerRank;
  choiceId?: string;
  interludeChanceRoll: number;
  interludePickRoll: number;
  interludePools: MissionInterludePools;
}

export interface AdvanceMissionCampaignOutput {
  nextActiveMission: ActiveMission | null;
  nextCampaignState: CampaignRunState;
  resolvedStep: MissionCampaignStep;
  resolvedIsInterlude: boolean;
  resolvedFixedStepIndex: number;
  combatRequired: boolean;
  completed: boolean;
  choice: MissionCampaignChoice | null;
}

export function advanceMissionCampaign(
  input: AdvanceMissionCampaignInput
): AdvanceMissionCampaignOutput {
  const { mission, activeMission, lineage, heir, adventurerRank, choiceId, interludeChanceRoll, interludePickRoll, interludePools } =
    input;
  const baseState =
    activeMission.campaignState ?? createInitialCampaignState(mission);

  const display = getActiveMissionStep(mission, activeMission);
  const { step, choices, isInterlude, fixedStepIndex } = display;
  const choice = choices.find((entry) => entry.id === choiceId) ?? choices[0] ?? null;

  const logText = choice
    ? `${choice.label} — ${step.text.slice(0, 80)}${step.text.length > 80 ? "…" : ""}`
    : step.text;

  let nextCampaignState = applyChoiceToStateWithHistory(
    baseState,
    choice,
    step,
    logText,
    applyChoiceToCampaignState
  );

  const combatRequired = stepTriggersCombat(step);

  if (isInterlude) {
    nextCampaignState = clearMissionInterlude(nextCampaignState);
    const nextStep = activeMission.currentStep + 1;
    const completed = nextStep >= activeMission.totalSteps;

    if (completed) {
      return {
        nextActiveMission: null,
        nextCampaignState,
        resolvedStep: step,
        resolvedIsInterlude: true,
        resolvedFixedStepIndex: fixedStepIndex,
        combatRequired,
        completed: true,
        choice,
      };
    }

    const nextActiveMission: ActiveMission = {
      ...activeMission,
      currentStep: nextStep,
      campaignState: nextCampaignState,
    };

    return {
      nextActiveMission,
      nextCampaignState,
      resolvedStep: step,
      resolvedIsInterlude: true,
      resolvedFixedStepIndex: fixedStepIndex,
      combatRequired,
      completed: false,
      choice,
    };
  }

  const isFinalFixedStep = fixedStepIndex >= activeMission.totalSteps - 1;

  if (isFinalFixedStep) {
    return {
      nextActiveMission: null,
      nextCampaignState,
      resolvedStep: step,
      resolvedIsInterlude: false,
      resolvedFixedStepIndex: fixedStepIndex,
      combatRequired,
      completed: true,
      choice,
    };
  }

  const interlude = tryRollMissionInterlude(
    mission,
    {
      state: nextCampaignState,
      lineage,
      heir,
      adventurerRank,
      completedFixedStepIndex: fixedStepIndex,
      pools: interludePools,
    },
    interludeChanceRoll,
    interludePickRoll
  );

  if (interlude) {
    nextCampaignState = recordInterludeTriggered(nextCampaignState, interlude);
    const nextActiveMission: ActiveMission = {
      ...activeMission,
      campaignState: nextCampaignState,
    };

    return {
      nextActiveMission,
      nextCampaignState,
      resolvedStep: step,
      resolvedIsInterlude: false,
      resolvedFixedStepIndex: fixedStepIndex,
      combatRequired,
      completed: false,
      choice,
    };
  }

  const nextActiveMission: ActiveMission = {
    ...activeMission,
    currentStep: fixedStepIndex + 1,
    campaignState: nextCampaignState,
  };

  return {
    nextActiveMission,
    nextCampaignState,
    resolvedStep: step,
    resolvedIsInterlude: false,
    resolvedFixedStepIndex: fixedStepIndex,
    combatRequired,
    completed: false,
    choice,
  };
}
