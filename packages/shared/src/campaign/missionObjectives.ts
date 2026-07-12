import type { CampaignRunState, MissionObjectiveProgress, MissionTemplate } from "../types.js";

export const MISSION_EXTRACT_CHOICE_ID = "mission_extract";

export function createMissionObjectiveProgress(mission: MissionTemplate): MissionObjectiveProgress[] {
  return (mission.campaign.objectives ?? []).map((objective) => ({
    objectiveId: objective.id,
    current: 0,
    target: Math.max(1, objective.target),
    completed: false,
    discovered: !objective.hiddenUntilDiscovered,
  }));
}

export function areMainMissionObjectivesComplete(
  mission: MissionTemplate,
  state: CampaignRunState
): boolean {
  const mainObjectives = (mission.campaign.objectives ?? []).filter(
    (objective) => objective.kind === "main"
  );
  if (mainObjectives.length === 0) return false;
  return mainObjectives.every((objective) =>
    state.objectiveProgress?.some(
      (progress) => progress.objectiveId === objective.id && progress.completed
    )
  );
}

export function canExtractFromMission(mission: MissionTemplate, state: CampaignRunState): boolean {
  return areMainMissionObjectivesComplete(mission, state);
}

export function advanceMissionObjective(
  state: CampaignRunState,
  objectiveId: string,
  amount = 1
): CampaignRunState {
  return {
    ...state,
    objectiveProgress: (state.objectiveProgress ?? []).map((progress) => {
      if (progress.objectiveId !== objectiveId) return progress;
      const current = Math.min(progress.target, Math.max(0, progress.current + amount));
      return { ...progress, current, completed: current >= progress.target, discovered: true };
    }),
  };
}

export function advanceMissionObjectives(
  state: CampaignRunState,
  advances: Record<string, number> | undefined
): CampaignRunState {
  return Object.entries(advances ?? {}).reduce(
    (next, [objectiveId, amount]) => advanceMissionObjective(next, objectiveId, amount),
    state
  );
}
