import {
  bootstrapAcceptMission,
  bootstrapAdvanceMission,
  bootstrapGetMissionBoard,
} from "./missionBoardBootstrap";

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
  userId: string,
  lineageId: string,
  heirId: string
) {
  return bootstrapAdvanceMission(userId, lineageId, heirId);
}
