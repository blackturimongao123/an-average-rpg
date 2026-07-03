import { getCharacterSkillPointsPool } from "../constants.js";
import type {
  ClassTreeRetention,
  Heir,
  Lineage,
  SkillNode,
  SubclassData,
} from "../types.js";

export interface SkillDependencies {
  getSkillById: (skillId: string) => SkillNode | undefined;
  getSubclassById: (subclassId: string) => SubclassData | undefined;
}

export interface SkillClaimContext {
  heir: Heir;
  lineage: Lineage;
  ownedSkillIds: string[];
  treeScope: "character" | "bloodline";
}

export type SkillRevealState = "hidden" | "revealed";

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

export function getSubclassChain(
  subclassId: string | null | undefined,
  deps: SkillDependencies
): string[] {
  if (!subclassId) {
    return [];
  }

  const chain: string[] = [];
  let current = deps.getSubclassById(subclassId);

  while (current) {
    chain.push(current.id);
    current = current.parentSubclassId
      ? deps.getSubclassById(current.parentSubclassId)
      : undefined;
  }

  return chain;
}

export function getSubclassRootId(subclassId: string, deps: SkillDependencies): string | undefined {
  let current = deps.getSubclassById(subclassId);
  if (!current) {
    return undefined;
  }

  while (current.parentSubclassId) {
    const parent = deps.getSubclassById(current.parentSubclassId);
    if (!parent) {
      return undefined;
    }
    current = parent;
  }

  return current.id;
}

export function getCommittedBranchRoot(heir: Heir, deps: SkillDependencies): string | null {
  for (const skillId of heir.skillIds) {
    const skill = deps.getSkillById(skillId);
    if (!skill?.subclassTags?.length) {
      continue;
    }

    for (const tag of skill.subclassTags) {
      const rootId = getSubclassRootId(tag, deps);
      if (rootId) {
        return rootId;
      }
    }
  }

  return null;
}

export function isSubclassBranchUnlocked(
  heir: Heir,
  rootId: string,
  deps: SkillDependencies
): boolean {
  if (heir.subclassId) {
    const chain = getSubclassChain(heir.subclassId, deps);
    if (chain.includes(rootId)) {
      return true;
    }
  }

  for (const skillId of heir.skillIds) {
    const owned = deps.getSkillById(skillId);
    if (!owned?.subclassTags?.length) {
      continue;
    }
    for (const tag of owned.subclassTags) {
      if (getSubclassRootId(tag, deps) === rootId) {
        return true;
      }
    }
  }

  return false;
}

function skillBelongsToSubclassBranch(
  skill: SkillNode,
  rootId: string,
  deps: SkillDependencies
): boolean {
  return (skill.subclassTags ?? []).some((tag: string) => getSubclassRootId(tag, deps) === rootId);
}

export function canAdvanceSubclass(
  subclass: SubclassData,
  heir: Heir,
  deps: SkillDependencies
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
    const current = deps.getSubclassById(heir.subclassId);
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
      const skill = deps.getSkillById(skillId);
      return {
        canAdvance: false,
        reason: skill ? `Requires ${skill.name}` : "Missing required skill",
      };
    }
  }

  return { canAdvance: true };
}

function isSkillBlockedBySubclassRetention(
  skill: SkillNode,
  heir: Heir,
  deps: SkillDependencies
): boolean {
  if (!heir.subclassId || skill.subclassTags?.length) {
    return false;
  }

  const subclass = deps.getSubclassById(heir.subclassId);
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
    const committedRoot = getCommittedBranchRoot(heir, deps);
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

export function meetsSpecialRequirement(
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
    return (
      heir.effectIds.includes("thieves_guild_member") ||
      heir.effectIds.includes("underworld_contacts")
    );
  }

  return false;
}

function meetsJobRequirement(skill: SkillNode, heir: Heir): boolean {
  if (!skill.jobRequirement) {
    return true;
  }

  const record = heir.jobRecords[skill.jobRequirement.jobId];
  return !!record && record.level >= skill.jobRequirement.level;
}

function meetsSubclassRequirement(
  skill: SkillNode,
  heir: Heir,
  deps: SkillDependencies
): boolean {
  if (!skill.subclassTags || skill.subclassTags.length === 0) {
    return true;
  }

  const chain = getSubclassChain(heir.subclassId, deps);
  if (chain.length > 0) {
    return skill.subclassTags.some((tag: string) => chain.includes(tag));
  }

  const committedRoot = getCommittedBranchRoot(heir, deps);

  return skill.subclassTags.some((tag: string) => {
    const rootId = getSubclassRootId(tag, deps);
    if (!rootId) {
      return false;
    }

    const root = deps.getSubclassById(rootId);
    if (root && !subclassMatchesClass(root, heir.classId)) {
      return false;
    }

    return !committedRoot || rootId === committedRoot;
  });
}

