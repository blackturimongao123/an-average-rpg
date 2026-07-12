import { onCall, HttpsError } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "../index.js";
import { generateId } from "../utils/helpers.js";
import { getItemDefinition } from "../utils/items.js";
import { ensureMerchantBoard } from "../utils/merchant.js";
import type { Heir, ItemInstance, Lineage, MerchantBoard } from "../utils/types.js";

interface PurchaseMerchantItemRequest {
  lineageId: string;
  heirId: string;
  slotIndex: number;
}

interface PurchaseMerchantItemResponse {
  itemId: string;
  instanceId: string;
  price: number;
  heirGoldAfter: number;
  inventory: string[];
  merchantBoard: MerchantBoard;
}

export const purchaseMerchantItem = onCall<PurchaseMerchantItemRequest>(
  { cors: true },
  async (request): Promise<PurchaseMerchantItemResponse> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be signed in");
    }

    const { lineageId, heirId, slotIndex } = request.data;
    if (!lineageId || !heirId || slotIndex === undefined) {
      throw new HttpsError("invalid-argument", "Missing required fields");
    }

    const uid = request.auth.uid;
    const lineageRef = db.collection("lineages").doc(lineageId);
    const heirRef = lineageRef.collection("heirs").doc(heirId);

    const [lineageDoc, heirDoc] = await Promise.all([lineageRef.get(), heirRef.get()]);
    if (!lineageDoc.exists || !heirDoc.exists) {
      throw new HttpsError("not-found", "Lineage or heir not found");
    }

    const lineage = lineageDoc.data() as Lineage;
    const heir = heirDoc.data() as Heir;

    if (lineage.ownerUid !== uid) {
      throw new HttpsError("permission-denied", "You do not own this lineage");
    }
    if (heir.status !== "alive") {
      throw new HttpsError("failed-precondition", "Heir is not alive");
    }

    const nowMs = Date.now();
    let merchantBoard = ensureMerchantBoard(lineageId, lineage.merchantBoard, nowMs);
    const slot = merchantBoard.slots.find((entry) => entry.slotIndex === slotIndex);

    if (
      !slot ||
      slot.status !== "available" ||
      !slot.itemId ||
      slot.price === null ||
      !Number.isFinite(slot.price) ||
      slot.price < 0
    ) {
      throw new HttpsError("failed-precondition", "That item is no longer available");
    }

    const itemDef = getItemDefinition(slot.itemId);
    if (!itemDef) {
      throw new HttpsError("internal", "Item data not found");
    }

    if (heir.gold < slot.price) {
      throw new HttpsError("failed-precondition", "Not enough gold");
    }

    const instanceId = generateId();
    const instance: ItemInstance = {
      instanceId,
      itemId: slot.itemId,
      upgradeLevel: 0,
      itemLevel: 1,
    };

    const inventory = [...heir.inventory, slot.itemId];
    const itemInstances: Record<string, ItemInstance> = {
      ...(heir.itemInstances ?? {}),
      [instanceId]: instance,
    };

    const updatedSlots = merchantBoard.slots.map((entry) =>
      entry.slotIndex === slotIndex
        ? { slotIndex, itemId: null, price: null, status: "empty" as const }
        : entry
    );
    merchantBoard = { ...merchantBoard, slots: updatedSlots };

    const heirGoldAfter = heir.gold - slot.price;

    const batch = db.batch();
    batch.update(heirRef, {
      gold: heirGoldAfter,
      inventory,
      itemInstances,
    });
    batch.update(lineageRef, {
      merchantBoard,
      updatedAt: FieldValue.serverTimestamp(),
    });
    await batch.commit();

    return {
      itemId: slot.itemId,
      instanceId,
      price: slot.price,
      heirGoldAfter,
      inventory,
      merchantBoard,
    };
  }
);
