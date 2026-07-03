import type { Heir, Lineage } from "./types.js";

import skillsData from "../../../game-data/skills.json";
import bloodlineSkillsData from "../../../game-data/bloodline-skills.json";
import subclassSkillsData from "../../../game-data/subclass-skills.json";
import subclassesData from "../../../game-data/subclasses.json";

interface SkillNode {
  id: string;
  name: string;
  treeScope?: "character" | "bloodline";
  classTags: string[];
  subclassTags?: string[];
  originClassTags?: string[];
  cost: number;
  requires: string[];
  blocks: string[];
  jobRequirement?: { jobId: string; level: number };
  specialRequirement?: string;
}

interface SubclassAdvanceRequires {
  level: number;
  skillIds: string[];
}

interface ClassTreeRetention {
  blockedSkillIds?: string[];
  blockedBranchRoots?: string[];
}

interface SubclassData {
  id: string;
  baseClassId: string;
  alternateBaseClassIds?: string[];
  parentSubclassId: string | null;
  tier: number;
  advanceRequires: SubclassAdvanceRequires;
  advanceRequiresByClass?: Record<string, SubclassAdvanceRequires>;
  classTreeRetentionByClass?: Record<string, ClassTreeRetention>;
}

const allCharacterSkills = [
  ...(skillsData.skills as SkillNode[]),
  ...(subclassSkillsData.skills as SkillNode[]),
].map((skill) => ({
  ...skill,
  treeScope: skill.treeScope ?? "character",
  subclassTags: skill.subclassTags ?? [],
}));

const bloodlineSkills = (bloodlineSkillsData.skills as SkillNode[]).map((skill) => ({
  ...skill,
  treeScope: "bloodline" as const,
  subclassTags: skill.subclassTags ?? [],
}));

export const ALL_SKILLS = [...allCharacterSkills, ...bloodlineSkills];
const SUBCLASSES = subclassesData.subclasses as SubclassData[];

const skillsMap = new Map(ALL_SKILLS.map((skill) => [skill.id, skill]));
const subclassesMap = new Map(SUBCLASSES.map((subclass) => [subclass.id, subclass]));

export function getSkillById(skillId: string): SkillNode | undefined {
  return skillsMap.get(skillId);
}

export function getSubclassById(subclassId: string): SubclassData | undefined {
  return subclassesMap.get(subclassId);
}

function subclassMatchesClass(subclass: SubclassData, classId: string): boolean {
  return (
    subclass.baseClassId === classId ||
    (subclass.alternateBaseClassIds?.includes(classId) ?? false)
  );
}

function getAdvanceRequires(subclass: SubclassData, classId: string): SubclassAdvanceRequires {
  return subclass.advanceRequiresByClass?.[classId] ?? subclass.advanceRequires;
}

export function getSubclassChain(subclassId: string | null | undefined): string[] {
  if (!subclassId) return [];
  const chain: string[] = [];
  let current = subclassesMap.get(subclassId);
  while (current) {
    chain.push(current.id);
    current = current.parentSubclassId ? subclassesMap.get(current.parentSubclassId) : undefined;
  }
  return chain;
}

function getSubclassRootId(subclassId: string): string | undefined {
  let current = getSubclassById(subclassId);
  if (!current) return undefined;
  while (current.parentSubclassId) {
    const parent = getSubclassById(current.parentSubclassId);
    if (!parent) return undefined;
    current = parent;
  }
  return current.id;
}

function getCommittedBranchRoot(heir: Heir): string | null {
  for (const skillId of heir.skillIds) {
    const skill = getSkillById(skillId);
    if (!skill?.subclassTags?.length) continue;
    for (const tag of skill.subclassTags) {
      const rootId = getSubclassRootId(tag);
      if (rootId) return rootId;
    }
  }
  return null;
}

function meetsOriginClassRequirement(skill: SkillNode, heir: Heir): boolean {
  if (!skill.originClassTags?.length) return true;
  return skill.originClassTags.includes(heir.classId);
}

function meetsSubclassRequirement(skill: SkillNode, heir: Heir): boolean {
  if (!skill.subclassTags?.length) return true;

  const chain = getSubclassChain(heir.subclassId);
  if (chain.length > 0) {
    return skill.subclassTags.some((tag) => chain.includes(tag));
  }

  const committedRoot = getCommittedBranchRoot(heir);
  return skill.subclassTags.some((tag) => {
    const rootId = getSubclassRootId(tag);
    if (!rootId) return false;
    if (!subclassMatchesClass(getSubclassById(rootId)!, heir.classId)) return false;
    return !committedRoot || rootId === committedRoot;
  });
}

