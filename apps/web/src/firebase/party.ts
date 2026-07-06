import {
  acceptPartyInviteClient,
  createPartyClient,
  declinePartyInviteClient,
  invitePlayerByHeirName,
  leavePartyClient,
} from "./partyClient";
import { getFirebaseErrorMessage } from "@/lib/firebaseErrors";

export async function createPlayerParty(lineageId: string, lineage: import("@bloodline/shared/types").Lineage, userId: string) {
  return createPartyClient(userId, lineage);
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
  inviteId: string
) {
  return acceptPartyInviteClient(userId, lineage, inviteId);
}

export async function declinePlayerPartyInvite(userId: string, inviteId: string) {
  return declinePartyInviteClient(userId, inviteId);
}

export async function leavePlayerParty(userId: string, lineage: import("@bloodline/shared/types").Lineage) {
  return leavePartyClient(userId, lineage);
}

export function getPartyErrorMessage(error: unknown): string {
  return getFirebaseErrorMessage(error);
}
