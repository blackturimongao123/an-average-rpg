import { doc, getDoc, serverTimestamp, setDoc, updateDoc, writeBatch } from "firebase/firestore";
import type { Heir, HeirLookupEntry, Lineage, Party, PartyInvite, PartyMemberProfile } from "@bloodline/shared/types";
import { db } from "./config";
import { normalizeHeirNameKey } from "./heirLookup";

const MAX_PARTY_SIZE = 4;

function buildMemberProfile(lineage: Lineage, heir: Heir): PartyMemberProfile {
  return {
    familyName: lineage.familyName,
    heirName: heir.name,
    classId: heir.classId,
    subclassId: heir.subclassId ?? null,
    level: heir.level,
  };
}

function createPartyId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "");
  }
  return Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

function createInviteId(): string {
  return createPartyId();
}

async function lookupHeirByName(heirName: string): Promise<HeirLookupEntry> {
  const nameKey = normalizeHeirNameKey(heirName);
  const snap = await getDoc(doc(db, "heirLookup", nameKey));
  if (!snap.exists()) {
    throw new Error(`No living heir found named "${heirName.trim()}"`);
  }
  return snap.data() as HeirLookupEntry;
}

export async function createPartyClient(
  userId: string,
  lineage: Lineage,
  heir?: Heir
): Promise<{ partyId: string }> {
  if (lineage.ownerUid !== userId) {
    throw new Error("You do not own this lineage");
  }
  if (lineage.partyId) {
    throw new Error("Already in a party");
  }

  const partyId = createPartyId();
  const batch = writeBatch(db);

  batch.set(doc(db, "parties", partyId), {
    id: partyId,
    leaderUid: userId,
    leaderLineageId: lineage.id,
    memberUids: [userId],
    memberLineageIds: [lineage.id],
    memberProfiles: heir ? [buildMemberProfile(lineage, heir)] : [],
    memberLastSeenAtMs: { [userId]: Date.now() },
    createdAtMs: Date.now(),
    activeDungeon: null,
    activeMission: null,
    lastMissionOutcome: null,
  } satisfies Party);

  batch.update(doc(db, "lineages", lineage.id), {
    partyId,
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
  return { partyId };
}

export async function invitePlayerByHeirName(
  userId: string,
  lineage: Lineage,
  heir: Heir,
  toHeirName: string
): Promise<{ inviteId: string; partyId: string }> {
  if (lineage.ownerUid !== userId) {
    throw new Error("You do not own this lineage");
  }

  let partyId = lineage.partyId;
  if (!partyId) {
    const created = await createPartyClient(userId, lineage, heir);
    partyId = created.partyId;
  }

  const partySnap = await getDoc(doc(db, "parties", partyId));
  if (!partySnap.exists()) {
    throw new Error("Party not found");
  }

  const party = partySnap.data() as Party;
  if (party.leaderUid !== userId) {
    throw new Error("Only the party leader can invite");
  }
  if (party.memberUids.length >= MAX_PARTY_SIZE) {
    throw new Error("Party is full");
  }

  const target = await lookupHeirByName(toHeirName);
  if (target.ownerUid === userId) {
    throw new Error("Cannot invite yourself");
  }
  if (party.memberUids.includes(target.ownerUid)) {
    throw new Error("That player is already in your party");
  }
  if (target.partyId) {
    throw new Error("That player is already in another party");
  }

  const inviteId = createInviteId();
  const invite: PartyInvite = {
    id: inviteId,
    fromUid: userId,
    toUid: target.ownerUid,
    partyId,
    status: "pending",
    createdAtMs: Date.now(),
    fromHeirName: heir.name,
    fromFamilyName: lineage.familyName,
    toHeirName: target.heirName,
  };

  await setDoc(doc(db, "partyInvites", inviteId), invite);
  return { inviteId, partyId };
}

export async function acceptPartyInviteClient(
  userId: string,
  lineage: Lineage,
  inviteId: string,
  heir: Heir
): Promise<{ partyId: string }> {
  if (lineage.ownerUid !== userId) {
    throw new Error("You do not own this lineage");
  }
  if (lineage.partyId) {
    throw new Error("Already in a party");
  }

  const inviteRef = doc(db, "partyInvites", inviteId);
  const inviteSnap = await getDoc(inviteRef);
  if (!inviteSnap.exists()) {
    throw new Error("Invite not found");
  }

  const invite = inviteSnap.data() as PartyInvite;
  if (invite.toUid !== userId) {
    throw new Error("This invite is not for you");
  }
  if (invite.status !== "pending") {
    throw new Error("Invite is no longer valid");
  }

  const partyRef = doc(db, "parties", invite.partyId);
  const partySnap = await getDoc(partyRef);
  if (!partySnap.exists()) {
    throw new Error("Party no longer exists");
  }

  const party = partySnap.data() as Party;
  if (party.memberUids.length >= MAX_PARTY_SIZE) {
    throw new Error("Party is full");
  }

  const batch = writeBatch(db);
  batch.update(partyRef, {
    memberUids: [...party.memberUids, userId],
    memberLineageIds: [...party.memberLineageIds, lineage.id],
    memberProfiles: [...(party.memberProfiles ?? []), buildMemberProfile(lineage, heir)],
    memberLastSeenAtMs: {
      ...(party.memberLastSeenAtMs ?? {}),
      [userId]: Date.now(),
    },
  });
  batch.update(doc(db, "lineages", lineage.id), {
    partyId: invite.partyId,
    updatedAt: serverTimestamp(),
  });
  batch.update(inviteRef, { status: "accepted" });
  await batch.commit();

  return { partyId: invite.partyId };
}

export async function declinePartyInviteClient(
  userId: string,
  inviteId: string
): Promise<void> {
  const inviteRef = doc(db, "partyInvites", inviteId);
  const inviteSnap = await getDoc(inviteRef);
  if (!inviteSnap.exists()) return;

  const invite = inviteSnap.data() as PartyInvite;
  if (invite.toUid !== userId) {
    throw new Error("This invite is not for you");
  }
  if (invite.status !== "pending") return;

  await updateDoc(inviteRef, { status: "declined" });
}

export async function leavePartyClient(
  userId: string,
  lineage: Lineage
): Promise<void> {
  if (!lineage.partyId) {
    throw new Error("Not in a party");
  }

  const partyRef = doc(db, "parties", lineage.partyId);
  const partySnap = await getDoc(partyRef);
  const batch = writeBatch(db);

  if (!partySnap.exists()) {
    batch.update(doc(db, "lineages", lineage.id), {
      partyId: null,
      updatedAt: serverTimestamp(),
    });
    await batch.commit();
    return;
  }

  const party = partySnap.data() as Party;
  const memberUids = party.memberUids.filter((id) => id !== userId);
  const memberLineageIds = party.memberLineageIds.filter((id) => id !== lineage.id);
  const memberIndex = party.memberUids.indexOf(userId);
  const memberProfiles = (party.memberProfiles ?? []).filter((_, i) => i !== memberIndex);
  const memberLastSeenAtMs = { ...(party.memberLastSeenAtMs ?? {}) };
  delete memberLastSeenAtMs[userId];

  if (memberUids.length === 0) {
    batch.delete(partyRef);
  } else {
    const updates: Record<string, unknown> = {
      memberUids,
      memberLineageIds,
      memberProfiles,
      memberLastSeenAtMs,
    };
    if (party.leaderUid === userId) {
      updates.leaderUid = memberUids[0];
      updates.leaderLineageId = memberLineageIds[0];
      updates.activeDungeon = null;
      updates.activeMission = null;
      updates.lastMissionOutcome = null;
    }
    batch.update(partyRef, updates);
  }

  batch.update(doc(db, "lineages", lineage.id), {
    partyId: null,
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
}

export async function kickPartyMemberClient(
  userId: string,
  lineage: Lineage,
  targetUid: string
): Promise<{ kicked: boolean }> {
  if (!lineage.partyId) throw new Error("Not in a party");
  const partyRef = doc(db, "parties", lineage.partyId);
  const snapshot = await getDoc(partyRef);
  if (!snapshot.exists()) throw new Error("Party not found");

  const party = snapshot.data() as Party;
  if (party.leaderUid !== userId) throw new Error("Only the party leader can kick members");
  if (targetUid === userId) throw new Error("Use Leave Party to leave your own party");
  const index = party.memberUids.indexOf(targetUid);
  if (index < 0) throw new Error("Player is not in this party");

  const targetLineageId = party.memberLineageIds[index];
  const lastSeen = { ...(party.memberLastSeenAtMs ?? {}) };
  delete lastSeen[targetUid];
  const batch = writeBatch(db);
  batch.update(partyRef, {
    memberUids: party.memberUids.filter((_, i) => i !== index),
    memberLineageIds: party.memberLineageIds.filter((_, i) => i !== index),
    memberProfiles: (party.memberProfiles ?? []).filter((_, i) => i !== index),
    memberLastSeenAtMs: lastSeen,
  });
  if (targetLineageId) {
    batch.update(doc(db, "lineages", targetLineageId), { partyId: null });
  }
  await batch.commit();
  return { kicked: true };
}

export async function transferPartyLeadershipClient(
  userId: string,
  lineage: Lineage,
  targetUid: string
): Promise<{ transferred: boolean }> {
  if (!lineage.partyId) throw new Error("Not in a party");
  const partyRef = doc(db, "parties", lineage.partyId);
  const snapshot = await getDoc(partyRef);
  if (!snapshot.exists()) throw new Error("Party not found");

  const party = snapshot.data() as Party;
  if (party.leaderUid !== userId) throw new Error("Only the party leader can transfer leadership");
  const index = party.memberUids.indexOf(targetUid);
  if (index < 0) throw new Error("Player is not in this party");
  await updateDoc(partyRef, {
    leaderUid: targetUid,
    leaderLineageId: party.memberLineageIds[index],
  });
  return { transferred: true };
}
