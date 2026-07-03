import {
  createParty,
  inviteToParty,
  acceptPartyInvite,
  leaveParty,
} from "./functions";
import { getFirebaseErrorMessage } from "@/lib/firebaseErrors";

export async function createPlayerParty(lineageId: string) {
  const response = await createParty({ lineageId });
  return response.data;
}

export async function invitePlayerToParty(lineageId: string, toUsername: string) {
  const response = await inviteToParty({ lineageId, toUsername });
  return response.data;
}

export async function acceptPlayerPartyInvite(lineageId: string, inviteId: string) {
  const response = await acceptPartyInvite({ lineageId, inviteId });
  return response.data;
}

export async function leavePlayerParty(lineageId: string) {
  const response = await leaveParty({ lineageId });
  return response.data;
}

export function getPartyErrorMessage(error: unknown): string {
  return getFirebaseErrorMessage(error);
}
