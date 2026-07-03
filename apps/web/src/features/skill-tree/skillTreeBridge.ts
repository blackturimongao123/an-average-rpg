import type { Heir, Lineage } from "@bloodline/shared/types";
import type {
  PlayerSkillState,
  ResolvedSkillNode,
  SkillBranch,
  SkillNodeDef,
} from "./skillTreeTypes";
import { getSkillById, getSkillRevealState, isSubclassBranchUnlocked } from "@/lib/skills";
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

export function buildDiscoveredBranchIds(
  heir: Heir,
  branches: SkillBranch[],
  nodes: SkillNodeDef[],
  unlockedIds: string[]
): string[] {
  const unlocked = new Set(unlockedIds);
  const discovered = new Set<string>(["core"]);

  for (const branch of branches) {
    if (branch.id === "core") {
      continue;
    }

    if (isSubclassBranchUnlocked(heir, branch.id)) {
      discovered.add(branch.id);
      continue;
    }

    const ownsBranchSkill = nodes.some(
      (node) =>
        node.branchId === branch.id &&
        node.kind !== "origin" &&
        unlocked.has(node.id)
    );
    if (ownsBranchSkill) {
      discovered.add(branch.id);
      continue;
    }

    const gate = nodes.find(
      (node) => node.branchId === branch.id && node.kind === "subclassGate"
    );
    if (gate && gate.requires.every((requiredId) => unlocked.has(requiredId))) {
      discovered.add(branch.id);
      continue;
    }

    const entryNodes = nodes.filter(
      (node) =>
        node.branchId === branch.id &&
        node.kind !== "origin" &&
        node.kind !== "subclassGate" &&
        node.requires.every((requiredId) => {
          const required = nodes.find((candidate) => candidate.id === requiredId);
          return required?.branchId === "core" && unlocked.has(requiredId);
        })
    );
    if (entryNodes.some((node) => node.requires.every((requiredId) => unlocked.has(requiredId)))) {
      discovered.add(branch.id);
    }
  }

  return [...discovered];
}

export function buildPlayerSkillState(
  heir: Heir,
  lineage: Lineage,
  ownedSkillIds: string[],
  treeScope: "character" | "bloodline",
  branches: SkillBranch[] = [],
  nodes: SkillNodeDef[] = []
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

  const unlockedNodeIds = [...unlocked];
  const discoveredBranchIds =
    treeScope === "bloodline"
      ? branches.map((branch) => branch.id)
      : buildDiscoveredBranchIds(heir, branches, nodes, unlockedNodeIds);

  return {
    unlockedNodeIds,
    discoveredHiddenNodeIds,
    discoveredBranchIds,
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

export function isBranchDiscovered(
  branchId: string,
  discoveredBranchIds: string[]
): boolean {
  return discoveredBranchIds.includes(branchId);
}
