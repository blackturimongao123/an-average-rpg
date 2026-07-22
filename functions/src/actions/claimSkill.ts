import { onCall, HttpsError } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import { getCharacterSkillPointsPool } from "@bloodline/shared/constants";
import { db } from "../index.js";
import type { Heir, Lineage } from "../utils/types.js";
import {
  getSkillById,
  getUsedPoints,
  getBloodlineSkillPoints,
  resolveSubclassAdvancementOnClaim,
  validateSkillClaim,
} from "../utils/skills.js";

interface ClaimSkillRequest {
  lineageId: string;
  heirId: string;
  skillId: string;
  warmup?: boolean;
}

interface ClaimSkillResponse {
  skillId: string;
  skillName: string;
  skillPointsRemaining: number;
  treeScope: "character" | "bloodline";
  subclassId?: string | null;
  subclassTier?: number;
}

export const claimSkill = onCall<ClaimSkillRequest>(
  { cors: true },
  async (request): Promise<ClaimSkillResponse> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be signed in");
    }
    if (request.data.warmup) {
      return {
        skillId: "",
        skillName: "",
        skillPointsRemaining: 0,
        treeScope: "character",
      };
    }

    const { lineageId, heirId, skillId } = request.data;

    if (!lineageId || !heirId || !skillId) {
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
    const rawHeir = heirDoc.data() as Heir;
    const heir: Heir = {
      ...rawHeir,
      skillIds: rawHeir.skillIds ?? [],
      effectIds: rawHeir.effectIds ?? [],
      jobRecords: rawHeir.jobRecords ?? {},
    };

    if (lineage.ownerUid !== uid) {
      throw new HttpsError("permission-denied", "You do not own this lineage");
    }

    if (heir.status !== "alive") {
      throw new HttpsError("failed-precondition", "Heir is not alive");
    }

    const skill = getSkillById(skillId);
    if (!skill) {
      throw new HttpsError("invalid-argument", "Skill not found");
    }

    const treeScope = skill.treeScope ?? "character";
    const ownedSkillIds =
      treeScope === "bloodline" ? lineage.bloodlineSkillIds ?? [] : heir.skillIds ?? [];

    if (ownedSkillIds.includes(skillId)) {
      throw new HttpsError("failed-precondition", "Skill already owned");
    }

    try {
      validateSkillClaim(skill, heir, lineage, ownedSkillIds, treeScope);
    } catch (error) {
      throw new HttpsError(
        "failed-precondition",
        error instanceof Error ? error.message : "Cannot claim skill"
      );
    }

    const pointsPool =
      treeScope === "bloodline"
        ? getBloodlineSkillPoints(lineage)
        : getCharacterSkillPointsPool(heir.level);
    const pointsUsed = getUsedPoints(ownedSkillIds) + skill.cost;

    if (pointsUsed > pointsPool) {
      throw new HttpsError("failed-precondition", "Insufficient skill points");
    }

    const subclassAdvance =
      treeScope === "character" ? resolveSubclassAdvancementOnClaim(heir, skill) : null;

    const batch = db.batch();

    if (treeScope === "bloodline") {
      batch.update(lineageRef, {
        bloodlineSkillIds: [...ownedSkillIds, skillId],
        updatedAt: FieldValue.serverTimestamp(),
      });
    } else {
      const heirUpdate: Record<string, unknown> = {
        skillIds: [...heir.skillIds, skillId],
      };
      if (subclassAdvance) {
        heirUpdate.subclassId = subclassAdvance.subclassId;
        heirUpdate.subclassTier = subclassAdvance.subclassTier;
      }
      batch.update(heirRef, heirUpdate);
      batch.update(lineageRef, {
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();

    return {
      skillId,
      skillName: skill.name,
      skillPointsRemaining: pointsPool - pointsUsed,
      treeScope,
      subclassId: subclassAdvance?.subclassId ?? heir.subclassId ?? null,
      subclassTier: subclassAdvance?.subclassTier ?? heir.subclassTier ?? 0,
    };
  }
);

interface ClaimUniqueSkillRequest {
  lineageId: string;
  heirId: string;
  skillId: string;
}

interface ClaimUniqueSkillResponse {
  skillId: string;
  skillName: string;
  claimed: boolean;
}

import skillsData from "../../../game-data/skills.json";
const uniqueSkills = skillsData.uniqueSkills || [];

export const claimUniqueSkill = onCall<ClaimUniqueSkillRequest>(
  { cors: true },
  async (request): Promise<ClaimUniqueSkillResponse> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be signed in");
    }

    const { lineageId, heirId, skillId } = request.data;

    if (!lineageId || !heirId || !skillId) {
      throw new HttpsError("invalid-argument", "Missing required fields");
    }

    const uid = request.auth.uid;
    const lineageRef = db.collection("lineages").doc(lineageId);
    const heirRef = lineageRef.collection("heirs").doc(heirId);
    const uniqueSkillRef = db.doc(`world/uniqueSkills/skills/${skillId}`);

    const uniqueSkill = uniqueSkills.find((s: { id: string }) => s.id === skillId);
    if (!uniqueSkill) {
      throw new HttpsError("invalid-argument", "Unique skill not found");
    }

    try {
      const result = await db.runTransaction(async (transaction) => {
        const [lineageDoc, heirDoc, skillDoc] = await Promise.all([
          transaction.get(lineageRef),
          transaction.get(heirRef),
          transaction.get(uniqueSkillRef),
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

        if (heir.skillIds.includes(skillId)) {
          throw new HttpsError("failed-precondition", "Skill already owned");
        }

        if (skillDoc.exists) {
          const skillData = skillDoc.data();
          if (skillData?.holderHeirId) {
            throw new HttpsError(
              "failed-precondition",
              "This unique skill is already claimed by another player"
            );
          }
        }

        transaction.set(uniqueSkillRef, {
          skillId,
          holderUid: uid,
          holderLineageId: lineageId,
          holderHeirId: heirId,
          claimedAt: FieldValue.serverTimestamp(),
          releaseCondition: "heir_death",
        });

        transaction.update(heirRef, {
          skillIds: [...heir.skillIds, skillId],
        });

        transaction.update(lineageRef, {
          updatedAt: FieldValue.serverTimestamp(),
        });

        return { success: true };
      });

      return {
        skillId,
        skillName: uniqueSkill.name,
        claimed: result.success,
      };
    } catch (error) {
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", "Failed to claim unique skill");
    }
  }
);
