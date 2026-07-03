import type { Heir, Lineage } from "./types.js";
import type { SkillNode, SubclassData } from "@bloodline/shared/types";
import {
  canAdvanceSubclass as sharedCanAdvanceSubclass,
  getBloodlineSkillPoints as sharedGetBloodlineSkillPoints,
  getUsedSkillPoints as sharedGetUsedSkillPoints,
  resolveSubclassAdvancementOnClaim as sharedResolveSubclassAdvancementOnClaim,
  validateSkillClaim as sharedValidateSkillClaim,
  type SkillDependencies,
} from "@bloodline/shared/skills";

import skillsData from "../../../game-data/skills.json";
import bloodlineSkillsData from "../../../game-data/bloodline-skills.json";
import subclassSkillsData from "../../../game-data/subclass-skills.json";
import subclassesData from "../../../game-data/subclasses.json";

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

const skillDeps: SkillDependencies = {
  getSkillById: (skillId: string) => skillsMap.get(skillId),
  getSubclassById: (subclassId: string) => subclassesMap.get(subclassId),
};

type SharedHeir = import("@bloodline/shared/types").Heir;
type SharedLineage = import("@bloodline/shared/types").Lineage;

function asSharedHeir(heir: Heir): SharedHeir {
  return heir as unknown as SharedHeir;
}

function asSharedLineage(lineage: Lineage): SharedLineage {
  return lineage as unknown as SharedLineage;
}

export function getSkillById(skillId: string): SkillNode | undefined {
  return skillsMap.get(skillId);
}

export function getSubclassById(subclassId: string): SubclassData | undefined {
  return subclassesMap.get(subclassId);
}

export function getSubclassChain(subclassId: string | null | undefined): string[] {
  const chain: string[] = [];
  if (!subclassId) return chain;
  let current = subclassesMap.get(subclassId);
  while (current) {
    chain.push(current.id);
    current = current.parentSubclassId ? subclassesMap.get(current.parentSubclassId) : undefined;
  }
  return chain;
}

export function canAdvanceSubclass(
  subclass: SubclassData,
  heir: Heir
): { canAdvance: boolean; reason?: string } {
  return sharedCanAdvanceSubclass(subclass, asSharedHeir(heir), skillDeps);
}

export function resolveSubclassAdvancementOnClaim(
  heir: Heir,
  skill: SkillNode
): { subclassId: string; subclassTier: number } | null {
  return sharedResolveSubclassAdvancementOnClaim(asSharedHeir(heir), skill, skillDeps);
}

export function validateSkillClaim(
  skill: SkillNode,
  heir: Heir,
  lineage: Lineage,
  ownedSkillIds: string[],
  treeScope: "character" | "bloodline"
): void {
  sharedValidateSkillClaim(
    skill,
    asSharedHeir(heir),
    asSharedLineage(lineage),
    ownedSkillIds,
    treeScope,
    skillDeps
  );
}

export function getUsedPoints(skillIds: string[]): number {
  return sharedGetUsedSkillPoints(skillIds, skillDeps);
}

export function getBloodlineSkillPoints(lineage: Lineage): number {
  return sharedGetBloodlineSkillPoints(asSharedLineage(lineage));
}