function requiresSubclassAdvanceGate(
  skill: SkillNode,
  heir: Heir,
  deps: SkillDependencies
): boolean {
  if (!skill.subclassTags?.length) {
    return true;
  }

  let matchedSubclassTag = false;

  for (const tag of skill.subclassTags) {
    const subclass = deps.getSubclassById(tag);
    if (!subclass || !subclassMatchesClass(subclass, heir.classId)) {
      continue;
    }

    matchedSubclassTag = true;
    const rootId = getSubclassRootId(subclass.id, deps);
    if (!rootId) {
      continue;
    }

    const root = deps.getSubclassById(rootId);
    if (!root) {
      continue;
    }

    if (heir.subclassId) {
      if (getSubclassChain(heir.subclassId, deps).includes(subclass.id)) {
        return true;
      }
      continue;
    }

    if (subclass.tier === 1 || subclass.id === rootId) {
      return canAdvanceSubclass(root, heir, deps).canAdvance;
    }
  }

  return !matchedSubclassTag;
}

export function getSkillRevealState(
  skill: SkillNode,
  heir: Heir,
  lineage: Lineage
): SkillRevealState {
  if (!skill.isHidden) {
    return "revealed";
  }

  if (meetsSpecialRequirement(skill.specialRequirement, heir, lineage)) {
    return "revealed";
  }

  return "hidden";
}

function isSubclassEntrySkillVisible(
  heir: Heir,
  skill: SkillNode,
  rootId: string,
  deps: SkillDependencies
): boolean {
  if (!skillBelongsToSubclassBranch(skill, rootId, deps)) {
    return false;
  }

  const root = deps.getSubclassById(rootId);
  if (!root || !subclassMatchesClass(root, heir.classId)) {
    return false;
  }

  const committedRoot = getCommittedBranchRoot(heir, deps);
  if (committedRoot && committedRoot !== rootId) {
    return false;
  }

  if (!canAdvanceSubclass(root, heir, deps).canAdvance) {
    return false;
  }

  for (const reqId of skill.requires) {
    if (!heir.skillIds.includes(reqId)) {
      return false;
    }
    const req = deps.getSkillById(reqId);
    if (req && skillBelongsToSubclassBranch(req, rootId, deps)) {
      return false;
    }
  }

  return true;
}

function isSubclassSkillVisibleInWeb(
  heir: Heir,
  skill: SkillNode,
  deps: SkillDependencies
): boolean {
  const branchRoots = new Set<string>();
  for (const tag of skill.subclassTags ?? []) {
    const rootId = getSubclassRootId(tag, deps);
    if (!rootId) {
      continue;
    }
    const root = deps.getSubclassById(rootId);
    if (root && subclassMatchesClass(root, heir.classId)) {
      branchRoots.add(rootId);
    }
  }

  if (branchRoots.size === 0) {
    return false;
  }

  const committedRoot = getCommittedBranchRoot(heir, deps);

  for (const rootId of branchRoots) {
    if (committedRoot && committedRoot !== rootId && !isSubclassBranchUnlocked(heir, rootId, deps)) {
      continue;
    }

    if (isSubclassBranchUnlocked(heir, rootId, deps)) {
      if (skillBelongsToSubclassBranch(skill, rootId, deps)) {
        return true;
      }
      continue;
    }

    if (isSubclassEntrySkillVisible(heir, skill, rootId, deps)) {
      return true;
    }
  }

  return false;
}

function isRevealedByPathUnlock(
  skill: SkillNode,
  heir: Heir,
  lineage: Lineage,
  characterSkills: SkillNode[],
  deps: SkillDependencies
): boolean {
  for (const other of characterSkills) {
    if (!other.revealsPaths?.includes(skill.id)) {
      continue;
    }
    if (getSkillRevealState(other, heir, lineage) === "revealed") {
      return true;
    }
    if (heir.skillIds.includes(other.id)) {
      return true;
    }
  }

  for (const ownedId of heir.skillIds) {
    const owned = deps.getSkillById(ownedId);
    if (owned?.revealsPaths?.includes(skill.id)) {
      return true;
    }
  }

  for (const ownedId of lineage.bloodlineSkillIds ?? []) {
    const owned = deps.getSkillById(ownedId);
    if (owned?.revealsPaths?.includes(skill.id)) {
      return true;
    }
  }

  return false;
}

export function isSkillVisibleInWeb(
  skill: SkillNode,
  heir: Heir,
  lineage: Lineage,
  characterSkills: SkillNode[],
  deps: SkillDependencies
): boolean {
  if (skill.classTags.length > 0 && !skill.classTags.includes(heir.classId)) {
    return false;
  }

  if (isSkillBlockedBySubclassRetention(skill, heir, deps)) {
    return false;
  }

  if (!meetsOriginClassRequirement(skill, heir)) {
    return false;
  }

  if (isRevealedByPathUnlock(skill, heir, lineage, characterSkills, deps)) {
    return true;
  }

  if (skill.subclassTags && skill.subclassTags.length > 0) {
    return isSubclassSkillVisibleInWeb(heir, skill, deps);
  }

  return true;
}

