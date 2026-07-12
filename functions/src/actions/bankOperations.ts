import { onCall, HttpsError } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "../index.js";
import { generateId } from "../utils/helpers.js";
import type { Heir, Lineage, BankItem } from "../utils/types.js";

interface DepositGoldRequest {
  lineageId: string;
  heirId: string;
  amount: number;
}

interface DepositGoldResponse {
  deposited: number;
  heirGoldAfter: number;
  bankGoldAfter: number;
}

export const depositGold = onCall<DepositGoldRequest>(
  { cors: true },
  async (request): Promise<DepositGoldResponse> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be signed in");
    }

    const { lineageId, heirId, amount } = request.data;

    if (!lineageId || !heirId || amount === undefined) {
      throw new HttpsError("invalid-argument", "Missing required fields");
    }

    if (amount <= 0 || !Number.isInteger(amount)) {
      throw new HttpsError("invalid-argument", "Amount must be a positive integer");
    }

    const uid = request.auth.uid;

    const lineageRef = db.collection("lineages").doc(lineageId);
    const heirRef = lineageRef.collection("heirs").doc(heirId);

    return db.runTransaction(async (transaction) => {
      const [lineageDoc, heirDoc] = await Promise.all([
        transaction.get(lineageRef),
        transaction.get(heirRef),
      ]);
      if (!lineageDoc.exists || !heirDoc.exists) {
        throw new HttpsError("not-found", "Lineage or heir not found");
      }
      const lineage = lineageDoc.data() as Lineage;
      const heir = heirDoc.data() as Heir;
      if (lineage.ownerUid !== uid || heir.ownerUid !== uid) {
        throw new HttpsError("permission-denied", "You do not own this heir");
      }
      if (lineage.activeHeirId !== heirId || heir.status !== "alive") {
        throw new HttpsError("failed-precondition", "Heir is not active");
      }
      if (heir.gold < amount) {
        throw new HttpsError("failed-precondition", "Insufficient gold");
      }

      const heirGoldAfter = heir.gold - amount;
      const bankGoldAfter = lineage.bankGold + amount;
      transaction.update(heirRef, { gold: heirGoldAfter });
      transaction.update(lineageRef, {
        bankGold: bankGoldAfter,
        updatedAt: FieldValue.serverTimestamp(),
      });
      return { deposited: amount, heirGoldAfter, bankGoldAfter };
    });
  }
);

interface WithdrawGoldRequest {
  lineageId: string;
  heirId: string;
  amount: number;
}

interface WithdrawGoldResponse {
  withdrawn: number;
  heirGoldAfter: number;
  bankGoldAfter: number;
}

export const withdrawGold = onCall<WithdrawGoldRequest>(
  { cors: true },
  async (request): Promise<WithdrawGoldResponse> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be signed in");
    }

    const { lineageId, heirId, amount } = request.data;

    if (!lineageId || !heirId || amount === undefined) {
      throw new HttpsError("invalid-argument", "Missing required fields");
    }

    if (amount <= 0 || !Number.isInteger(amount)) {
      throw new HttpsError("invalid-argument", "Amount must be a positive integer");
    }

    const uid = request.auth.uid;

    const lineageRef = db.collection("lineages").doc(lineageId);
    const heirRef = lineageRef.collection("heirs").doc(heirId);

    return db.runTransaction(async (transaction) => {
      const [lineageDoc, heirDoc] = await Promise.all([
        transaction.get(lineageRef),
        transaction.get(heirRef),
      ]);
      if (!lineageDoc.exists || !heirDoc.exists) {
        throw new HttpsError("not-found", "Lineage or heir not found");
      }
      const lineage = lineageDoc.data() as Lineage;
      const heir = heirDoc.data() as Heir;
      if (lineage.ownerUid !== uid || heir.ownerUid !== uid) {
        throw new HttpsError("permission-denied", "You do not own this heir");
      }
      if (lineage.activeHeirId !== heirId || heir.status !== "alive") {
        throw new HttpsError("failed-precondition", "Heir is not active");
      }
      if (lineage.bankGold < amount) {
        throw new HttpsError("failed-precondition", "Insufficient gold in bank");
      }

      const heirGoldAfter = heir.gold + amount;
      const bankGoldAfter = lineage.bankGold - amount;
      transaction.update(heirRef, { gold: heirGoldAfter });
      transaction.update(lineageRef, {
        bankGold: bankGoldAfter,
        updatedAt: FieldValue.serverTimestamp(),
      });
      return { withdrawn: amount, heirGoldAfter, bankGoldAfter };
    });
  }
);

