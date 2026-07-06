import type { MissionTemplate } from "@bloodline/shared/types";

import missionsData from "../../../game-data/missions.json";

const missions = missionsData.missions as MissionTemplate[];

export function getMissionTemplate(missionId: string): MissionTemplate | null {
  return missions.find((entry) => entry.id === missionId) ?? null;
}
