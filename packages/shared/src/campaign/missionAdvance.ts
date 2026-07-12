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
import {
  applyRestUseToState,
  applyScavengeOutcomeToState,
  isMissionRestChoice,
  isMissionScavengeChoice,
  MISSION_SCAVENGE_CHOICE_ID,
  resolveScavengeOutcome,
  restUsesRemaining,
} from "./missionStandardChoices.js";

export interface AdvanceMissionCampaignInput {
  mission: MissionTemplate;
  activeMission: ActiveMission;
  lineage: Pick<Lineage, "id" | "generation" | "publicSummary">;
  heir: Pick<Heir, "id" | "level" | "stats" | "classId" | "generation" | "completedMissionIds" | "seenUniqueMissionEventIds">;
  adventurerRank: AdventurerRank;
  choiceId?: string;
  interludeChanceRoll: number;
  interludePickRoll: number;
  scavengeRoll?: number;
  scavengePickRoll?: number;
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
  const { mission, activeMission, lineage, heir, adventurerRank, choiceId, interludeChanceRoll, interludePickRoll, scavengeRoll, scavengePickRoll, interludePools } =
    input;
  const baseState =
    activeMission.campaignState ?? createInitialCampaignState(mission);

  const display = getActiveMissionStep(mission, activeMission);
  const { step, choices, isInterlude, fixedStepIndex } = display;
  const choice = choices.find((entry) => entry.id === choiceId) ?? null;
  if (!choice) {
    throw new Error("That mission choice is not available");
  }
  if (choice.unavailable) {
    throw new Error("That mission choice cannot be used right now");
  }
  if ((choice.supplyCost ?? 0) > baseState.supplies) {
    throw new Error("Not enough supplies for that choice");
  }

  if (isMissionRestChoice(choiceId) && restUsesRemaining(baseState) <= 0) {
    throw new Error("You have no rests remaining on this contract");
  }

  const logText = choice
    ? choice.id === MISSION_SCAVENGE_CHOICE_ID
      ? "Scavenge — searching the area…"
      : `${choice.label} — ${step.text.slice(0, 80)}${step.text.length > 80 ? "…" : ""}`
    : step.text;

  let nextCampaignState = applyChoiceToStateWithHistory(
    baseState,
    isMissionScavengeChoice(choiceId) ? null : choice,
    step,
    logText,
    applyChoiceToCampaignState
  );

  let resolvedStep: MissionCampaignStep = step;
  let combatRequired = stepTriggersCombat(step);

  if (isMissionRestChoice(choiceId) && choice) {
    nextCampaignState = applyRestUseToState(nextCampaignState);
  }

  if (isMissionScavengeChoice(choiceId) && choice) {
    const outcome = resolveScavengeOutcome(
      scavengeRoll ?? 0.5,
      mission,
      scavengePickRoll ?? 0.5
    );
    nextCampaignState = applyChoiceToCampaignState(
      nextCampaignState,
      choice,
      step,
      outcome.logText
    );
    nextCampaignState = applyScavengeOutcomeToState(nextCampaignState, outcome, true);
    nextCampaignState = appendChoiceHistory(nextCampaignState, choiceId);
    if (outcome.combatEncounter) {
      combatRequired = true;
      resolvedStep = {
        ...step,
        eventType: "combat",
        combatEncounter: outcome.combatEncounter,
      };
    }
  }

  if (isInterlude) {
    nextCampaignState = clearMissionInterlude(nextCampaignState);
    const nextStep = activeMission.currentStep + 1;
    const completed = nextStep >= activeMission.totalSteps;

    if (completed) {
      return {
        nextActiveMission: null,
        nextCampaignState,
        resolvedStep,
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
      resolvedStep,
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
      resolvedStep,
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
      resolvedStep,
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
    resolvedStep,
    resolvedIsInterlude: false,
    resolvedFixedStepIndex: fixedStepIndex,
    combatRequired,
    completed: false,
    choice,
  };
}