export function getCharacterWebSkills(
  heir: Heir,
  lineage: Lineage,
  characterSkills: SkillNode[],
  deps: SkillDependencies
): SkillNode[] {
  return characterSkills.filter((skill) => {
    if (!isSkillVisibleInWeb(skill, heir, lineage, characterSkills, deps)) {
      return false;
    }

    if (skill.isHidden && getSkillRevealState(skill, heir, lineage) === "hidden") {
      return true;
    }

    return true;
  });
}

export function getUsedSkillPoints(
  skillIds: string[],
  deps: SkillDependencies
): number {
  return skillIds.reduce((sum, skillId) => sum + (deps.getSkillById(skillId)?.cost ?? 0), 0);
}

export function getBloodlineSkillPoints(lineage: Lineage): number {
  const generationBonus = Math.max(0, lineage.generation - 1);
  const deathBonus = Math.floor((lineage.publicSummary?.deadHeirs ?? 0) / 2);
  return 1 + generationBonus + deathBonus;
}

export function canClaimSkill(
  skill: SkillNode,
  context: SkillClaimContext,
  deps: SkillDependencies
): { canClaim: boolean; reason?: string } {
  const { heir, lineage, ownedSkillIds, treeScope } = context;

  if ((skill.treeScope ?? "character") !== treeScope) {
    return { canClaim: false, reason: "Wrong skill tree" };
  }

  if (ownedSkillIds.includes(skill.id)) {
    return { canClaim: false, reason: "Already owned" };
  }

  if (skill.isHidden && getSkillRevealState(skill, heir, lineage) === "hidden") {
    return { canClaim: false, reason: "Hidden skill not yet revealed" };
  }

  if (skill.classTags.length > 0 && !skill.classTags.includes(heir.classId)) {
    return { canClaim: false, reason: "Wrong class" };
  }

  if (!meetsSubclassRequirement(skill, heir, deps)) {
    return { canClaim: false, reason: "Not yet available" };
  }

  if (!requiresSubclassAdvanceGate(skill, heir, deps)) {
    return { canClaim: false, reason: "Subclass requirements not met" };
  }

  if (!meetsOriginClassRequirement(skill, heir)) {
    return { canClaim: false, reason: "Not available for your class origin" };
  }

  if (isSkillBlockedBySubclassRetention(skill, heir, deps)) {
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
      const requiredSkill = deps.getSkillById(requiredSkillId);
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
    const ownedSkill = deps.getSkillById(ownedSkillId);
    if (ownedSkill?.blocks.includes(skill.id)) {
      return { canClaim: false, reason: "Blocked by owned skill" };
    }
  }

  const pointsRemaining =
    treeScope === "bloodline"
      ? getBloodlineSkillPoints(lineage) - getUsedSkillPoints(ownedSkillIds, deps)
      : getCharacterSkillPointsPool(heir.level) - getUsedSkillPoints(ownedSkillIds, deps);

  if (skill.cost > pointsRemaining) {
    return { canClaim: false, reason: "Not enough skill points" };
  }

  return { canClaim: true };
}

export function validateSkillClaim(
  skill: SkillNode,
  heir: Heir,
  lineage: Lineage,
  ownedSkillIds: string[],
  treeScope: "character" | "bloodline",
  deps: SkillDependencies
): void {
  const result = canClaimSkill(
    skill,
    { heir, lineage, ownedSkillIds, treeScope },
    deps
  );

  if (!result.canClaim) {
    throw new Error(result.reason ?? "Cannot claim skill");
  }
}

export function resolveSubclassAdvancementOnClaim(
  heir: Heir,
  skill: SkillNode,
  deps: SkillDependencies
): { subclassId: string; subclassTier: number } | null {
  if (!skill.subclassTags?.length || (skill.treeScope ?? "character") === "bloodline") {
    return null;
  }

  for (const tag of skill.subclassTags) {
    const subclass = deps.getSubclassById(tag);
    if (!subclass || !subclassMatchesClass(subclass, heir.classId)) {
      continue;
    }

    const rootId = getSubclassRootId(subclass.id, deps);
    if (!rootId) {
      continue;
    }

    const root = deps.getSubclassById(rootId);
    if (!root) {
      continue;
    }

    if (!heir.subclassId) {
      if (root.tier === 1) {
        const { canAdvance } = canAdvanceSubclass(root, heir, deps);
        if (canAdvance) {
          return { subclassId: root.id, subclassTier: 1 };
        }
      }
      continue;
    }

    if (subclass.tier === 2 && heir.subclassId === subclass.parentSubclassId) {
      const { canAdvance } = canAdvanceSubclass(subclass, heir, deps);
      if (canAdvance) {
        return { subclassId: subclass.id, subclassTier: 2 };
      }
    }
  }

  return null;
}
