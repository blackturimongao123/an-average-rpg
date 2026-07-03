import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import type { MerchantBoard } from "@bloodline/shared/types";
import {
  createMerchantBoard,
  merchantBoardNeedsReroll,
  rerollMerchantBoard,
} from "@/lib/merchant";
import { purchaseMerchantItem } from "./functions";
import { getFirebaseErrorMessage, isFunctionsUnavailable } from "@/lib/firebaseErrors";
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
    if (!isFunctionsUnavailable(error)) {
      throw new Error(getFirebaseErrorMessage(error));
    }
  }

  const lineageRef = doc(db, "lineages", lineageId);
  const heirRef = doc(db, "lineages", lineageId, "heirs", heirId);

  const [lineageDoc, heirDoc] = await Promise.all([getDoc(lineageRef), getDoc(heirRef)]);
  if (!lineageDoc.exists() || !heirDoc.exists()) {
    throw new Error("Lineage or heir not found");
  }

  const lineage = lineageDoc.data();
  const heir = heirDoc.data();

  if (lineage.ownerUid !== userId) {
    throw new Error("You do not own this lineage");
  }
  if (heir.status !== "alive") {
    throw new Error("Heir is not alive");
  }

  const board = await ensureMerchantBoardOnLineage(userId, lineageId);
  const slot = board.slots.find((entry) => entry.slotIndex === slotIndex);

  if (!slot || slot.status !== "available" || !slot.itemId || slot.price === null) {
    throw new Error("That item is no longer available");
  }
  if ((heir.gold ?? 0) < slot.price) {
    throw new Error("Not enough gold");
  }

  const updatedSlots = board.slots.map((entry) =>
    entry.slotIndex === slotIndex
      ? { slotIndex, itemId: null, price: null, status: "empty" as const }
      : entry
  );
  const merchantBoard = { ...board, slots: updatedSlots };
  const inventory = [...(heir.inventory ?? []), slot.itemId];
  const heirGoldAfter = (heir.gold ?? 0) - slot.price;

  await updateDoc(heirRef, {
    gold: heirGoldAfter,
    inventory,
  });
  await updateDoc(lineageRef, {
    merchantBoard,
    updatedAt: serverTimestamp(),
  });

  return {
    itemId: slot.itemId,
    instanceId: "",
    price: slot.price,
    heirGoldAfter,
    inventory,
    merchantBoard,
  };
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
