import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import type { ClassData, RaceData, Stats } from "@bloodline/shared/types";
import { validateHeirName, NAME_VALIDATION_MESSAGE } from "@/lib/validation";
import { db } from "./config";

import classesData from "@game-data/classes.json";
import racesData from "@game-data/races.json";

const classes = classesData.classes as ClassData[];
const races = racesData.races as RaceData[];

function createHeirId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "");
  }

  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

function generateSeed(lineageId: string, heirId: string): string {
  const input = `${lineageId}-${heirId}-creation-${Date.now()}`;
  let hash = 0;

  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash).toString(16).padStart(8, "0").repeat(4).slice(0, 32);
}

export async function bootstrapHeir(
  userId: string,
  lineageId: string,
  classId: string,
  name: string
): Promise<{ heirId: string }> {
  const trimmedName = name.trim();

  if (!validateHeirName(trimmedName)) {
    throw new Error(NAME_VALIDATION_MESSAGE);
  }

  const classData = classes.find((entry) => entry.id === classId);
  if (!classData) {
    throw new Error("Invalid class selected");
  }

  const raceId = "human";
  const raceData = races.find((entry) => entry.id === raceId);
  if (!raceData) {
    throw new Error("Race data not found");
  }

  const lineageRef = doc(db, "lineages", lineageId);
  const lineageDoc = await getDoc(lineageRef);

  if (!lineageDoc.exists()) {
    throw new Error("Lineage not found");
  }

  const lineage = lineageDoc.data();

  if (lineage.ownerUid !== userId) {
    throw new Error("You do not own this lineage");
  }

  if (lineage.activeHeirId) {
    const activeHeirDoc = await getDoc(
      doc(db, "lineages", lineageId, "heirs", lineage.activeHeirId)
    );

    if (activeHeirDoc.exists() && activeHeirDoc.data().status === "alive") {
      throw new Error("You already have a living heir");
    }
  }

  const baseStats = classData.startingStats;
  const raceMods = raceData.statModifiers;

  const stats: Stats = {
    strength: baseStats.strength + raceMods.strength,
    dexterity: baseStats.dexterity + raceMods.dexterity,
    intelligence: baseStats.intelligence + raceMods.intelligence,
    constitution: baseStats.constitution + raceMods.constitution,
    luck: baseStats.luck + raceMods.luck,
    charisma: baseStats.charisma + raceMods.charisma,
    faith: baseStats.faith + raceMods.faith,
    infamy: baseStats.infamy + raceMods.infamy,
  };

  const effectsSnapshot = await getDocs(collection(db, "lineages", lineageId, "effects"));
  const inheritedEffectIds: string[] = [];

  effectsSnapshot.forEach((effectDoc) => {
    const effect = effectDoc.data();
    if (
      effect.scope === "bloodline" ||
      (effect.scope === "generations" && effect.remainingGenerations > 0)
    ) {
      inheritedEffectIds.push(effect.effectId);
    }
  });

  const heirId = createHeirId();
  const seed = generateSeed(lineageId, heirId);

  const batch = writeBatch(db);

  batch.set(doc(db, "lineages", lineageId, "heirs", heirId), {
    id: heirId,
    ownerUid: userId,
    lineageId,
    generation: lineage.generation,
    name: trimmedName,
    status: "alive",
    classId,
    raceId,
    level: 1,
    xp: 0,
    gold: 0,
    stats,
    skillIds: [...classData.startingSkills],
    effectIds: inheritedEffectIds,
    equipment: {
      mainWeapon: classData.startingEquipment.weapon ?? null,
      secondaryWeapon: null,
      armor: classData.startingEquipment.armor,
      accessory: classData.startingEquipment.accessory,
    },
    inventory: [],
    jobRecords: {},
    unspentStatPoints: 0,
    activeJobShift: null,
    subclassId: null,
    subclassTier: 0,
    seed,
    createdAt: serverTimestamp(),
    diedAt: null,
  });

  batch.update(lineageRef, {
    activeHeirId: heirId,
    updatedAt: serverTimestamp(),
    "publicSummary.currentClass": classId,
  });

  await batch.commit();

  return { heirId };
}
