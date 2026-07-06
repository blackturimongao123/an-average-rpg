import { doc, serverTimestamp, updateDoc, writeBatch } from "firebase/firestore";
import {
  MISSION_COOLDOWN_MS,
  XP_PER_LEVEL,
} from "@bloodline/shared/constants";
import type {
  ActiveMission,
  Heir,
  Lineage,
  PartyActiveMission,
  PartyMissionOutcome,
  PartyMissionPendingBattle,
} from "@bloodline/shared/types";
import { db } from "./config";

function firestoreSafe<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function activeMissionFromParty(partyMission: PartyActiveMission): ActiveMission {
  return {
    missionId: partyMission.missionId,
    missionName: partyMission.missionName,
    difficulty: partyMission.difficulty,
    slotIndex: partyMission.slotIndex,
    currentStep: partyMission.currentStep,
    totalSteps: partyMission.totalSteps,
    startedAtMs: partyMission.startedAtMs,
    campaignState: partyMission.campaignState,
  };
}

export function buildPartyActiveMission(
  activeMission: ActiveMission,
  leader: { uid: string; lineageId: string; heirId: string }
): PartyActiveMission {
  return {
    ...activeMission,
    leaderUid: leader.uid,
    leaderLineageId: leader.lineageId,
    leaderHeirId: leader.heirId,
    updatedAtMs: Date.now(),
    pendingBattle: null,
    outcome: null,
  };
}

export async function startPartyMission(
  partyId: string,
  activeMission: ActiveMission,
  leader: { uid: string; lineageId: string; heirId: string }
): Promise<void> {
  const partyMission = buildPartyActiveMission(activeMission, leader);
  await updateDoc(doc(db, "parties", partyId), {
    activeMission: firestoreSafe(partyMission),
  });
}

export async function syncPartyMissionState(
  partyId: string,
  activeMission: ActiveMission,
  leader: { uid: string; lineageId: string; heirId: string }
): Promise<void> {
  const partyMission = buildPartyActiveMission(activeMission, leader);
  await updateDoc(doc(db, "parties", partyId), {
    activeMission: firestoreSafe(partyMission),
  });
}

export async function setPartyMissionPendingBattle(
  partyId: string,
  pendingBattle: Omit<PartyMissionPendingBattle, "updatedAtMs">
): Promise<void> {
  await updateDoc(doc(db, "parties", partyId), {
    "activeMission.pendingBattle": firestoreSafe({
      ...pendingBattle,
      updatedAtMs: Date.now(),
    }),
    "activeMission.updatedAtMs": Date.now(),
  });
}

export async function clearPartyMissionPendingBattle(partyId: string): Promise<void> {
  await updateDoc(doc(db, "parties", partyId), {
    "activeMission.pendingBattle": null,
    "activeMission.updatedAtMs": Date.now(),
  });
}

export async function setPartyMissionOutcome(
  partyId: string,
  outcome: Omit<PartyMissionOutcome, "updatedAtMs">
): Promise<void> {
  await updateDoc(doc(db, "parties", partyId), {
    "activeMission.outcome": firestoreSafe({
      ...outcome,
      updatedAtMs: Date.now(),
    }),
    "activeMission.updatedAtMs": Date.now(),
  });
}

export async function clearPartyMission(partyId: string): Promise<void> {
  await updateDoc(doc(db, "parties", partyId), { activeMission: null });
}

export async function applyPartyMissionOutcomeToHeir(
  lineage: Lineage,
  heir: Heir,
  outcome: PartyMissionOutcome
): Promise<void> {
  const lineageRef = doc(db, "lineages", lineage.id);
  const heirRef = doc(db, "lineages", lineage.id, "heirs", heir.id);
  const batch = writeBatch(db);

  if (outcome.missionFailed) {
    const missionId = heir.activeMission?.missionId;
    batch.update(heirRef, {
      activeMission: null,
      ...(missionId
        ? {
            missionCooldowns: {
              ...(heir.missionCooldowns ?? {}),
              [missionId]: Date.now() + MISSION_COOLDOWN_MS,
            },
          }
        : {}),
    });
    batch.update(lineageRef, { updatedAt: serverTimestamp() });
    await batch.commit();
    return;
  }

  if (outcome.completed && outcome.rewards) {
    const xpForNextLevel = XP_PER_LEVEL(heir.level);
    const newGold = heir.gold + outcome.rewards.gold;
    const newXp = heir.xp + outcome.rewards.xp;
    const leveledUp = newXp >= xpForNextLevel;
    const finalXp = leveledUp ? newXp - xpForNextLevel : newXp;
    const finalLevel = leveledUp ? heir.level + 1 : heir.level;
    const missionId = heir.activeMission?.missionId;

    batch.update(heirRef, {
      gold: newGold,
      xp: finalXp,
      level: finalLevel,
      inventory: [...heir.inventory, ...outcome.rewards.items],
      activeMission: null,
      ...(missionId
        ? {
            completedMissionIds: [
              ...new Set([...(heir.completedMissionIds ?? []), missionId]),
            ],
          }
        : {}),
    });

    if (outcome.adventurerRank !== undefined && outcome.adventurerRankXp !== undefined) {
      batch.update(lineageRef, {
        adventurerRank: outcome.adventurerRank,
        adventurerRankXp: outcome.adventurerRankXp,
        updatedAt: serverTimestamp(),
      });
    } else {
      batch.update(lineageRef, { updatedAt: serverTimestamp() });
    }

    await batch.commit();
    return;
  }

  batch.update(heirRef, { activeMission: null });
  await batch.commit();
}

export async function syncHeirActiveMissionFromParty(
  lineageId: string,
  heirId: string,
  partyMission: PartyActiveMission
): Promise<void> {
  await updateDoc(doc(db, "lineages", lineageId, "heirs", heirId), {
    activeMission: firestoreSafe(activeMissionFromParty(partyMission)),
  });
}
