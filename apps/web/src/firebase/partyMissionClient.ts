import { doc, runTransaction, serverTimestamp, updateDoc } from "firebase/firestore";
import {
  applyAdventurerRankXp,
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
    revision: partyMission.revision ?? 0,
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

/** End a party mission: clear shared run state and broadcast outcome to all members. */
export async function finalizePartyMission(
  partyId: string,
  outcome: Omit<PartyMissionOutcome, "updatedAtMs">
): Promise<void> {
  await updateDoc(doc(db, "parties", partyId), {
    activeMission: null,
    lastMissionOutcome: firestoreSafe({
      ...outcome,
      updatedAtMs: Date.now(),
    }),
  });
}

export async function clearPartyMissionOutcome(partyId: string): Promise<void> {
  await updateDoc(doc(db, "parties", partyId), { lastMissionOutcome: null });
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
  const receiptId = `party-mission:${outcome.updatedAtMs}`;

  await runTransaction(db, async (transaction) => {
    const [lineageSnapshot, heirSnapshot] = await Promise.all([
      transaction.get(lineageRef),
      transaction.get(heirRef),
    ]);
    if (!lineageSnapshot.exists() || !heirSnapshot.exists()) {
      throw new Error("Lineage or heir no longer exists");
    }

    const currentLineage = { id: lineageSnapshot.id, ...lineageSnapshot.data() } as Lineage;
    const currentHeir = { id: heirSnapshot.id, ...heirSnapshot.data() } as Heir;
    const receipts = currentHeir.appliedPartyMissionOutcomeIds ?? [];
    if (receipts.includes(receiptId)) return;

    const missionId = currentHeir.activeMission?.missionId;
    const commonHeirUpdate: Record<string, unknown> = {
      activeMission: null,
      appliedPartyMissionOutcomeIds: [...receipts, receiptId].slice(-50),
    };

    if (outcome.missionFailed) {
      transaction.update(heirRef, {
        ...commonHeirUpdate,
        ...(missionId
          ? {
              missionCooldowns: {
                ...(currentHeir.missionCooldowns ?? {}),
                [missionId]: Date.now() + MISSION_COOLDOWN_MS,
              },
            }
          : {}),
      });
      transaction.update(lineageRef, { updatedAt: serverTimestamp() });
      return;
    }

    if (outcome.completed && outcome.rewards) {
      const xpForNextLevel = XP_PER_LEVEL(currentHeir.level);
      const newXp = currentHeir.xp + outcome.rewards.xp;
      const leveledUp = newXp >= xpForNextLevel;
      transaction.update(heirRef, {
        ...commonHeirUpdate,
        gold: currentHeir.gold + outcome.rewards.gold,
        xp: leveledUp ? newXp - xpForNextLevel : newXp,
        level: leveledUp ? currentHeir.level + 1 : currentHeir.level,
        inventory: [...currentHeir.inventory, ...outcome.rewards.items],
        ...(missionId
          ? {
              completedMissionIds: [
                ...new Set([...(currentHeir.completedMissionIds ?? []), missionId]),
              ],
            }
          : {}),
      });

      const rankResult = applyAdventurerRankXp(
        currentLineage.adventurerRank ?? "F",
        currentLineage.adventurerRankXp ?? 0,
        outcome.rewards.rankXp
      );
      transaction.update(lineageRef, {
        adventurerRank: rankResult.rank,
        adventurerRankXp: rankResult.rankXp,
        updatedAt: serverTimestamp(),
      });
      return;
    }

    transaction.update(heirRef, commonHeirUpdate);
  });
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
