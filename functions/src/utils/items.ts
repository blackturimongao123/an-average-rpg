import itemsData from "../../../game-data/items.json";

export interface ItemDefinition {
  id: string;
  name: string;
  itemType: string;
  rarity?: string;
  value?: number;
  maxItemLevel?: number;
  hands?: "one" | "two";
  weaponCategory?: string;
  allowedSlots?: ("main" | "secondary")[];
  equipSlot?: string;
  classTags?: string[];
}

const itemsMap = new Map(
  (itemsData.items as ItemDefinition[]).map((item) => [item.id, item])
);

export function getItemDefinition(itemId: string): ItemDefinition | undefined {
  return itemsMap.get(itemId);
}

export function resolveItemSlots(item: ItemDefinition): ("main" | "secondary")[] {
  if (item.allowedSlots?.length) {
    return item.allowedSlots;
  }
  if (item.hands === "two") {
    return ["main", "secondary"];
  }
  if (item.equipSlot === "armor") return [];
  if (item.equipSlot === "accessory") return [];
  return ["main"];
}

export function isTwoHanded(item: ItemDefinition): boolean {
  return item.hands === "two" || resolveItemSlots(item).length >= 2;
}

export function canEquipInSlot(
  item: ItemDefinition,
  slot: "main" | "secondary" | "armor" | "accessory"
): boolean {
  if (slot === "armor") return item.itemType === "armor" || item.equipSlot === "armor";
  if (slot === "accessory") {
    return item.itemType === "accessory" || item.equipSlot === "accessory";
  }
  if (item.itemType !== "weapon" && item.equipSlot !== "weapon") {
    return false;
  }
  const slots = resolveItemSlots(item);
  return slots.includes(slot);
}

export function meetsClassRequirement(item: ItemDefinition, classId: string): boolean {
  if (!item.classTags?.length) return true;
  return item.classTags.includes(classId);
}
