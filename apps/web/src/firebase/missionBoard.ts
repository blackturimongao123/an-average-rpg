import {
  bootstrapAcceptMission,
  bootstrapGetMissionBoard,
} from "./missionBoardBootstrap";
import { advanceMission as advanceMissionCallable, type AdvanceMissionResult } from "./functions";

export async function getPlayerMissionBoard(
  userId: string,
  lineageId: string,
  heirLevel: number
) {
  return bootstrapGetMissionBoard(userId, lineageId, heirLevel);
}

export async function acceptPlayerMission(
  userId: string,
  lineageId: string,
  heirId: string,
  slotIndex: number
) {
  return bootstrapAcceptMission(userId, lineageId, heirId, slotIndex);
}

export async function advancePlayerMission(
  _userId: string,
  lineageId: string,
  heirId: string,
  choiceId?: string
): Promise<AdvanceMissionResult> {
  const response = await advanceMissionCallable({ lineageId, heirId, choiceId });
  return response.data;
}
