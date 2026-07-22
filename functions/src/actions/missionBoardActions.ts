import { onCall, HttpsError } from "firebase-functions/v2/https";
import {
  createInitialCampaignState,
  missionBoardNeedsReroll,
  normalizeMissionRank,
  rollMissionBoard,
} from "@bloodline/shared/campaign";
import type { ActiveMission, Heir, Lineage, MissionBoard, Party } from "@bloodline/shared/types";
import { db } from "../index.js";
import { getMissionTemplate, getMissionTemplates } from "../utils/missions.js";

interface MissionBoardRequest {
  lineageId: string;
  heirId: string;
}

interface AcceptMissionRequest extends MissionBoardRequest {
  slotIndex: number;
}

function eligibilityContext(lineage: Lineage, heir: Heir) {
  return {
    lineage: {
      generation: lineage.generation,
      publicSummary: lineage.publicSummary,
    },
    heir: {
      level: heir.level,
      stats: heir.stats,
      classId: heir.classId,
      completedMissionIds: heir.completedMissionIds ?? [],
    },
    adventurerRank: normalizeMissionRank(lineage.adventurerRank),
  };
}

export const getMissionBoard = onCall<MissionBoardRequest>(
  { cors: true },
  async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Must be signed in");
    const { lineageId, heirId } = request.data;
    if (!lineageId || !heirId) throw new HttpsError("invalid-argument", "Missing required fields");

    const lineageRef = db.collection("lineages").doc(lineageId);
    const heirRef = lineageRef.collection("heirs").doc(heirId);
    const boardRef = lineageRef.collection("missionBoard").doc("current");
    return db.runTransaction(async (transaction) => {
      const [lineageDoc, heirDoc, boardDoc] = await Promise.all([
        transaction.get(lineageRef),
        transaction.get(heirRef),
        transaction.get(boardRef),
      ]);
      if (!lineageDoc.exists || !heirDoc.exists) {
        throw new HttpsError("not-found", "Lineage or heir not found");
      }
      const lineage = { id: lineageDoc.id, ...lineageDoc.data() } as Lineage;
      const heir = { id: heirDoc.id, ...heirDoc.data() } as Heir;
      if (lineage.ownerUid !== request.auth!.uid || heir.ownerUid !== request.auth!.uid) {
        throw new HttpsError("permission-denied", "You do not own this heir");
      }
      if (lineage.activeHeirId !== heirId || heir.status !== "alive") {
        throw new HttpsError("failed-precondition", "Heir is not active");
      }

      const existing = boardDoc.exists ? (boardDoc.data() as MissionBoard) : null;
      const rank = normalizeMissionRank(lineage.adventurerRank);
      const board = missionBoardNeedsReroll(existing)
        ? rollMissionBoard(getMissionTemplates(), lineageId, rank, heir.level, eligibilityContext(lineage, heir))
        : existing!;
      if (board !== existing) transaction.set(boardRef, board);
      return {
        board,
        adventurerRank: rank,
        adventurerRankXp: lineage.adventurerRankXp ?? 0,
      };
    });
  }
);

export const acceptMission = onCall<AcceptMissionRequest>(
  { cors: true },
  async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Must be signed in");
    const { lineageId, heirId, slotIndex } = request.data;
    if (!lineageId || !heirId || !Number.isInteger(slotIndex)) {
      throw new HttpsError("invalid-argument", "Invalid mission slot");
    }

    const lineageRef = db.collection("lineages").doc(lineageId);
    const heirRef = lineageRef.collection("heirs").doc(heirId);
    const boardRef = lineageRef.collection("missionBoard").doc("current");
    return db.runTransaction(async (transaction) => {
      const [lineageDoc, heirDoc, boardDoc] = await Promise.all([
        transaction.get(lineageRef),
        transaction.get(heirRef),
        transaction.get(boardRef),
      ]);
      if (!lineageDoc.exists || !heirDoc.exists || !boardDoc.exists) {
        throw new HttpsError("not-found", "Mission board or heir not found");
      }
      const lineage = { id: lineageDoc.id, ...lineageDoc.data() } as Lineage;
      const heir = { id: heirDoc.id, ...heirDoc.data() } as Heir;
      const board = boardDoc.data() as MissionBoard;
      if (lineage.ownerUid !== request.auth!.uid || heir.ownerUid !== request.auth!.uid) {
        throw new HttpsError("permission-denied", "You do not own this heir");
      }
      if (lineage.activeHeirId !== heirId || heir.status !== "alive") {
        throw new HttpsError("failed-precondition", "Heir is not active");
      }
      if (heir.activeMission) throw new HttpsError("failed-precondition", "Mission already active");
      if (heir.activeJobShift && heir.activeJobShift.endsAtMs > Date.now()) {
        throw new HttpsError("failed-precondition", "Heir is working a job shift");
      }

      const slot = board.slots.find((entry) => entry.slotIndex === slotIndex);
      if (!slot?.missionId || slot.status !== "available") {
        throw new HttpsError("failed-precondition", "Mission is no longer available");
      }
      const mission = getMissionTemplate(slot.missionId);
      if (!mission) throw new HttpsError("not-found", "Mission not found");
      if ((heir.missionCooldowns?.[mission.id] ?? 0) > Date.now()) {
        throw new HttpsError("failed-precondition", "Mission is on cooldown");
      }

      const activeMission: ActiveMission = {
        missionId: mission.id,
        missionName: mission.name,
        difficulty: mission.difficulty,
        slotIndex,
        currentStep: 0,
        totalSteps: mission.campaign.steps.length,
        startedAtMs: Date.now(),
        campaignState: createInitialCampaignState(mission),
        revision: 0,
      };
      const nextBoard: MissionBoard = {
        ...board,
        slots: board.slots.map((entry) =>
          entry.slotIndex === slotIndex
            ? { slotIndex, missionId: null, difficulty: null, status: "empty" }
            : entry
        ),
      };

      let partyRef: FirebaseFirestore.DocumentReference | null = null;
      let party: Party | null = null;
      if (lineage.partyId) {
        partyRef = db.collection("parties").doc(lineage.partyId);
        const partyDoc = await transaction.get(partyRef);
        if (!partyDoc.exists) throw new HttpsError("failed-precondition", "Party no longer exists");
        party = { id: partyDoc.id, ...partyDoc.data() } as Party;
        if (party.leaderUid !== request.auth!.uid) {
          throw new HttpsError("permission-denied", "Only the party leader can accept missions");
        }
        if (party.activeMission || party.activeDungeon) {
          throw new HttpsError("failed-precondition", "Party is already busy");
        }
      }

      transaction.set(boardRef, nextBoard);
      transaction.update(heirRef, { activeMission });
      if (partyRef && party) {
        transaction.update(partyRef, {
          activeMission: {
            ...activeMission,
            leaderUid: request.auth!.uid,
            leaderLineageId: lineageId,
            leaderHeirId: heirId,
            updatedAtMs: Date.now(),
            pendingBattle: null,
            outcome: null,
          },
        });
      }
      return { activeMission, mission, board: nextBoard };
    });
  }
);