function meetsSpecialRequirement(
  requirement: string | undefined,
  heir: Heir,
  lineage: Lineage
): boolean {
  if (!requirement) return true;
  if (requirement === "fallen_heirs_3") {
    return (lineage.publicSummary?.deadHeirs ?? 0) >= 3;
  }
  if (requirement === "generation_3") {
    return lineage.generation >= 3;
  }
  if (requirement === "royal_event_completed") {
    return heir.effectIds.includes("royal_stipend") || heir.effectIds.includes("royal_blessing");
  }
  if (requirement === "thieves_guild_joined") {
    return heir.effectIds.includes("thieves_guild_member") || heir.effectIds.includes("underworld_contacts");
  }
  return false;
}

export function canAdvanceSubclass(
  subclass: SubclassData,
  heir: Heir
): { canAdvance: boolean; reason?: string } {
  if (!subclassMatchesClass(subclass, heir.classId)) {
    return { canAdvance: false, reason: "Wrong class" };
  }

  if (subclass.tier === 1) {
    if (heir.subclassId) {
      return { canAdvance: false, reason: "Already on a class path" };
    }
  } else if (subclass.tier === 2) {
    if (!heir.subclassId || heir.subclassId !== subclass.parentSubclassId) {
      return { canAdvance: false, reason: "Requires parent subclass" };
    }
    const current = getSubclassById(heir.subclassId);
    if (current && current.tier >= 2) {
      return { canAdvance: false, reason: "Already ascended" };
    }
  }

  const advanceRequires = getAdvanceRequires(subclass, heir.classId);
  if (heir.level < advanceRequires.level) {
    return { canAdvance: false, reason: `Requires level ${advanceRequires.level}` };
  }

  for (const skillId of advanceRequires.skillIds) {
    if (!heir.skillIds.includes(skillId)) {
      return { canAdvance: false, reason: "Missing required skill" };
    }
  }

  return { canAdvance: true };
}

export function resolveSubclassAdvancementOnClaim(
  heir: Heir,
  skill: SkillNode
): { subclassId: string; subclassTier: number } | null {
  if (!skill.subclassTags?.length || (skill.treeScope ?? "character") === "bloodline") {
    return null;
  }

  for (const tag of skill.subclassTags) {
    const subclass = getSubclassById(tag);
    if (!subclass || !subclassMatchesClass(subclass, heir.classId)) continue;

    const rootId = getSubclassRootId(subclass.id);
    if (!rootId) continue;

    const root = getSubclassById(rootId);
    if (!root) continue;

    if (!heir.subclassId) {
      if (root.tier === 1) {
        const { canAdvance } = canAdvanceSubclass(root, heir);
        if (canAdvance) {
          return { subclassId: root.id, subclassTier: 1 };
        }
      }
      continue;
    }

    if (subclass.tier === 2 && heir.subclassId === subclass.parentSubclassId) {
      const { canAdvance } = canAdvanceSubclass(subclass, heir);
      if (canAdvance) {
        return { subclassId: subclass.id, subclassTier: 2 };
      }
    }
  }

  return null;
}

export function validateSkillClaim(
  skill: SkillNode,
  heir: Heir,
  lineage: Lineage,
  ownedSkillIds: string[],
  treeScope: "character" | "bloodline"
): void {
  if ((skill.treeScope ?? "character") !== treeScope) {
    throw new Error("Wrong skill tree");
  }

  if (skill.classTags.length > 0 && !skill.classTags.includes(heir.classId)) {
    throw new Error("This skill is not available for your class");
  }

  if (!meetsSubclassRequirement(skill, heir)) {
    throw new Error("Requires subclass path");
  }

  if (!meetsOriginClassRequirement(skill, heir)) {
    throw new Error("Not available for your class origin");
  }

  if (skill.jobRequirement) {
    const record = heir.jobRecords?.[skill.jobRequirement.jobId];
    if (!record || record.level < skill.jobRequirement.level) {
      throw new Error("Requires job mastery");
    }
  }

  if (!meetsSpecialRequirement(skill.specialRequirement, heir, lineage)) {
    throw new Error("Requires adventure milestone");
  }

  for (const requiredSkillId of skill.requires) {
    if (!ownedSkillIds.includes(requiredSkillId)) {
      throw new Error(`Missing required skill: ${requiredSkillId}`);
    }
  }

  for (const blockedSkillId of skill.blocks) {
    if (ownedSkillIds.includes(blockedSkillId)) {
      throw new Error(`Blocked by owned skill: ${blockedSkillId}`);
    }
  }

  for (const ownedSkillId of ownedSkillIds) {
    const ownedSkill = getSkillById(ownedSkillId);
    if (ownedSkill?.blocks.includes(skill.id)) {
      throw new Error(`Blocked by owned skill: ${ownedSkillId}`);
    }
  }
}

export function getUsedPoints(skillIds: string[]): number {
  return skillIds.reduce((total, skillId) => total + (skillsMap.get(skillId)?.cost ?? 0), 0);
}

export function getBloodlineSkillPoints(lineage: Lineage): number {
  const generationBonus = Math.max(0, lineage.generation - 1);
  const deathBonus = Math.floor((lineage.publicSummary?.deadHeirs ?? 0) / 2);
  return 1 + generationBonus + deathBonus;
}
