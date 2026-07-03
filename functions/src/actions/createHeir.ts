import { onCall, HttpsError } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "../index.js";
import { generateId, generateSeed, validateHeirName } from "../utils/helpers.js";
import type { Heir, Lineage, CreateHeirRequest, CreateHeirResponse, Stats, ClassData, RaceData } from "../utils/types.js";

import classesData from "../../../game-data/classes.json";
import racesData from "../../../game-data/races.json";

const classes = classesData.classes as ClassData[];
const races = racesData.races as RaceData[];

export const createHeir = onCall<CreateHeirRequest>(
  { cors: true },
  async (request): Promise<CreateHeirResponse> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be signed in");
    }

    const { lineageId, classId, name } = request.data;

    if (!lineageId || typeof lineageId !== "string") {
      throw new HttpsError("invalid-argument", "Lineage ID is required");
    }

    if (!classId || typeof classId !== "string") {
      throw new HttpsError("invalid-argument", "Class ID is required");
    }

    if (!validateHeirName(name)) {
      throw new HttpsError(
        "invalid-argument",
        "Heir name must be 2-50 characters. Spaces and special characters are allowed, but not /."
      );
    }

    const uid = request.auth.uid;

    const lineageRef = db.collection("lineages").doc(lineageId);
    const lineageDoc = await lineageRef.get();

    if (!lineageDoc.exists) {
      throw new HttpsError("not-found", "Lineage not found");
    }

    const lineage = lineageDoc.data() as Lineage;

    if (lineage.ownerUid !== uid) {
      throw new HttpsError("permission-denied", "You do not own this lineage");
    }

    if (lineage.activeHeirId) {
      const activeHeirRef = lineageRef.collection("heirs").doc(lineage.activeHeirId);
      const activeHeirDoc = await activeHeirRef.get();
      
      if (activeHeirDoc.exists) {
        const activeHeir = activeHeirDoc.data() as Heir;
        if (activeHeir.status === "alive") {
          throw new HttpsError("failed-precondition", "You already have a living heir");
        }
      }
    }

    const classData = classes.find((c) => c.id === classId);
    if (!classData) {
      throw new HttpsError("invalid-argument", "Invalid class ID");
    }

    const raceId = "human";
    const raceData = races.find((r) => r.id === raceId);
    if (!raceData) {
      throw new HttpsError("internal", "Race data not found");
    }

    const heirId = generateId();
    const seed = generateSeed(lineageId, heirId, "creation");

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

    const effectsSnapshot = await lineageRef.collection("effects").get();
    const inheritedEffectIds: string[] = [];
    
    effectsSnapshot.forEach((doc) => {
      const effect = doc.data();
      if (effect.scope === "bloodline" || 
          (effect.scope === "generations" && effect.remainingGenerations > 0)) {
        inheritedEffectIds.push(effect.effectId);
      }
    });

    const heir: Heir = {
      id: heirId,
      ownerUid: uid,
      lineageId,
      generation: lineage.generation,
      name: name.trim(),
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
        mainWeapon: classData.startingEquipment.weapon ?? classData.startingEquipment.mainWeapon ?? null,
        secondaryWeapon: null,
        armor: classData.startingEquipment.armor,
        accessory: classData.startingEquipment.accessory,
      },
      inventory: [],
      jobRecords: {},
      unspentStatPoints: 0,
      seed,
      createdAt: FieldValue.serverTimestamp(),
      diedAt: null,
      activeJobShift: null,
      subclassId: null,
      subclassTier: 0,
    };

    const batch = db.batch();

    batch.set(lineageRef.collection("heirs").doc(heirId), heir);

    batch.update(lineageRef, {
      activeHeirId: heirId,
      updatedAt: FieldValue.serverTimestamp(),
      "publicSummary.currentClass": classId,
    });

    await batch.commit();

    return {
      heirId,
      heir,
    };
  }
);