interface DepositItemRequest {
  lineageId: string;
  heirId: string;
  itemId: string;
}

interface DepositItemResponse {
  bankItemId: string;
  itemId: string;
  remainingBankSlots: number;
}

export const depositItem = onCall<DepositItemRequest>(
  { cors: true },
  async (request): Promise<DepositItemResponse> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be signed in");
    }

    const { lineageId, heirId, itemId } = request.data;

    if (!lineageId || !heirId || !itemId) {
      throw new HttpsError("invalid-argument", "Missing required fields");
    }

    const uid = request.auth.uid;

    const lineageRef = db.collection("lineages").doc(lineageId);
    const heirRef = lineageRef.collection("heirs").doc(heirId);

    const [lineageDoc, heirDoc] = await Promise.all([
      lineageRef.get(),
      heirRef.get(),
    ]);

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

    const itemIndex = heir.inventory.indexOf(itemId);
    if (itemIndex === -1) {
      throw new HttpsError("failed-precondition", "Item not found in inventory");
    }

    const bankSnapshot = await lineageRef.collection("bank").get();
    if (bankSnapshot.size >= lineage.bankSlots) {
      throw new HttpsError("failed-precondition", "Bank is full");
    }

    const bankItemId = generateId();
    const bankItem: BankItem = {
      id: bankItemId,
      itemId,
      quantity: 1,
      depositedAt: FieldValue.serverTimestamp(),
      depositedByHeirId: heirId,
    };

    const newInventory = [...heir.inventory];
    newInventory.splice(itemIndex, 1);

    const batch = db.batch();

    batch.set(lineageRef.collection("bank").doc(bankItemId), bankItem);

    batch.update(heirRef, {
      inventory: newInventory,
    });

    batch.update(lineageRef, {
      updatedAt: FieldValue.serverTimestamp(),
    });

    await batch.commit();

    return {
      bankItemId,
      itemId,
      remainingBankSlots: lineage.bankSlots - bankSnapshot.size - 1,
    };
  }
);

interface WithdrawItemRequest {
  lineageId: string;
  heirId: string;
  bankItemId: string;
}

interface WithdrawItemResponse {
  itemId: string;
  remainingBankSlots: number;
}

export const withdrawItem = onCall<WithdrawItemRequest>(
  { cors: true },
  async (request): Promise<WithdrawItemResponse> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be signed in");
    }

    const { lineageId, heirId, bankItemId } = request.data;

    if (!lineageId || !heirId || !bankItemId) {
      throw new HttpsError("invalid-argument", "Missing required fields");
    }

    const uid = request.auth.uid;

    const lineageRef = db.collection("lineages").doc(lineageId);
    const heirRef = lineageRef.collection("heirs").doc(heirId);
    const bankItemRef = lineageRef.collection("bank").doc(bankItemId);

    const [lineageDoc, heirDoc, bankItemDoc] = await Promise.all([
      lineageRef.get(),
      heirRef.get(),
      bankItemRef.get(),
    ]);

    if (!lineageDoc.exists || !heirDoc.exists) {
      throw new HttpsError("not-found", "Lineage or heir not found");
    }

    if (!bankItemDoc.exists) {
      throw new HttpsError("not-found", "Bank item not found");
    }

    const lineage = lineageDoc.data() as Lineage;
    const heir = heirDoc.data() as Heir;
    const bankItem = bankItemDoc.data() as BankItem;

    if (lineage.ownerUid !== uid) {
      throw new HttpsError("permission-denied", "You do not own this lineage");
    }

    if (heir.status !== "alive") {
      throw new HttpsError("failed-precondition", "Heir is not alive");
    }

    const batch = db.batch();

    batch.delete(bankItemRef);

    batch.update(heirRef, {
      inventory: [...heir.inventory, bankItem.itemId],
    });

    batch.update(lineageRef, {
      updatedAt: FieldValue.serverTimestamp(),
    });

    await batch.commit();

    const bankSnapshot = await lineageRef.collection("bank").get();

    return {
      itemId: bankItem.itemId,
      remainingBankSlots: lineage.bankSlots - bankSnapshot.size,
    };
  }
);
