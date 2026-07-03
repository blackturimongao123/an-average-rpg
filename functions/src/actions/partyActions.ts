import { onCall, HttpsError } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "../index.js";
import { generateId } from "../utils/helpers.js";
import type { Lineage } from "../utils/types.js";

const MAX_PARTY_SIZE = 4;

interface CreatePartyRequest {
  lineageId: string;
}

interface CreatePartyResponse {
  partyId: string;
}

export const createParty = onCall<CreatePartyRequest>(
  { cors: true },
  async (request): Promise<CreatePartyResponse> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be signed in");
    }

    const { lineageId } = request.data;
    if (!lineageId) {
      throw new HttpsError("invalid-argument", "Missing lineageId");
    }

    const uid = request.auth.uid;
    const lineageRef = db.collection("lineages").doc(lineageId);
    const lineageDoc = await lineageRef.get();

    if (!lineageDoc.exists) {
      throw new HttpsError("not-found", "Lineage not found");
    }

    const lineage = lineageDoc.data() as Lineage;
    if (lineage.ownerUid !== uid) {
      throw new HttpsError("permission-denied", "You do not own this lineage");
    }
    if (lineage.partyId) {
      throw new HttpsError("failed-precondition", "Already in a party");
    }

    const partyId = generateId();
    const nowMs = Date.now();

    const batch = db.batch();
    batch.set(db.collection("parties").doc(partyId), {
      id: partyId,
      leaderUid: uid,
      leaderLineageId: lineageId,
      memberUids: [uid],
      memberLineageIds: [lineageId],
      createdAtMs: nowMs,
    });
    batch.update(lineageRef, {
      partyId,
      updatedAt: FieldValue.serverTimestamp(),
    });
    await batch.commit();

    return { partyId };
  }
);

interface InviteToPartyRequest {
  lineageId: string;
  toUsername: string;
}

interface InviteToPartyResponse {
  inviteId: string;
  toUid: string;
}

export const inviteToParty = onCall<InviteToPartyRequest>(
  { cors: true },
  async (request): Promise<InviteToPartyResponse> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be signed in");
    }

    const { lineageId, toUsername } = request.data;
    if (!lineageId || !toUsername?.trim()) {
      throw new HttpsError("invalid-argument", "Missing required fields");
    }

    const uid = request.auth.uid;
    const lineageRef = db.collection("lineages").doc(lineageId);
    const lineageDoc = await lineageRef.get();

    if (!lineageDoc.exists) {
      throw new HttpsError("not-found", "Lineage not found");
    }

    const lineage = lineageDoc.data() as Lineage;
    if (lineage.ownerUid !== uid) {
      throw new HttpsError("permission-denied", "You do not own this lineage");
    }
    if (!lineage.partyId) {
      throw new HttpsError("failed-precondition", "You are not in a party");
    }

    const partyDoc = await db.collection("parties").doc(lineage.partyId).get();
    if (!partyDoc.exists) {
      throw new HttpsError("not-found", "Party not found");
    }

    const party = partyDoc.data()!;
    if (party.leaderUid !== uid) {
      throw new HttpsError("permission-denied", "Only the party leader can invite");
    }
    if ((party.memberUids as string[]).length >= MAX_PARTY_SIZE) {
      throw new HttpsError("failed-precondition", "Party is full");
    }

    const key = toUsername.trim().toLowerCase();
    const usernameDoc = await db.collection("usernames").doc(key).get();
    if (!usernameDoc.exists) {
      throw new HttpsError("not-found", "Player not found");
    }

    const toUid = usernameDoc.data()!.uid as string;
    if (toUid === uid) {
      throw new HttpsError("invalid-argument", "Cannot invite yourself");
    }
    if ((party.memberUids as string[]).includes(toUid)) {
      throw new HttpsError("failed-precondition", "Player is already in the party");
    }

    const existingInvites = await db
      .collection("partyInvites")
      .where("toUid", "==", toUid)
      .where("partyId", "==", lineage.partyId)
      .where("status", "==", "pending")
      .limit(1)
      .get();

    if (!existingInvites.empty) {
      throw new HttpsError("already-exists", "Invite already pending");
    }

    const inviteId = generateId();
    await db.collection("partyInvites").doc(inviteId).set({
      id: inviteId,
      fromUid: uid,
      toUid,
      partyId: lineage.partyId,
      status: "pending",
      createdAtMs: Date.now(),
    });

    return { inviteId, toUid };
  }
);

