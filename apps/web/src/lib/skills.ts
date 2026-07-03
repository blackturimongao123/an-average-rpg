import type {
  Heir,
  Lineage,
  SkillNode,
  SubclassData,
  ClassTreeRetention,
} from "@bloodline/shared/types";

import skillsData from "@game-data/skills.json";
import bloodlineSkillsData from "@game-data/bloodline-skills.json";
import subclassSkillsData from "@game-data/subclass-skills.json";
import subclassesData from "@game-data/subclasses.json";

export const CHARACTER_SKILLS = [
  ...(skillsData.skills as SkillNode[]),
  ...(subclassSkillsData.skills as SkillNode[]),
].map((skill) => ({
  ...skill,
  treeScope: skill.treeScope ?? "character",
  subclassTags: skill.subclassTags ?? [],
}));

export const BLOODLINE_SKILLS = (bloodlineSkillsData.skills as SkillNode[]).map((skill) => ({
  ...skill,
  treeScope: "bloodline" as const,
  subclassTags: skill.subclassTags ?? [],
}));

export const ALL_SKILLS = [...CHARACTER_SKILLS, ...BLOODLINE_SKILLS];

export const SUBCLASSES = subclassesData.subclasses as SubclassData[];

const skillsMap = new Map(ALL_SKILLS.map((skill) => [skill.id, skill]));
const subclassesMap = new Map(SUBCLASSES.map((subclass) => [subclass.id, subclass]));

export function getSkillById(skillId: string): SkillNode | undefined {
  return skillsMap.get(skillId);
}

export function getSubclassById(subclassId: string): SubclassData | undefined {
  return subclassesMap.get(subclassId);
}

export function getSubclassChain(subclassId: string | null | undefined): string[] {
  if (!subclassId) {
    return [];
  }

  const chain: string[] = [];
  let current = subclassesMap.get(subclassId);

  while (current) {
    chain.push(current.id);
    current = current.parentSubclassId ? subclassesMap.get(current.parentSubclassId) : undefined;
  }

  return chain;
}

export function getSubclassesForClass(classId: string, tier?: number): SubclassData[] {
  return SUBCLASSES.filter((subclass) => {
    const matchesClass =
      subclass.baseClassId === classId ||
      (subclass.alternateBaseClassIds?.includes(classId) ?? false);
    return matchesClass && (tier === undefined || subclass.tier === tier);
  });
}

export function subclassMatchesClass(subclass: SubclassData, classId: string): boolean {
  return (
    subclass.baseClassId === classId ||
    (subclass.alternateBaseClassIds?.includes(classId) ?? false)
  );
}

export function getAdvanceRequires(
  subclass: SubclassData,
  classId: string
): SubclassData["advanceRequires"] {
  return subclass.advanceRequiresByClass?.[classId] ?? subclass.advanceRequires;
}

export function getClassTreeRetention(
  subclass: SubclassData,
  classId: string
): ClassTreeRetention | undefined {
  return subclass.classTreeRetentionByClass?.[classId];
}

function isSkillBlockedBySubclassRetention(skill: SkillNode, heir: Heir): boolean {
  if (!heir.subclassId || skill.subclassTags?.length) {
    return false;
  }

  const subclass = getSubclassById(heir.subclassId);
  if (!subclass) {
    return false;
  }

  const retention = getClassTreeRetention(subclass, heir.classId);
  if (!retention) {
    return false;
  }

  if (retention.blockedSkillIds?.includes(skill.id)) {
    return true;
  }

  if (retention.blockedBranchRoots?.length) {
    const committedRoot = getCommittedBranchRoot(heir);
    if (committedRoot && retention.blockedBranchRoots.includes(committedRoot)) {
      return true;
    }
  }

  return false;
}

function meetsOriginClassRequirement(skill: SkillNode, heir: Heir): boolean {
  if (!skill.originClassTags?.length) {
    return true;
  }
  return skill.originClassTags.includes(heir.classId);
}

export function getBloodlineSkillPoints(lineage: Lineage): number {
  const generationBonus = Math.max(0, lineage.generation - 1);
  const deathBonus = Math.floor((lineage.publicSummary?.deadHeirs ?? 0) / 2);
  return 1 + generationBonus + deathBonus;
}

