import {
  acceptPartyInviteClient,
  createPartyClient,
  declinePartyInviteClient,
  invitePlayerByHeirName,
  kickPartyMemberClient,
  leavePartyClient,
  transferPartyLeadershipClient,
} from "./partyClient";
import { heartbeatParty } from "./functions";
import { getFirebaseErrorMessage } from "@/lib/firebaseErrors";

export async function createPlayerParty(
  lineageId: string,
  lineage: import("@bloodline/shared/types").Lineage,
  userId: string,
  heir?: import("@bloodline/shared/types").Heir
) {
  return createPartyClient(userId, lineage, heir);
}

export async function invitePlayerToParty(
  lineage: import("@bloodline/shared/types").Lineage,
  heir: import("@bloodline/shared/types").Heir,
  userId: string,
  toHeirName: string
) {
  return invitePlayerByHeirName(userId, lineage, heir, toHeirName);
}

export async function acceptPlayerPartyInvite(
  userId: string,
  lineage: import("@bloodline/shared/types").Lineage,
  inviteId: string,
  heir: import("@bloodline/shared/types").Heir
) {
  return acceptPartyInviteClient(userId, lineage, inviteId, heir);
}

export async function declinePlayerPartyInvite(userId: string, inviteId: string) {
  return declinePartyInviteClient(userId, inviteId);
}

export async function leavePlayerParty(userId: string, lineage: import("@bloodline/shared/types").Lineage) {
  return leavePartyClient(userId, lineage);
}

export function kickPlayerFromParty(
  userId: string,
  lineage: import("@bloodline/shared/types").Lineage,
  targetUid: string
) {
  return kickPartyMemberClient(userId, lineage, targetUid);
}

export function makePlayerPartyLeader(
  userId: string,
  lineage: import("@bloodline/shared/types").Lineage,
  targetUid: string
) {
  return transferPartyLeadershipClient(userId, lineage, targetUid);
}

export async function sendPartyHeartbeat(lineageId: string) {
  const response = await heartbeatParty({ lineageId });
  return response.data;
}

export function getPartyErrorMessage(error: unknown): string {
  return getFirebaseErrorMessage(error);
}
