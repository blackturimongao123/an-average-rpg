import { doc, getDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import type { Heir, Lineage, SkillNode } from "@bloodline/shared/types";
import {
  ALL_SKILLS,
  canAdvanceSubclass,
  canClaimSkill,
  getSubclassById,
  resolveSubclassAdvancementOnClaim,
} from "@/lib/skills";
import { db } from "./config";

const skillsMap = new Map(ALL_SKILLS.map((skill) => [skill.id, skill]));

export async function bootstrapClaimSkill(
  userId: string,
  lineageId: string,
  heirId: string,
  skillId: string
) {
  const lineageRef = doc(db, "lineages", lineageId);
  const heirRef = doc(db, "lineages", lineageId, "heirs", heirId);

  const [lineageDoc, heirDoc] = await Promise.all([getDoc(lineageRef), getDoc(heirRef)]);

  if (!lineageDoc.exists() || !heirDoc.exists()) {
    throw new Error("Lineage or heir not found");
  }

  const lineage = { id: lineageDoc.id, ...lineageDoc.data() } as Lineage;
  const heir = heirDoc.data() as Heir;

  if (lineage.ownerUid !== userId) {
    throw new Error("You do not own this lineage");
  }

  if (heir.status !== "alive") {
    throw new Error("Heir is not alive");
  }

  const skill = skillsMap.get(skillId) as SkillNode | undefined;
  if (!skill) {
    throw new Error("Skill not found");
  }

  const treeScope = skill.treeScope ?? "character";
  const ownedSkillIds =
    treeScope === "bloodline" ? lineage.bloodlineSkillIds ?? [] : heir.skillIds;

  const validation = canClaimSkill(skill, {
    heir: { ...heir, lineageId },
    lineage,
    ownedSkillIds,
    treeScope,
  });

  if (!validation.canClaim) {
    throw new Error(validation.reason ?? "Cannot claim skill");
  }

  const batch = writeBatch(db);
  const subclassAdvancement = resolveSubclassAdvancementOnClaim(heir, skill);
  const heirUpdates: Record<string, unknown> = {
    skillIds: [...heir.skillIds, skillId],
  };

  if (subclassAdvancement) {
    heirUpdates.subclassId = subclassAdvancement.subclassId;
    heirUpdates.subclassTier = subclassAdvancement.subclassTier;
  }

  if (treeScope === "bloodline") {
    batch.update(lineageRef, {
      bloodlineSkillIds: [...ownedSkillIds, skillId],
      updatedAt: serverTimestamp(),
    });
  } else {
    batch.update(heirRef, heirUpdates);
    batch.update(lineageRef, {
      updatedAt: serverTimestamp(),
    });
  }

  await batch.commit();

  return {
    skillId,
    skillName: skill.name,
    treeScope,
    subclassId: subclassAdvancement?.subclassId,
    subclassTier: subclassAdvancement?.subclassTier,
  };
}

export async function bootstrapAdvanceSubclass(
  userId: string,
  lineageId: string,
  heirId: string,
  subclassId: string
) {
  const lineageRef = doc(db, "lineages", lineageId);
  const heirRef = doc(db, "lineages", lineageId, "heirs", heirId);

  const [lineageDoc, heirDoc] = await Promise.all([getDoc(lineageRef), getDoc(heirRef)]);

  if (!lineageDoc.exists() || !heirDoc.exists()) {
    throw new Error("Lineage or heir not found");
  }

  const lineage = lineageDoc.data();
  const heir = heirDoc.data() as Heir;

  if (lineage.ownerUid !== userId) {
    throw new Error("You do not own this lineage");
  }

  if (heir.status !== "alive") {
    throw new Error("Heir is not alive");
  }

  const subclass = getSubclassById(subclassId);
  if (!subclass) {
    throw new Error("Subclass not found");
  }

  const validation = canAdvanceSubclass(subclass, heir);
  if (!validation.canAdvance) {
    throw new Error(validation.reason ?? "Cannot advance subclass");
  }

  const batch = writeBatch(db);
  batch.update(heirRef, {
    subclassId,
    subclassTier: subclass.tier,
  });
  await batch.commit();

  return {
    subclassId,
    subclassName: subclass.name,
    tier: subclass.tier,
  };
}
