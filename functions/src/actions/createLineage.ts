import { onCall, HttpsError } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "../index.js";
import { generateId, validateFamilyName, validateUsername } from "../utils/helpers.js";
import type { Lineage, CreateLineageRequest, CreateLineageResponse } from "../utils/types.js";

export const createLineage = onCall<CreateLineageRequest>(
  { cors: true },
  async (request): Promise<CreateLineageResponse> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be signed in to create a lineage");
    }

    const { familyName, username } = request.data;
    const displayUsername = username?.trim() ?? "";
    const key = displayUsername.toLowerCase();

    if (!validateFamilyName(familyName)) {
      throw new HttpsError(
        "invalid-argument",
        "Family name must be 2-30 characters. Spaces and special characters are allowed, but not /."
      );
    }

    if (!validateUsername(displayUsername)) {
      throw new HttpsError(
        "invalid-argument",
        "Username must be 2-30 characters. Spaces and special characters are allowed, but not /."
      );
    }

    const uid = request.auth.uid;

    const existingLineages = await db
      .collection("lineages")
      .where("ownerUid", "==", uid)
      .limit(1)
      .get();

    if (!existingLineages.empty) {
      throw new HttpsError("already-exists", "You already have a lineage");
    }

    const usernameRef = db.collection("usernames").doc(key);
    const existingUsername = await usernameRef.get();

    if (existingUsername.exists) {
      throw new HttpsError("already-exists", "That username is already taken");
    }

    const lineageId = generateId();

    const lineage: Lineage = {
      id: lineageId,
      ownerUid: uid,
      familyName: familyName.trim(),
      generation: 1,
      activeHeirId: null,
      bankGold: 0,
      bankSlots: 10,
      adventurerRank: "F",
      adventurerRankXp: 0,
      bloodlineSkillIds: [],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      publicSummary: {
        highestGeneration: 1,
        deadHeirs: 0,
        currentClass: null,
      },
    };

    const batch = db.batch();

    batch.set(db.collection("lineages").doc(lineageId), lineage);
    batch.set(usernameRef, {
      uid,
      username: displayUsername,
      usernameKey: key,
      createdAt: FieldValue.serverTimestamp(),
    });

    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      batch.set(userRef, {
        username: displayUsername,
        displayName: displayUsername,
        createdAt: FieldValue.serverTimestamp(),
        activeLineageId: lineageId,
        role: "player",
        settings: {
          reducedMotion: false,
          theme: "dark",
        },
      });
    } else {
      batch.update(userRef, {
        username: displayUsername,
        displayName: displayUsername,
        activeLineageId: lineageId,
      });
    }

    await batch.commit();

    return {
      lineageId,
      familyName: lineage.familyName,
    };
  }
);
