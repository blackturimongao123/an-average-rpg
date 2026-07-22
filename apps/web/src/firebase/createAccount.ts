import { collection, doc, getDocs, serverTimestamp, updateDoc, writeBatch } from "firebase/firestore";
import type { ClassData, Heir, Lineage, RaceData, Stats } from "@bloodline/shared/types";
import { generateSeed } from "@/lib/seededRandom";
import { createLineage } from "./functions";
import { getFirebaseErrorMessage } from "@/lib/firebaseErrors";
import { db } from "./config";

import classesData from "@game-data/classes.json";
import racesData from "@game-data/races.json";

const classes = classesData.classes as ClassData[];
const races = racesData.races as RaceData[];

export async function createPlayerBloodline(
  userId: string,
  familyName: string,
  username: string
): Promise<{ lineageId: string; familyName: string }> {
  try {
    const response = await createLineage({ familyName, username });
    return response.data;
  } catch (error) {
    void userId;
    throw new Error(getFirebaseErrorMessage(error));
  }
}

export function createPlayerHeir(
  userId: string,
  lineage: Lineage,
  classId: string,
  name: string
): { heirId: string; heir: Heir } {
  const classData = classes.find((entry) => entry.id === classId);
  const race = races.find((entry) => entry.id === "human");
  if (!classData || !race) throw new Error("Class or race data not found");
  const heirId = crypto.randomUUID().replace(/-/g, "");
  const stats = Object.fromEntries(
    Object.keys(classData.startingStats).map((stat) => [
      stat,
      classData.startingStats[stat as keyof Stats] + race.statModifiers[stat as keyof Stats],
    ])
  ) as unknown as Stats;
  const heir: Heir = {
    id: heirId,
    ownerUid: userId,
    lineageId: lineage.id,
    generation: lineage.generation,
    name: name.trim(),
    status: "alive",
    classId,
    raceId: "human",
    level: 1,
    xp: 0,
    gold: 0,
    stats,
    skillIds: [...classData.startingSkills],
    effectIds: [],
    equipment: {
      mainWeapon: classData.startingEquipment.weapon ?? classData.startingEquipment.mainWeapon ?? null,
      secondaryWeapon: null,
      armor: classData.startingEquipment.armor,
      accessory: classData.startingEquipment.accessory,
    },
    inventory: [],
    jobRecords: {},
    unspentStatPoints: 0,
    seed: generateSeed(lineage.id, heirId, "creation"),
    createdAt: new Date(),
    diedAt: null,
    activeJobShift: null,
    subclassId: null,
    subclassTier: 0,
  };
  const batch = writeBatch(db);
  batch.set(doc(db, "lineages", lineage.id, "heirs", heirId), { ...heir, createdAt: serverTimestamp() });
  batch.update(doc(db, "lineages", lineage.id), {
    activeHeirId: heirId,
    updatedAt: serverTimestamp(),
    "publicSummary.currentClass": classId,
  });
  batch.update(doc(db, "users", userId), { displayName: name.trim() });
  void batch.commit().catch((error) => console.error("Failed to save created heir", error));

  void getDocs(collection(db, "lineages", lineage.id, "effects")).then((snapshot) => {
    const effectIds = snapshot.docs
      .map((entry) => entry.data())
      .filter((effect) => effect.scope === "bloodline" || (effect.scope === "generations" && effect.remainingGenerations > 0))
      .map((effect) => effect.effectId as string);
    if (effectIds.length === 0) return;
    void updateDoc(doc(db, "lineages", lineage.id, "heirs", heirId), { effectIds })
      .catch((error) => console.error("Failed to save inherited effects", error));
  }).catch((error) => console.error("Failed to load inherited effects", error));
  return { heirId, heir };
}
