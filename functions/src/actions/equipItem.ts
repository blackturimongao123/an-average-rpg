import { onCall, HttpsError } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "../index.js";
import type { Heir, Lineage } from "../utils/types.js";
import {
  canEquipInSlot,
  getItemDefinition,
  isTwoHanded,
  meetsClassRequirement,
} from "../utils/items.js";

type EquipSlot = "main" | "secondary" | "armor" | "accessory";

interface EquipmentState {
  mainWeapon: string | null;
  secondaryWeapon: string | null;
  armor: string | null;
  accessory: string | null;
}

function migrateEquipment(raw: Record<string, unknown>): EquipmentState {
  return {
    mainWeapon: (raw.mainWeapon as string | null) ?? (raw.weapon as string | null) ?? null,
    secondaryWeapon: (raw.secondaryWeapon as string | null) ?? null,
    armor: (raw.armor as string | null) ?? null,
    accessory: (raw.accessory as string | null) ?? null,
  };
}

function removeFromInventory(inventory: string[], itemId: string): string[] {
  const index = inventory.indexOf(itemId);
  if (index === -1) return inventory;
  const next = [...inventory];
  next.splice(index, 1);
  return next;
}

function addToInventory(inventory: string[], itemId: string): string[] {
  return [...inventory, itemId];
}

interface EquipItemRequest {
  lineageId: string;
  heirId: string;
  itemId: string;
  slot: EquipSlot;
}

interface EquipItemResponse {
  equipment: EquipmentState;
  inventory: string[];
}

export const equipItem = onCall<EquipItemRequest>(
  { cors: true },
  async (request): Promise<EquipItemResponse> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be signed in");
    }

    const { lineageId, heirId, itemId, slot } = request.data;
    if (!lineageId || !heirId || !itemId || !slot) {
      throw new HttpsError("invalid-argument", "Missing required fields");
    }

    const item = getItemDefinition(itemId);
    if (!item) {
      throw new HttpsError("invalid-argument", "Item not found");
    }

    if (!canEquipInSlot(item, slot)) {
      throw new HttpsError("failed-precondition", "Item cannot be equipped in that slot");
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
    if (!meetsClassRequirement(item, heir.classId)) {
      throw new HttpsError("failed-precondition", "This item is bound to another class");
    }
    if (!heir.inventory.includes(itemId)) {
      throw new HttpsError("failed-precondition", "Item not in inventory");
    }

    let equipment = migrateEquipment(heir.equipment as unknown as Record<string, unknown>);
    let inventory = [...heir.inventory];

    const slotKey =
      slot === "main"
        ? "mainWeapon"
        : slot === "secondary"
          ? "secondaryWeapon"
          : slot;

    const currentlyEquipped = equipment[slotKey as keyof EquipmentState];
    if (currentlyEquipped) {
      inventory = addToInventory(inventory, currentlyEquipped);
    }

    if (slot === "main" && isTwoHanded(item)) {
      if (equipment.secondaryWeapon && equipment.secondaryWeapon !== currentlyEquipped) {
        inventory = addToInventory(inventory, equipment.secondaryWeapon);
      }
      equipment.secondaryWeapon = itemId;
      equipment.mainWeapon = itemId;
    } else if (slot === "main" && equipment.mainWeapon && isTwoHanded(getItemDefinition(equipment.mainWeapon)!)) {
      equipment.mainWeapon = itemId;
      equipment.secondaryWeapon = null;
    } else if (slot === "secondary" && equipment.mainWeapon && isTwoHanded(getItemDefinition(equipment.mainWeapon)!)) {
      equipment.mainWeapon = null;
      equipment.secondaryWeapon = itemId;
    } else {
      equipment[slotKey as keyof EquipmentState] = itemId;
    }

    inventory = removeFromInventory(inventory, itemId);

    if (slot === "main" && !isTwoHanded(item) && equipment.mainWeapon === itemId) {
      // one-handed main — keep secondary unless it was same two-hand item
      if (equipment.secondaryWeapon === itemId) {
        equipment.secondaryWeapon = null;
      }
    }

    await heirRef.update({
      equipment,
      inventory,
    });
    await lineageRef.update({ updatedAt: FieldValue.serverTimestamp() });

    return { equipment, inventory };
  }
);

interface UnequipItemRequest {
  lineageId: string;
  heirId: string;
  slot: EquipSlot;
}

export const unequipItem = onCall<UnequipItemRequest>(
  { cors: true },
  async (request): Promise<EquipItemResponse> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be signed in");
    }

    const { lineageId, heirId, slot } = request.data;
    if (!lineageId || !heirId || !slot) {
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

    let equipment = migrateEquipment(heir.equipment as unknown as Record<string, unknown>);
    let inventory = [...heir.inventory];

    const slotKey =
      slot === "main"
        ? "mainWeapon"
        : slot === "secondary"
          ? "secondaryWeapon"
          : slot;

    const equippedId = equipment[slotKey as keyof EquipmentState];
    if (!equippedId) {
      throw new HttpsError("failed-precondition", "Slot is empty");
    }

    inventory = addToInventory(inventory, equippedId);
    equipment[slotKey as keyof EquipmentState] = null;

    if (slot === "main" && equipment.secondaryWeapon === equippedId) {
      equipment.secondaryWeapon = null;
    }
    if (slot === "secondary" && equipment.mainWeapon === equippedId) {
      equipment.mainWeapon = null;
    }

    await heirRef.update({ equipment, inventory });
    await lineageRef.update({ updatedAt: FieldValue.serverTimestamp() });

    return { equipment, inventory };
  }
);
