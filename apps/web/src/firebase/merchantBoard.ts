import { doc, serverTimestamp, updateDoc, writeBatch } from "firebase/firestore";
import type { Heir, ItemInstance, Lineage, MerchantBoard } from "@bloodline/shared/types";
import {
  createMerchantBoard,
  merchantBoardNeedsReroll,
  rerollMerchantBoard,
} from "@/lib/merchant";
import { db } from "./config";

function parseMerchantBoard(data: Record<string, unknown> | undefined): MerchantBoard | null {
  if (!data) return null;
  return {
    slots: (data.slots as MerchantBoard["slots"]) ?? [],
    rolledAtMs: (data.rolledAtMs as number) ?? Date.now(),
    nextRerollAtMs: (data.nextRerollAtMs as number) ?? Date.now(),
  };
}

function ensureMerchantBoardOnLineage(lineage: Lineage): MerchantBoard {
  const lineageRef = doc(db, "lineages", lineage.id);
  const nowMs = Date.now();
  let board = parseMerchantBoard(lineage.merchantBoard as unknown as Record<string, unknown> | undefined);

  if (!board) {
    board = createMerchantBoard(lineage.id, nowMs);
    void updateDoc(lineageRef, { merchantBoard: board, updatedAt: serverTimestamp() })
      .catch((error) => console.error("Failed to save merchant board", error));
    return board;
  }

  if (merchantBoardNeedsReroll(board, nowMs)) {
    board = rerollMerchantBoard(lineage.id, board, nowMs);
    void updateDoc(lineageRef, { merchantBoard: board, updatedAt: serverTimestamp() })
      .catch((error) => console.error("Failed to save merchant reroll", error));
  }

  return board;
}

export function getPlayerMerchantBoard(lineage: Lineage) {
  return { board: ensureMerchantBoardOnLineage(lineage) };
}

export function purchasePlayerMerchantItem(
  lineage: Lineage,
  heir: Heir,
  board: MerchantBoard,
  slotIndex: number
) {
  const slot = board.slots.find((entry) => entry.slotIndex === slotIndex);
  if (!slot?.itemId || slot.price === null || slot.status !== "available") {
    throw new Error("That item is no longer available");
  }
  if (heir.gold < slot.price) throw new Error("Not enough gold");
  const instanceId = crypto.randomUUID().replace(/-/g, "");
  const instance: ItemInstance = { instanceId, itemId: slot.itemId, upgradeLevel: 0, itemLevel: 1 };
  const inventory = [...heir.inventory, slot.itemId];
  const itemInstances = { ...(heir.itemInstances ?? {}), [instanceId]: instance };
  const merchantBoard: MerchantBoard = {
    ...board,
    slots: board.slots.map((entry) => entry.slotIndex === slotIndex
      ? { slotIndex, itemId: null, price: null, status: "empty" }
      : entry),
  };
  const heirGoldAfter = heir.gold - slot.price;
  const batch = writeBatch(db);
  batch.update(doc(db, "lineages", lineage.id, "heirs", heir.id), { gold: heirGoldAfter, inventory, itemInstances });
  batch.update(doc(db, "lineages", lineage.id), { merchantBoard, updatedAt: serverTimestamp() });
  void batch.commit().catch((error) => console.error("Failed to save merchant purchase", error));
  return { itemId: slot.itemId, instanceId, price: slot.price, heirGoldAfter, inventory, merchantBoard };
}
