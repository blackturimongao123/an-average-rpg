import itemsData from "../../../game-data/items.json";
import {
  MERCHANT_RARITY_WEIGHTS,
  MERCHANT_REROLL_MS,
  MERCHANT_STOCK_SIZE,
} from "@bloodline/shared/constants";
import type { MerchantBoard, MerchantBoardSlot } from "../utils/types.js";
import type { ItemDefinition } from "./items.js";
import { generateSeed, seededRandomInt, weightedRandomChoice } from "./helpers.js";

const MERCHANT_ITEM_TYPES = new Set(["weapon", "armor", "accessory"]);

const merchantPool = (itemsData.items as ItemDefinition[]).filter(
  (item) =>
    MERCHANT_ITEM_TYPES.has(item.itemType) &&
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

export function getMerchantRerollBucket(nowMs: number = Date.now()): number {
  return Math.floor(nowMs / MERCHANT_REROLL_MS);
}

export function getNextMerchantRerollAtMs(bucket: number): number {
  return (bucket + 1) * MERCHANT_REROLL_MS;
}

export function merchantBoardNeedsReroll(board: MerchantBoard | null | undefined, nowMs: number = Date.now()): boolean {
  if (!board) return true;
  return nowMs >= board.nextRerollAtMs;
}

export function calculateMerchantPrice(item: ItemDefinition, seed: string, slotIndex: number): number {
  const base = item.value ?? 10;
  const multiplier = RARITY_PRICE_MULTIPLIER[item.rarity ?? "common"] ?? 1.5;
  const variance = 0.85 + seededRandomInt(seed, 0, 30, slotIndex + 50) / 100;
  return Math.max(1, Math.floor(base * multiplier * variance));
}

function rollMerchantSlot(
  lineageId: string,
  bucket: number,
  slotIndex: number,
  excludeItemIds: string[]
): MerchantBoardSlot {
  const seed = generateSeed(lineageId, "merchant", `${bucket}-slot-${slotIndex}`);

  const rarityWeighted = Object.entries(MERCHANT_RARITY_WEIGHTS).map(([rarity, weight]) => ({
    item: rarity,
    weight: Number(weight),
  }));
  const rarity = weightedRandomChoice(seed, rarityWeighted, slotIndex);
  if (!rarity) {
    return { slotIndex, itemId: null, price: null, status: "empty" };
  }

  const candidates = merchantPool.filter(
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
    if (slot.itemId) {
      usedItemIds.push(slot.itemId);
    }
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
    if (slot.status !== "available" && slot.status !== "empty") {
      return slot;
    }
    const rolled = rollMerchantSlot(lineageId, bucket, slotIndex, usedItemIds);
    if (rolled.itemId) {
      usedItemIds.push(rolled.itemId);
    }
    return rolled;
  });

  while (slots.length < MERCHANT_STOCK_SIZE) {
    const slotIndex = slots.length;
    const rolled = rollMerchantSlot(lineageId, bucket, slotIndex, usedItemIds);
    slots.push(rolled);
    if (rolled.itemId) {
      usedItemIds.push(rolled.itemId);
    }
  }

  return {
    slots,
    rolledAtMs: nowMs,
    nextRerollAtMs: getNextMerchantRerollAtMs(bucket),
  };
}

export function ensureMerchantBoard(
  lineageId: string,
  board: MerchantBoard | null | undefined,
  nowMs: number = Date.now()
): MerchantBoard {
  if (!board) {
    return createMerchantBoard(lineageId, nowMs);
  }
  if (merchantBoardNeedsReroll(board, nowMs)) {
    return rerollMerchantBoard(lineageId, board, nowMs);
  }
  return board;
}
