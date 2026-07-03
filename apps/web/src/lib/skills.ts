import type {

  Heir,

  Lineage,

  SkillNode,

  SubclassData,

} from "@bloodline/shared/types";

import {

  canAdvanceSubclass as sharedCanAdvanceSubclass,

  canClaimSkill as sharedCanClaimSkill,

  getBloodlineSkillPoints as sharedGetBloodlineSkillPoints,

  getCharacterWebSkills as sharedGetCharacterWebSkills,

  getCommittedBranchRoot as sharedGetCommittedBranchRoot,

  getSkillRevealState as sharedGetSkillRevealState,

  getSubclassChain as sharedGetSubclassChain,

  getUsedSkillPoints as sharedGetUsedSkillPoints,

  isSubclassBranchUnlocked as sharedIsSubclassBranchUnlocked,

  resolveSubclassAdvancementOnClaim as sharedResolveSubclassAdvancementOnClaim,

  type SkillClaimContext,

  type SkillDependencies,

  type SkillRevealState,

} from "@bloodline/shared/skills";

import {

  getCharacterSkillPointsPool,

  SKILL_GRID_SIZE,

  DEFAULT_NODE_RADIUS,

  NODE_RADIUS_BY_TYPE,

  CLASS_ACCENT_COLORS,

} from "@bloodline/shared/constants";



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



const skillDeps: SkillDependencies = {

  getSkillById: (skillId) => skillsMap.get(skillId),

  getSubclassById: (subclassId) => subclassesMap.get(subclassId),

};



export function getSkillById(skillId: string): SkillNode | undefined {

  return skillsMap.get(skillId);

}



export function getSubclassById(subclassId: string): SubclassData | undefined {

  return subclassesMap.get(subclassId);

}



export function getSubclassChain(subclassId: string | null | undefined): string[] {

  return sharedGetSubclassChain(subclassId, skillDeps);

}



export function getSubclassesForClass(classId: string, tier?: number): SubclassData[] {

  return SUBCLASSES.filter((subclass) => {

    const matchesClass =

      subclass.baseClassId === classId ||

      (subclass.alternateBaseClassIds?.includes(classId) ?? false);

    return matchesClass && (tier === undefined || subclass.tier === tier);

  });

}



export {

  subclassMatchesClass,

  getAdvanceRequires,

  getClassTreeRetention,

} from "@bloodline/shared/skills";



export function getBloodlineSkillPoints(lineage: Lineage): number {

  return sharedGetBloodlineSkillPoints(lineage);

}



export function getUsedSkillPoints(skillIds: string[]): number {

  return sharedGetUsedSkillPoints(skillIds, skillDeps);

}



export function getCharacterSkillPoints(heir: Heir): number {

  return getCharacterSkillPointsPool(heir.level) - getUsedSkillPoints(heir.skillIds);

}



export function getBloodlinePointsRemaining(lineage: Lineage): number {

  const owned = lineage.bloodlineSkillIds ?? [];

  return getBloodlineSkillPoints(lineage) - getUsedSkillPoints(owned);

}



export function getCommittedBranchRoot(heir: Heir): string | null {

  return sharedGetCommittedBranchRoot(heir, skillDeps);

}



export function isSubclassBranchUnlocked(heir: Heir, rootId: string): boolean {

  return sharedIsSubclassBranchUnlocked(heir, rootId, skillDeps);

}



export function getSkillRevealState(

  skill: SkillNode,

  heir: Heir,

  lineage: Lineage

): SkillRevealState {

  return sharedGetSkillRevealState(skill, heir, lineage);

}



export function resolveSubclassAdvancementOnClaim(

  heir: Heir,

  skill: SkillNode

): { subclassId: string; subclassTier: number } | null {

  return sharedResolveSubclassAdvancementOnClaim(heir, skill, skillDeps);

}



export function filterCharacterSkills(heir: Heir): SkillNode[] {

  const chain = getSubclassChain(heir.subclassId);



  return CHARACTER_SKILLS.filter((skill) => {

    if (skill.classTags.length > 0 && !skill.classTags.includes(heir.classId)) {

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



    if (skill.originClassTags?.length && !skill.originClassTags.includes(heir.classId)) {

      return false;

    }



    return true;

  });

}



export function getCharacterWebSkills(heir: Heir, lineage: Lineage): SkillNode[] {

  return sharedGetCharacterWebSkills(heir, lineage, CHARACTER_SKILLS, skillDeps);

}



export function filterBloodlineSkills(): SkillNode[] {

  return BLOODLINE_SKILLS;

}



export type { SkillClaimContext };



export function canClaimSkill(

  skill: SkillNode,

  context: SkillClaimContext

): { canClaim: boolean; reason?: string } {

  return sharedCanClaimSkill(skill, context, skillDeps);

}



export function canAdvanceSubclass(

  subclass: SubclassData,

  heir: Heir

): { canAdvance: boolean; reason?: string } {

  return sharedCanAdvanceSubclass(subclass, heir, skillDeps);

}



export { SKILL_GRID_SIZE, DEFAULT_NODE_RADIUS, NODE_RADIUS_BY_TYPE };



export const SKILL_NODE_RADIUS = DEFAULT_NODE_RADIUS;



export function skillToCanvasPosition(position: { x: number; y: number }): { x: number; y: number } {

  return {

    x: position.x * SKILL_GRID_SIZE,

    y: position.y * SKILL_GRID_SIZE,

  };

}



export function getNodeRadius(skill: SkillNode): number {

  const nodeType = skill.nodeType ?? "active";

  return NODE_RADIUS_BY_TYPE[nodeType] ?? DEFAULT_NODE_RADIUS;

}



export function computeAuthoredLayout(skills: SkillNode[]): Map<string, { x: number; y: number }> {

  const positions = new Map<string, { x: number; y: number }>();

  for (const skill of skills) {

    positions.set(skill.id, skillToCanvasPosition(skill.position));

  }

  return positions;

}



export function getSkillWebBounds(skills: SkillNode[]): {

  minX: number;

  minY: number;

  maxX: number;

  maxY: number;

} {

  if (skills.length === 0) {

    return { minX: 0, minY: 0, maxX: 480, maxY: 480 };

  }



  const positions = skills.map((skill) => skillToCanvasPosition(skill.position));

  const padding = DEFAULT_NODE_RADIUS * 3;



  return {

    minX: Math.min(...positions.map((pos) => pos.x)) - padding,

    minY: Math.min(...positions.map((pos) => pos.y)) - padding,

    maxX: Math.max(...positions.map((pos) => pos.x)) + padding,

    maxY: Math.max(...positions.map((pos) => pos.y)) + padding,

  };

}



export function getClassAccentColor(classId: string): string {

  return CLASS_ACCENT_COLORS[classId] ?? "#3b82f6";

}


