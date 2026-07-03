import type { Heir, Lineage } from "@bloodline/shared/types";
import type { ResolvedSkillNode } from "./skillTreeTypes";
import type { PlayerSkillState } from "./skillTreeTypes";
import { getSkillById, getSkillRevealState } from "@/lib/skills";
import classesData from "@game-data/classes.json";

const STARTING_SKILLS_BY_CLASS = new Map(
  (classesData.classes as Array<{ id: string; startingSkills: string[] }>).map((cls) => [
    cls.id,
    cls.startingSkills,
  ])
);

const ORIGIN_SUFFIX = "_origin";

export function isOriginNodeId(nodeId: string): boolean {
  return nodeId.endsWith(ORIGIN_SUFFIX);
}

export function buildPlayerSkillState(
  heir: Heir,
  lineage: Lineage,
  ownedSkillIds: string[],
  treeScope: "character" | "bloodline"
): PlayerSkillState {
  const discoveredHiddenNodeIds: string[] = [];

  for (const skillId of ownedSkillIds) {
    const skill = getSkillById(skillId);
    if (skill?.isHidden && getSkillRevealState(skill, heir, lineage) !== "hidden") {
      discoveredHiddenNodeIds.push(skillId);
    }
  }

  const unlocked = new Set(ownedSkillIds);

  if (treeScope === "character") {
    unlocked.add(`${heir.classId}${ORIGIN_SUFFIX}`);
    for (const skillId of STARTING_SKILLS_BY_CLASS.get(heir.classId) ?? []) {
      unlocked.add(skillId);
    }
  } else {
    unlocked.add("bloodline_root");
  }

  return {
    unlockedNodeIds: [...unlocked],
    discoveredHiddenNodeIds,
  };
}

export function resolveClaimableSkillId(node: ResolvedSkillNode): string | null {
  if (node.kind === "origin") return null;
  if (isOriginNodeId(node.id)) return null;
  return node.id;
}

export function isNodeInGameData(nodeId: string): boolean {
  return getSkillById(nodeId) != null;
}