interface AcceptPartyInviteRequest {
  lineageId: string;
  inviteId: string;
}

interface AcceptPartyInviteResponse {
  partyId: string;
}

export const acceptPartyInvite = onCall<AcceptPartyInviteRequest>(
  { cors: true },
  async (request): Promise<AcceptPartyInviteResponse> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be signed in");
    }

    const { lineageId, inviteId } = request.data;
    if (!lineageId || !inviteId) {
      throw new HttpsError("invalid-argument", "Missing required fields");
    }

    const uid = request.auth.uid;
    const lineageRef = db.collection("lineages").doc(lineageId);
    const inviteRef = db.collection("partyInvites").doc(inviteId);

    const [lineageDoc, inviteDoc] = await Promise.all([lineageRef.get(), inviteRef.get()]);
    if (!lineageDoc.exists || !inviteDoc.exists) {
      throw new HttpsError("not-found", "Lineage or invite not found");
    }

    const lineage = lineageDoc.data() as Lineage;
    const invite = inviteDoc.data()!;

    if (lineage.ownerUid !== uid) {
      throw new HttpsError("permission-denied", "You do not own this lineage");
    }
    if (invite.toUid !== uid) {
      throw new HttpsError("permission-denied", "This invite is not for you");
    }
    if (invite.status !== "pending") {
      throw new HttpsError("failed-precondition", "Invite is no longer valid");
    }
    if (lineage.partyId) {
      throw new HttpsError("failed-precondition", "Already in a party");
    }

    const partyRef = db.collection("parties").doc(invite.partyId as string);

    await db.runTransaction(async (tx) => {
      const partyDoc = await tx.get(partyRef);
      if (!partyDoc.exists) {
        throw new HttpsError("not-found", "Party no longer exists");
      }

      const party = partyDoc.data()!;
      const memberUids = [...(party.memberUids as string[])];
      const memberLineageIds = [...(party.memberLineageIds as string[])];

      if (memberUids.length >= MAX_PARTY_SIZE) {
        throw new HttpsError("failed-precondition", "Party is full");
      }

      memberUids.push(uid);
      memberLineageIds.push(lineageId);

      tx.update(partyRef, { memberUids, memberLineageIds });
      tx.update(lineageRef, {
        partyId: invite.partyId,
        updatedAt: FieldValue.serverTimestamp(),
      });
      tx.update(inviteRef, { status: "accepted" });
    });

    return { partyId: invite.partyId as string };
  }
);

interface LeavePartyRequest {
  lineageId: string;
}

interface LeavePartyResponse {
  left: boolean;
}

export const leaveParty = onCall<LeavePartyRequest>(
  { cors: true },
  async (request): Promise<LeavePartyResponse> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be signed in");
    }

    const { lineageId } = request.data;
    if (!lineageId) {
      throw new HttpsError("invalid-argument", "Missing lineageId");
    }

    const uid = request.auth.uid;
    const lineageRef = db.collection("lineages").doc(lineageId);
    const lineageDoc = await lineageRef.get();

    if (!lineageDoc.exists) {
      throw new HttpsError("not-found", "Lineage not found");
    }

    const lineage = lineageDoc.data() as Lineage;
    if (lineage.ownerUid !== uid) {
      throw new HttpsError("permission-denied", "You do not own this lineage");
    }
    if (!lineage.partyId) {
      throw new HttpsError("failed-precondition", "Not in a party");
    }

    const partyRef = db.collection("parties").doc(lineage.partyId);

    await db.runTransaction(async (tx) => {
      const partyDoc = await tx.get(partyRef);
      if (!partyDoc.exists) {
        tx.update(lineageRef, {
          partyId: null,
          updatedAt: FieldValue.serverTimestamp(),
        });
        return;
      }

      const party = partyDoc.data()!;
      let memberUids = (party.memberUids as string[]).filter((id) => id !== uid);
      let memberLineageIds = (party.memberLineageIds as string[]).filter((id) => id !== lineageId);

      if (memberUids.length === 0) {
        tx.delete(partyRef);
      } else {
        const updates: Record<string, unknown> = { memberUids, memberLineageIds };
        if (party.leaderUid === uid) {
          updates.leaderUid = memberUids[0];
          updates.leaderLineageId = memberLineageIds[0];
        }
        tx.update(partyRef, updates);
      }

      tx.update(lineageRef, {
        partyId: null,
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    return { left: true };
  }
);
