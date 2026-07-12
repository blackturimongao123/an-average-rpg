import { advanceMission as advanceMissionFunction, type AdvanceMissionResult } from "./functions";
import { acceptMission, getMissionBoard } from "./functions";
import type { Heir, Lineage } from "@bloodline/shared/types";
import {
  expandBattleReplayForParty,
  type CombatData,
  type PartyReplayAlly,
} from "@bloodline/shared/combat";
import combatDataJson from "@game-data/combat.json";

const combatData = combatDataJson as CombatData;

export async function getPlayerMissionBoard(
  userId: string,
  lineageId: string,
  heir: Pick<Heir, "id" | "level" | "stats" | "classId" | "completedMissionIds">
) {
  void userId;
  const response = await getMissionBoard({ lineageId, heirId: heir.id });
  return response.data;
}

export async function acceptPlayerMission(
  userId: string,
  lineageId: string,
  heirId: string,
  slotIndex: number
) {
  void userId;
  const response = await acceptMission({ lineageId, heirId, slotIndex });
  return response.data;
}

export async function advancePlayerMission(
  userId: string,
  lineage: Lineage,
  heir: Heir,
  choiceId?: string,
  partyAllies?: PartyReplayAlly[],
  options?: { deferPersist?: boolean }
): Promise<AdvanceMissionResult> {
  void userId;
  void options;
  const response = await advanceMissionFunction({
    lineageId: lineage.id,
    heirId: heir.id,
    choiceId,
    expectedRevision: heir.activeMission?.revision ?? 0,
  });
  const result = response.data;
  if (result.battleReplay && partyAllies && partyAllies.length > 1) {
    result.battleReplay = expandBattleReplayForParty(
      result.battleReplay,
      heir.id,
      partyAllies,
      combatData
    );
  }
  return result;
}

export async function persistPlayerMissionAdvance(
  userId: string,
  lineage: Lineage,
  heir: Heir,
  choiceId: string | undefined,
  result: AdvanceMissionResult
): Promise<void> {
  void userId;
  void lineage;
  void heir;
  void choiceId;
  void result;
}
