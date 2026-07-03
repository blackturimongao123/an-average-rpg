import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "./config";
import { normalizeUsername, usernameKey, validateFamilyName, validateUsername, USERNAME_VALIDATION_MESSAGE } from "@/lib/validation";

function createLineageId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "");
  }

  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

export async function bootstrapLineage(
  userId: string,
  familyName: string,
  username: string
): Promise<{ lineageId: string; familyName: string }> {
  const trimmedFamilyName = familyName.trim();
  const displayUsername = normalizeUsername(username);
  const key = usernameKey(username);

  if (!validateFamilyName(trimmedFamilyName)) {
    throw new Error(
      "Family name must be 2-30 characters. Spaces and special characters are allowed, but not /."
    );
  }

  if (!validateUsername(displayUsername)) {
    throw new Error(USERNAME_VALIDATION_MESSAGE);
  }

  const existingLineages = await getDocs(
    query(collection(db, "lineages"), where("ownerUid", "==", userId))
  );

  if (!existingLineages.empty) {
    throw new Error("You already have a bloodline");
  }

  const usernameRef = doc(db, "usernames", key);
  const existingUsername = await getDoc(usernameRef);

  if (existingUsername.exists()) {
    throw new Error("That username is already taken");
  }

  const lineageId = createLineageId();
  const batch = writeBatch(db);

  batch.set(doc(db, "lineages", lineageId), {
    id: lineageId,
    ownerUid: userId,
    familyName: trimmedFamilyName,
    generation: 1,
    activeHeirId: null,
    bankGold: 0,
    bankSlots: 10,
    adventurerRank: "F",
    adventurerRankXp: 0,
    bloodlineSkillIds: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    publicSummary: {
      highestGeneration: 1,
      deadHeirs: 0,
      currentClass: null,
    },
  });

  batch.set(usernameRef, {
    uid: userId,
    username: displayUsername,
    usernameKey: key,
    createdAt: serverTimestamp(),
  });

  const userRef = doc(db, "users", userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    batch.set(userRef, {
      username: displayUsername,
      displayName: displayUsername,
      createdAt: serverTimestamp(),
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
    familyName: trimmedFamilyName,
  };
}
