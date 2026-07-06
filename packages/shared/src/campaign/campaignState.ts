import type {
  CampaignRunState,
  MissionCampaignChoice,
  MissionCampaignStep,
  MissionTemplate,
} from "../types.js";
import { stageCostForTimeCost } from "./adventureHelpers.js";

export function createInitialCampaignState(mission: MissionTemplate): CampaignRunState {
  const maxStages = mission.campaign.maxStages ?? mission.campaign.steps.length + 2;

  return {
    supplies: mission.campaign.startingSupplies ?? 30,
    maxSupplies: mission.campaign.startingSupplies ?? 30,
    morale: 78,
    stagesRemaining: maxStages,
    maxStages,
    eventLog: [
      {
        text: `Accepted contract: ${mission.name}`,
        timestampMs: Date.now(),
      },
    ],
    runGold: 0,
    runXp: 0,
    runItems: [],
    hpPercent: 100,
    regionName: mission.campaign.regionName ?? mission.name,
  };
}

export function applyChoiceToCampaignState(
  state: CampaignRunState,
  choice: MissionCampaignChoice,
  step: MissionCampaignStep,
  logText: string
): CampaignRunState {
  const stageCost = choice.stageCost ?? stageCostForTimeCost(step.timeCost);
  const supplies = Math.max(0, state.supplies - (choice.supplyCost ?? 0));
  const morale = Math.min(100, Math.max(0, state.morale + (choice.moraleDelta ?? 0)));
  const hpPercent = Math.min(100, Math.max(5, state.hpPercent + (choice.hpDelta ?? 0)));
  const stagesRemaining = Math.max(0, state.stagesRemaining - stageCost);

  return {
    ...state,
    supplies,
    morale,
    hpPercent,
    stagesRemaining,
    eventLog: [
      ...state.eventLog,
      { text: logText, timestampMs: Date.now() },
    ],
  };
}
