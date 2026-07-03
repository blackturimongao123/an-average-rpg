import type { ItemData, MerchantBoard, MerchantBoardSlot } from "@bloodline/shared/types";
import {
  MERCHANT_RARITY_WEIGHTS,
  MERCHANT_REROLL_MS,
  MERCHANT_STOCK_SIZE,
} from "@bloodline/shared/constants";
import itemsData from "@game-data/items.json";

export const MERCHANT_ITEMS = (itemsData.items as ItemData[]).filter(
  (item) =>
    ["weapon", "armor", "accessory"].includes(item.itemType) &&
    item.rarity &&
    MERCHANT_RARITY_WEIGHTS[item.rarity] !== undefined
);

const RARITY_PRICE_MULTIPLIER: Record<string, number> = {
  common: 1,
  uncommon: 1.25,
  rare: 1.6,
  epic: 2.2,
  legendary: 3.5,
};

function seededRandom(seed: string, index: number = 0): number {
  let hash = 0;
  const input = `${seed}-${index}`;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 10000) / 10000;
}

function seededRandomInt(seed: string, min: number, max: number, index: number = 0): number {
  const rand = seededRandom(seed, index);
  return Math.floor(rand * (max - min + 1)) + min;
}

function weightedRandomChoice<T>(
  seed: string,
  items: Array<{ item: T; weight: number }>,
  index: number = 0
): T | null {
  if (items.length === 0) return null;
  const totalWeight = items.reduce((sum, entry) => sum + entry.weight, 0);
  if (totalWeight <= 0) return null;

  const roll = seededRandom(seed, index) * totalWeight;
  let cumulative = 0;
  for (const entry of items) {
    cumulative += entry.weight;
    if (roll < cumulative) return entry.item;
  }
  return items[items.length - 1].item;
}

export function getMerchantRerollBucket(nowMs: number = Date.now()): number {
  return Math.floor(nowMs / MERCHANT_REROLL_MS);
}

export function getNextMerchantRerollAtMs(bucket: number): number {
  return (bucket + 1) * MERCHANT_REROLL_MS;
}

export function getMerchantRerollCountdownMs(nextRerollAtMs: number, nowMs: number = Date.now()): number {
  return Math.max(0, nextRerollAtMs - nowMs);
}

export function calculateMerchantPrice(item: ItemData, seed: string, slotIndex: number): number {
  const base = item.value ?? 10;
  const multiplier = RARITY_PRICE_MULTIPLIER[item.rarity] ?? 1.5;
  const variance = 0.85 + seededRandomInt(seed, 0, 30, slotIndex + 50) / 100;
  return Math.max(1, Math.floor(base * multiplier * variance));
}

function rollMerchantSlot(
  lineageId: string,
  bucket: number,
  slotIndex: number,
  excludeItemIds: string[]
): MerchantBoardSlot {
  const seed = `${lineageId}-merchant-${bucket}-slot-${slotIndex}`;

  const rarityWeighted = Object.entries(MERCHANT_RARITY_WEIGHTS).map(([rarity, weight]) => ({
    item: rarity,
    weight,
  }));
  const rarity = weightedRandomChoice(seed, rarityWeighted, slotIndex);
  if (!rarity) {
    return { slotIndex, itemId: null, price: null, status: "empty" };
  }

  const candidates = MERCHANT_ITEMS.filter(
    (item) => item.rarity === rarity && !excludeItemIds.includes(item.id)
  );
  if (candidates.length === 0) {
    return { slotIndex, itemId: null, price: null, status: "empty" };
  }

  const itemIndex = seededRandomInt(seed, 0, candidates.length - 1, slotIndex + 10);
  const item = candidates[itemIndex];
  const price = calculateMerchantPrice(item, seed, slotIndex);

  return {
    slotIndex,
    itemId: item.id,
    price,
    status: "available",
  };
}

export function createMerchantBoard(lineageId: string, nowMs: number = Date.now()): MerchantBoard {
  const bucket = getMerchantRerollBucket(nowMs);
  const slots: MerchantBoardSlot[] = [];
  const usedItemIds: string[] = [];

  for (let slotIndex = 0; slotIndex < MERCHANT_STOCK_SIZE; slotIndex += 1) {
    const slot = rollMerchantSlot(lineageId, bucket, slotIndex, usedItemIds);
    slots.push(slot);
    if (slot.itemId) usedItemIds.push(slot.itemId);
  }

  return {
    slots,
    rolledAtMs: nowMs,
    nextRerollAtMs: getNextMerchantRerollAtMs(bucket),
  };
}

export function rerollMerchantBoard(
  lineageId: string,
  existing: MerchantBoard,
  nowMs: number = Date.now()
): MerchantBoard {
  const bucket = getMerchantRerollBucket(nowMs);
  const usedItemIds: string[] = [];
  const slots = existing.slots.map((slot, slotIndex) => {
    if (slot.status !== "available" && slot.status !== "empty") return slot;
    const rolled = rollMerchantSlot(lineageId, bucket, slotIndex, usedItemIds);
    if (rolled.itemId) usedItemIds.push(rolled.itemId);
    return rolled;
  });

  while (slots.length < MERCHANT_STOCK_SIZE) {
    const slotIndex = slots.length;
    const rolled = rollMerchantSlot(lineageId, bucket, slotIndex, usedItemIds);
    slots.push(rolled);
    if (rolled.itemId) usedItemIds.push(rolled.itemId);
  }

  return {
    slots,
    rolledAtMs: nowMs,
    nextRerollAtMs: getNextMerchantRerollAtMs(bucket),
  };
}

export function merchantBoardNeedsReroll(board: MerchantBoard | null | undefined, nowMs: number = Date.now()): boolean {
  if (!board) return true;
  return nowMs >= board.nextRerollAtMs;
}

export function formatMerchantCountdown(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
