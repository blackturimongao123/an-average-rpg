import { onCall, HttpsError } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "../index.js";
import type { Heir, Lineage, Stats } from "../utils/types.js";

const ALLOCATABLE_STATS: Array<keyof Stats> = [
  "strength",
  "dexterity",
  "intelligence",
  "constitution",
  "luck",
  "charisma",
  "faith",
];

interface AllocateStatPointsRequest {
  lineageId: string;
  heirId: string;
  stat: keyof Stats;
  amount?: number;
}

interface AllocateStatPointsResponse {
  stats: Stats;
  unspentStatPoints: number;
}

export const allocateStatPoints = onCall<AllocateStatPointsRequest>(
  { cors: true },
  async (request): Promise<AllocateStatPointsResponse> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be signed in");
    }

    const { lineageId, heirId, stat, amount = 1 } = request.data;
    if (!lineageId || !heirId || !stat) {
      throw new HttpsError("invalid-argument", "Missing required fields");
    }

    if (!ALLOCATABLE_STATS.includes(stat)) {
      throw new HttpsError("invalid-argument", "That stat cannot be allocated");
    }

    if (!Number.isInteger(amount) || amount < 1) {
      throw new HttpsError("invalid-argument", "Amount must be a positive integer");
    }

    const uid = request.auth.uid;
    const lineageRef = db.collection("lineages").doc(lineageId);
    const heirRef = lineageRef.collection("heirs").doc(heirId);

    return db.runTransaction(async (tx) => {
      const [lineageDoc, heirDoc] = await Promise.all([
        tx.get(lineageRef),
        tx.get(heirRef),
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

      const unspent = heir.unspentStatPoints ?? 0;
      if (unspent < amount) {
        throw new HttpsError("failed-precondition", "Not enough unspent stat points");
      }

      const stats: Stats = {
        ...heir.stats,
        [stat]: (heir.stats[stat] ?? 0) + amount,
      };
      const unspentStatPoints = unspent - amount;

      tx.update(heirRef, { stats, unspentStatPoints });
      tx.update(lineageRef, { updatedAt: FieldValue.serverTimestamp() });
      return { stats, unspentStatPoints };
    });
  }
);