export function getUsedSkillPoints(skillIds: string[]): number {
  return skillIds.reduce((sum, skillId) => sum + (getSkillById(skillId)?.cost ?? 0), 0);
}

export function getCharacterSkillPoints(heir: Heir): number {
  return heir.level - getUsedSkillPoints(heir.skillIds);
}

export function getBloodlinePointsRemaining(lineage: Lineage): number {
  const owned = lineage.bloodlineSkillIds ?? [];
  return getBloodlineSkillPoints(lineage) - getUsedSkillPoints(owned);
}

function meetsSpecialRequirement(
  requirement: string | undefined,
  heir: Heir,
  lineage: Lineage
): boolean {
  if (!requirement) {
    return true;
  }

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

function meetsJobRequirement(
  skill: SkillNode,
  heir: Heir
): boolean {
  if (!skill.jobRequirement) {
    return true;
  }

  const record = heir.jobRecords[skill.jobRequirement.jobId];
  return !!record && record.level >= skill.jobRequirement.level;
}

function getSubclassRootId(subclassId: string): string | undefined {
  let current = getSubclassById(subclassId);
  if (!current) {
    return undefined;
  }

  while (current.parentSubclassId) {
    const parent = getSubclassById(current.parentSubclassId);
    if (!parent) {
      return undefined;
    }
    current = parent;
  }

  return current.id;
}

export function getCommittedBranchRoot(heir: Heir): string | null {
  for (const skillId of heir.skillIds) {
    const skill = getSkillById(skillId);
    if (!skill?.subclassTags?.length) {
      continue;
    }

    for (const tag of skill.subclassTags) {
      const rootId = getSubclassRootId(tag);
      if (rootId) {
        return rootId;
      }
    }
  }

  return null;
}

function meetsSubclassRequirement(skill: SkillNode, heir: Heir): boolean {
  if (!skill.subclassTags || skill.subclassTags.length === 0) {
    return true;
  }

  const chain = getSubclassChain(heir.subclassId);
  if (chain.length > 0) {
    return skill.subclassTags.some((tag) => chain.includes(tag));
  }

  const committedRoot = getCommittedBranchRoot(heir);

  return skill.subclassTags.some((tag) => {
    const rootId = getSubclassRootId(tag);
    if (!rootId) {
      return false;
    }

    return !committedRoot || rootId === committedRoot;
  });
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
    if (!subclass || !subclassMatchesClass(subclass, heir.classId)) {
      continue;
    }

    const rootId = getSubclassRootId(subclass.id);
    if (!rootId) {
      continue;
    }

    const root = getSubclassById(rootId);
    if (!root) {
      continue;
    }

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

export function filterCharacterSkills(heir: Heir): SkillNode[] {
  const chain = getSubclassChain(heir.subclassId);

  return CHARACTER_SKILLS.filter((skill) => {
    if (skill.classTags.length > 0 && !skill.classTags.includes(heir.classId)) {
      return false;
    }

    if (isSkillBlockedBySubclassRetention(skill, heir)) {
      return false;
    }

    if (skill.subclassTags && skill.subclassTags.length > 0) {
      if (chain.length === 0) {
        return false;
      }
      if (!skill.subclassTags.some((tag) => chain.includes(tag))) {
        return false;
      }
    }

    if (!meetsOriginClassRequirement(skill, heir)) {
      return false;
    }

    return true;
  });
}

/** All nodes shown on the character spider web (including locked subclass branches). */
export function getCharacterWebSkills(heir: Heir): SkillNode[] {
  const classSubclassIds = new Set(
    SUBCLASSES.filter((subclass) => subclassMatchesClass(subclass, heir.classId)).map(
      (subclass) => subclass.id
    )
  );

  return CHARACTER_SKILLS.filter((skill) => {
    if (skill.classTags.length > 0 && !skill.classTags.includes(heir.classId)) {
      return false;
    }

    if (isSkillBlockedBySubclassRetention(skill, heir)) {
      return false;
    }

    if (skill.subclassTags && skill.subclassTags.length > 0) {
      return skill.subclassTags.some((tag) => classSubclassIds.has(tag));
    }

    return true;
  });
}

export function filterBloodlineSkills(): SkillNode[] {
  return BLOODLINE_SKILLS;
}

export interface SkillClaimContext {
  heir: Heir;
  lineage: Lineage;
  ownedSkillIds: string[];
  treeScope: "character" | "bloodline";
}

export function canClaimSkill(
  skill: SkillNode,
  context: SkillClaimContext
): { canClaim: boolean; reason?: string } {
  const { heir, lineage, ownedSkillIds, treeScope } = context;

  if ((skill.treeScope ?? "character") !== treeScope) {
    return { canClaim: false, reason: "Wrong skill tree" };
  }

  if (ownedSkillIds.includes(skill.id)) {
    return { canClaim: false, reason: "Already owned" };
  }

  if (skill.classTags.length > 0 && !skill.classTags.includes(heir.classId)) {
    return { canClaim: false, reason: "Wrong class" };
  }

  if (!meetsSubclassRequirement(skill, heir)) {
    return { canClaim: false, reason: "Not yet available" };
  }

  if (!meetsOriginClassRequirement(skill, heir)) {
    return { canClaim: false, reason: "Not available for your class origin" };
  }

  if (isSkillBlockedBySubclassRetention(skill, heir)) {
    return { canClaim: false, reason: "Blocked by subclass path" };
  }

  if (!meetsJobRequirement(skill, heir)) {
    return { canClaim: false, reason: "Requires job mastery" };
  }

  if (!meetsSpecialRequirement(skill.specialRequirement, heir, lineage)) {
    return { canClaim: false, reason: "Requires adventure milestone" };
  }

  for (const requiredSkillId of skill.requires) {
    if (!ownedSkillIds.includes(requiredSkillId)) {
      const requiredSkill = getSkillById(requiredSkillId);
      return {
        canClaim: false,
        reason: requiredSkill ? `Requires ${requiredSkill.name}` : "Missing prerequisite",
      };
    }
  }

  for (const blockedSkillId of skill.blocks) {
    if (ownedSkillIds.includes(blockedSkillId)) {
      return { canClaim: false, reason: "Blocked by owned skill" };
    }
  }

  for (const ownedSkillId of ownedSkillIds) {
    const ownedSkill = getSkillById(ownedSkillId);
    if (ownedSkill?.blocks.includes(skill.id)) {
      return { canClaim: false, reason: "Blocked by owned skill" };
    }
  }

  const pointsRemaining =
    treeScope === "bloodline"
      ? getBloodlinePointsRemaining({ ...lineage, bloodlineSkillIds: ownedSkillIds })
      : heir.level - getUsedSkillPoints(ownedSkillIds);

  if (skill.cost > pointsRemaining) {
    return { canClaim: false, reason: "Not enough skill points" };
  }

  return { canClaim: true };
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
      const skill = getSkillById(skillId);
      return {
        canAdvance: false,
        reason: skill ? `Requires ${skill.name}` : "Missing required skill",
      };
    }
  }

  return { canAdvance: true };
}

export const SKILL_NODE_RADIUS = 28;
export const SKILL_GRID_SIZE = 72;

export function skillToCanvasPosition(position: { x: number; y: number }): { x: number; y: number } {
  return {
    x: position.x * SKILL_GRID_SIZE,
    y: position.y * SKILL_GRID_SIZE,
  };
}

export function getSkillWebBounds(skills: SkillNode[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  if (skills.length === 0) {
    return { minX: 0, minY: 0, maxX: 400, maxY: 400 };
  }

  const positions = skills.map((skill) => skillToCanvasPosition(skill.position));
  const padding = SKILL_NODE_RADIUS * 3;

  return {
    minX: Math.min(...positions.map((pos) => pos.x)) - padding,
    minY: Math.min(...positions.map((pos) => pos.y)) - padding,
    maxX: Math.max(...positions.map((pos) => pos.x)) + padding,
    maxY: Math.max(...positions.map((pos) => pos.y)) + padding,
  };
}
