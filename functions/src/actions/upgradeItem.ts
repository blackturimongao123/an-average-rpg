import { onCall, HttpsError } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import { MAX_ITEM_LEVEL } from "@bloodline/shared/constants";
import { db } from "../index.js";
import { generateId } from "../utils/helpers.js";
import { getItemDefinition } from "../utils/items.js";
import type { Heir, ItemInstance, Lineage } from "../utils/types.js";

interface UpgradeItemRequest {
  lineageId: string;
  heirId: string;
  instanceId?: string;
  itemId?: string;
}

interface UpgradeItemResponse {
  instanceId: string;
  itemId: string;
  upgradeLevel: number;
  itemLevel: number;
  goldSpent: number;
  heirGoldAfter: number;
}

function getMaxUpgradeLevel(rarity: string, heirLevel: number, maxItemLevel?: number): number {
  switch (rarity) {
    case "common":
    case "uncommon":
      return heirLevel;
    case "epic":
      return heirLevel + 5;
    case "legendary":
      return heirLevel + 10;
    case "mythic":
    case "unique":
      return maxItemLevel ?? MAX_ITEM_LEVEL;
    default:
      return heirLevel;
  }
}

function calculateUpgradeCost(baseValue: number, upgradeLevel: number): number {
  return Math.max(1, Math.floor(baseValue * (upgradeLevel + 1) * 0.75));
}

function itemOwnedByHeir(heir: Heir, itemId: string): boolean {
  if (heir.inventory.includes(itemId)) return true;
  const eq = heir.equipment;
  return (
    eq.mainWeapon === itemId ||
    eq.secondaryWeapon === itemId ||
    eq.armor === itemId ||
    eq.accessory === itemId
  );
}

function findInstanceForItem(
  instances: Record<string, ItemInstance>,
  itemId: string
): { instanceId: string; instance: ItemInstance } | null {
  for (const [instanceId, instance] of Object.entries(instances)) {
    if (instance.itemId === itemId) {
      return { instanceId, instance };
    }
  }
  return null;
}

export const upgradeItem = onCall<UpgradeItemRequest>(
  { cors: true },
  async (request): Promise<UpgradeItemResponse> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be signed in");
    }

    const { lineageId, heirId, instanceId, itemId } = request.data;
    if (!lineageId || !heirId || (!instanceId && !itemId)) {
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

    const instances: Record<string, ItemInstance> = { ...(heir.itemInstances ?? {}) };

    let resolvedInstanceId = instanceId;
    let instance: ItemInstance | undefined;

    if (resolvedInstanceId) {
      instance = instances[resolvedInstanceId];
      if (!instance) {
        throw new HttpsError("not-found", "Item instance not found");
      }
    } else if (itemId) {
      if (!itemOwnedByHeir(heir, itemId)) {
        throw new HttpsError("failed-precondition", "Item not owned by heir");
      }
      const existing = findInstanceForItem(instances, itemId);
      if (existing) {
        resolvedInstanceId = existing.instanceId;
        instance = existing.instance;
      } else {
        resolvedInstanceId = generateId();
        instance = {
          instanceId: resolvedInstanceId,
          itemId,
          upgradeLevel: 0,
          itemLevel: 1,
        };
        instances[resolvedInstanceId] = instance;
      }
    }

    if (!instance || !resolvedInstanceId) {
      throw new HttpsError("invalid-argument", "Could not resolve item instance");
    }

    const itemDef = getItemDefinition(instance.itemId);
    if (!itemDef) {
      throw new HttpsError("invalid-argument", "Item not found");
    }

    const maxUpgrade = getMaxUpgradeLevel(
      itemDef.rarity ?? "common",
      heir.level,
      itemDef.maxItemLevel
    );

    if (instance.upgradeLevel >= maxUpgrade) {
      throw new HttpsError("failed-precondition", "Item has reached its upgrade cap for your level");
    }

    const cost = calculateUpgradeCost(itemDef.value ?? 10, instance.upgradeLevel);
    if (heir.gold < cost) {
      throw new HttpsError("failed-precondition", "Not enough gold");
    }

    const updatedInstance: ItemInstance = {
      ...instance,
      upgradeLevel: instance.upgradeLevel + 1,
      itemLevel: Math.min(maxUpgrade, instance.itemLevel + 1),
    };
    instances[resolvedInstanceId] = updatedInstance;

    const heirGoldAfter = heir.gold - cost;

    await heirRef.update({
      gold: heirGoldAfter,
      itemInstances: instances,
    });
    await lineageRef.update({ updatedAt: FieldValue.serverTimestamp() });

    return {
      instanceId: resolvedInstanceId,
      itemId: updatedInstance.itemId,
      upgradeLevel: updatedInstance.upgradeLevel,
      itemLevel: updatedInstance.itemLevel,
      goldSpent: cost,
      heirGoldAfter,
    };
  }
);
