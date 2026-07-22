import {
  acceptPartyInviteClient,
  createPartyClient,
  declinePartyInviteClient,
  invitePlayerByHeirName,
  leavePartyClient,
} from "./partyClient";
import { heartbeatParty, kickPartyMember, transferPartyLeadership } from "./functions";
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

export async function kickPlayerFromParty(lineageId: string, targetUid: string) {
  const response = await kickPartyMember({ lineageId, targetUid });
  return response.data;
}

export async function makePlayerPartyLeader(lineageId: string, targetUid: string) {
  const response = await transferPartyLeadership({ lineageId, targetUid });
  return response.data;
}

export async function sendPartyHeartbeat(lineageId: string) {
  const response = await heartbeatParty({ lineageId });
  return response.data;
}

export function getPartyErrorMessage(error: unknown): string {
  return getFirebaseErrorMessage(error);
}
