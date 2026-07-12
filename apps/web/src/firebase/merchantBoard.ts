import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import type { MerchantBoard } from "@bloodline/shared/types";
import {
  createMerchantBoard,
  merchantBoardNeedsReroll,
  rerollMerchantBoard,
} from "@/lib/merchant";
import { purchaseMerchantItem } from "./functions";
import { getFirebaseErrorMessage } from "@/lib/firebaseErrors";
import { db } from "./config";

function parseMerchantBoard(data: Record<string, unknown> | undefined): MerchantBoard | null {
  if (!data) return null;
  return {
    slots: (data.slots as MerchantBoard["slots"]) ?? [],
    rolledAtMs: (data.rolledAtMs as number) ?? Date.now(),
    nextRerollAtMs: (data.nextRerollAtMs as number) ?? Date.now(),
  };
}

async function ensureMerchantBoardOnLineage(
  userId: string,
  lineageId: string
): Promise<MerchantBoard> {
  const lineageRef = doc(db, "lineages", lineageId);
  const lineageDoc = await getDoc(lineageRef);

  if (!lineageDoc.exists()) {
    throw new Error("Lineage not found");
  }

  const lineage = lineageDoc.data();
  if (lineage.ownerUid !== userId) {
    throw new Error("You do not own this lineage");
  }

  const nowMs = Date.now();
  let board = parseMerchantBoard(lineage.merchantBoard as Record<string, unknown> | undefined);

  if (!board) {
    board = createMerchantBoard(lineageId, nowMs);
    await updateDoc(lineageRef, { merchantBoard: board, updatedAt: serverTimestamp() });
    return board;
  }

  if (merchantBoardNeedsReroll(board, nowMs)) {
    board = rerollMerchantBoard(lineageId, board, nowMs);
    await updateDoc(lineageRef, { merchantBoard: board, updatedAt: serverTimestamp() });
  }

  return board;
}

export async function bootstrapGetMerchantBoard(userId: string, lineageId: string) {
  const board = await ensureMerchantBoardOnLineage(userId, lineageId);
  return { board };
}

export async function bootstrapPurchaseMerchantItem(
  userId: string,
  lineageId: string,
  heirId: string,
  slotIndex: number
) {
  try {
    const response = await purchaseMerchantItem({ lineageId, heirId, slotIndex });
    return response.data;
  } catch (error) {
    throw new Error(getFirebaseErrorMessage(error));
  }
}

export async function getPlayerMerchantBoard(userId: string, lineageId: string) {
  return bootstrapGetMerchantBoard(userId, lineageId);
}

export async function purchasePlayerMerchantItem(
  userId: string,
  lineageId: string,
  heirId: string,
  slotIndex: number
) {
  return bootstrapPurchaseMerchantItem(userId, lineageId, heirId, slotIndex);
}
