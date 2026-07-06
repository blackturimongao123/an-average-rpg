import {
  bootstrapAcceptMission,
  bootstrapGetMissionBoard,
} from "./missionBoardBootstrap";
import { advanceMissionLocal, persistAdvanceMission } from "./missionClient";
import type { AdvanceMissionResult } from "./functions";
import type { Heir, Lineage } from "@bloodline/shared/types";

export async function getPlayerMissionBoard(
  userId: string,
  lineageId: string,
  heir: Pick<Heir, "level" | "stats" | "classId" | "completedMissionIds">
) {
  return bootstrapGetMissionBoard(userId, lineageId, heir);
}

export async function acceptPlayerMission(
  userId: string,
  lineageId: string,
  heirId: string,
  slotIndex: number
) {
  return bootstrapAcceptMission(userId, lineageId, heirId, slotIndex);
}

export function advancePlayerMission(
  userId: string,
  lineage: Lineage,
  heir: Heir,
  choiceId?: string
): AdvanceMissionResult {
  const result = advanceMissionLocal({ userId, lineage, heir, choiceId });

  void persistAdvanceMission({ userId, lineage, heir, choiceId }, result).catch((err) => {
    console.error("Mission persist error:", err);
  });

  return result;
}
