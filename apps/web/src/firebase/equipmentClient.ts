import { doc, updateDoc } from "firebase/firestore";
import { migrateEquipment } from "@bloodline/shared/equipment";
import type { Equipment, Heir } from "@bloodline/shared/types";
import { getItemById, isTwoHandedItem } from "@/lib/items";
import { db } from "./config";

type SlotKey = "main" | "secondary" | "armor" | "accessory";

function save(lineageId: string, heirId: string, equipment: Equipment, inventory: string[]) {
  void updateDoc(doc(db, "lineages", lineageId, "heirs", heirId), { equipment, inventory })
    .catch((error) => console.error("Failed to save equipment", error));
}

function equipmentKey(slot: SlotKey): keyof Equipment {
  return slot === "main" ? "mainWeapon" : slot === "secondary" ? "secondaryWeapon" : slot;
}

export function equipItemLocally(lineageId: string, heir: Heir, itemId: string, slot: SlotKey) {
  const item = getItemById(itemId);
  if (!item) throw new Error("Item not found");
  if (!heir.inventory.includes(itemId)) throw new Error("Item not in inventory");
  if (item.classTags?.length && !item.classTags.includes(heir.classId)) {
    throw new Error("This item is bound to another class");
  }
  if ((slot === "main" || slot === "secondary") && item.itemType !== "weapon") {
    throw new Error("Item cannot be equipped in that slot");
  }
  if ((slot === "armor" || slot === "accessory") && item.equipSlot !== slot) {
    throw new Error("Item cannot be equipped in that slot");
  }

  const equipment = migrateEquipment(heir.equipment as Equipment & { weapon?: string | null });
  const inventory = [...heir.inventory];
  const key = equipmentKey(slot);
  const current = equipment[key];
  if (current) inventory.push(current);

  if (slot === "main" && isTwoHandedItem(itemId)) {
    if (equipment.secondaryWeapon && equipment.secondaryWeapon !== current) inventory.push(equipment.secondaryWeapon);
    equipment.mainWeapon = itemId;
    equipment.secondaryWeapon = itemId;
  } else if (slot === "secondary" && isTwoHandedItem(equipment.mainWeapon)) {
    equipment.mainWeapon = null;
    equipment.secondaryWeapon = itemId;
  } else {
    equipment[key] = itemId;
    if (slot === "main" && equipment.secondaryWeapon === itemId) equipment.secondaryWeapon = null;
  }

  inventory.splice(inventory.indexOf(itemId), 1);
  save(lineageId, heir.id, equipment, inventory);
  return { equipment, inventory };
}

export function unequipItemLocally(lineageId: string, heir: Heir, slot: SlotKey) {
  const equipment = migrateEquipment(heir.equipment as Equipment & { weapon?: string | null });
  const inventory = [...heir.inventory];
  const key = equipmentKey(slot);
  const itemId = equipment[key];
  if (!itemId) throw new Error("Slot is empty");
  inventory.push(itemId);
  equipment[key] = null;
  if (slot === "main" && equipment.secondaryWeapon === itemId) equipment.secondaryWeapon = null;
  if (slot === "secondary" && equipment.mainWeapon === itemId) equipment.mainWeapon = null;
  save(lineageId, heir.id, equipment, inventory);
  return { equipment, inventory };
}
