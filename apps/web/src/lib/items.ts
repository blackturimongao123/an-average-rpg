import type { ItemData } from "@bloodline/shared/types";
import itemsData from "@game-data/items.json";

export const ALL_ITEMS = itemsData.items as ItemData[];

const itemsMap = new Map(ALL_ITEMS.map((item) => [item.id, item]));

export function getItemById(itemId: string): ItemData | undefined {
  return itemsMap.get(itemId);
}

export function getItemName(itemId: string | null | undefined): string {
  if (!itemId) return "Empty";
  return getItemById(itemId)?.name ?? itemId.split("_").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}

export function isTwoHandedItem(itemId: string | null | undefined): boolean {
  if (!itemId) return false;
  const item = getItemById(itemId);
  return item?.hands === "two" || (item?.allowedSlots?.length ?? 0) >= 2;
}
