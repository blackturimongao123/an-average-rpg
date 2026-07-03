import type { SkillNode, SubclassData } from "@bloodline/shared/types";
import type {
  BranchMotif,
  NodeKind,
  SkillBranch,
  SkillEdgeDef,
  SkillNodeDef,
} from "./skillTreeTypes";

const BRANCH_PALETTES: Array<{ color: string; secondaryColor: string; motif: BranchMotif }> = [
  { color: "#ff4a2f", secondaryColor: "#75170f", motif: "embers" },
  { color: "#4aa3ff", secondaryColor: "#183b66", motif: "steel" },
  { color: "#ffe7a3", secondaryColor: "#4d7cff", motif: "holy" },
  { color: "#b05cff", secondaryColor: "#552377", motif: "royal" },
  { color: "#d9e6f2", secondaryColor: "#9c7a35", motif: "steel" },
  { color: "#5ce0a8", secondaryColor: "#1a5c3f", motif: "nature" },
  { color: "#c77dff", secondaryColor: "#4a1f66", motif: "arcane" },
  { color: "#8899aa", secondaryColor: "#2a3340", motif: "shadow" },
];

const CLASS_META: Record<string, { label: string; icon: string; accent: string }> = {
  warrior: { label: "Warrior", icon: "⚔", accent: "#d6a441" },
  rogue: { label: "Rogue", icon: "🗡", accent: "#7b8f6e" },
  mage: { label: "Mage", icon: "✦", accent: "#6b8cff" },
  priest: { label: "Priest", icon: "✚", accent: "#e8d48b" },
  ranger: { label: "Ranger", icon: "◎", accent: "#5a9e6f" },
};

function mapNodeKind(skill: SkillNode): NodeKind {
  if (skill.isHidden) return "hidden";
  if (skill.nodeType === "special") return "special";
  if (skill.nodeType === "active") return "active";
  if (skill.nodeType === "passive") return "passive";
  if (skill.nodeType === "minor") return "minor";
  if ((skill.tier ?? 0) >= 5) return "capstone";
  return "passive";
}

function grantsToEffects(skill: SkillNode): { label: string }[] {
  if (skill.grants?.length) {
    return skill.grants.map((grant) => ({
      label: grant.name ?? grant.id ?? grant.effectType,
    }));
  }
  return [{ label: skill.description.slice(0, 60) }];
}

function buildSubclassBranches(
  classId: string,
  subclasses: SubclassData[]
): SkillBranch[] {
  const tier1 = subclasses.filter((s) => s.tier === 1);
  const sector = tier1.length > 0 ? 360 / tier1.length : 60;

  const branches: SkillBranch[] = [
    {
      id: "core",
      label: `${CLASS_META[classId]?.label ?? classId} Core`,
      angleStart: 0,
      angleEnd: 360,
      color: CLASS_META[classId]?.accent ?? "#d6a441",
      secondaryColor: "#3a2a10",
      motif: "core",
    },
  ];

  tier1.forEach((subclass, index) => {
    const palette = BRANCH_PALETTES[index % BRANCH_PALETTES.length];
    const angleStart = index * sector;
    const angleEnd = angleStart + sector;

    branches.push({
      id: subclass.id,
      label: subclass.name,
      angleStart,
      angleEnd,
      color: palette.color,
      secondaryColor: palette.secondaryColor,
      motif: palette.motif,
    });
  });

  return branches;
}

function resolveBranchId(skill: SkillNode, tier1SubclassIds: Set<string>): string {
  const tag = skill.subclassTags?.[0];
  if (tag && tier1SubclassIds.has(tag)) return tag;

  for (const subclassTag of skill.subclassTags ?? []) {
    if (tier1SubclassIds.has(subclassTag)) return subclassTag;
  }

  return "core";
}

function ringForSkill(skill: SkillNode, isGate = false): number {
  if (isGate) return 3;
  const tier = skill.tier ?? 1;
  if (tier <= 0) return 1;
  if (tier === 1) return 2;
  if (tier === 2) return 4;
  if (tier === 3) return 5;
  if (tier >= 4) return 6;
  return Math.min(tier + 1, 6);
}

export function buildClassSkillTree(
  classId: string,
  skills: SkillNode[],
  subclasses: SubclassData[]
): { branches: SkillBranch[]; nodes: SkillNodeDef[]; edges: SkillEdgeDef[] } {
  const classSkills = skills.filter(
    (skill) =>
      (skill.treeScope ?? "character") === "character" &&
      (skill.classTags.length === 0 || skill.classTags.includes(classId))
  );

  const classSubclasses = subclasses.filter(
    (s) =>
      s.baseClassId === classId || (s.alternateBaseClassIds?.includes(classId) ?? false)
  );
  const tier1Ids = new Set(
    classSubclasses.filter((s) => s.tier === 1).map((s) => s.id)
  );

  const branches = buildSubclassBranches(classId, classSubclasses);
  const meta = CLASS_META[classId] ?? { label: classId, icon: "✦", accent: "#d6a441" };
  const originId = `${classId}_origin`;

  const nodes: SkillNodeDef[] = [
    {
      id: originId,
      label: meta.label,
      kind: "origin",
      branchId: "core",
      ring: 0,
      cost: 0,
      icon: meta.icon,
      requires: [],
      description: `The root of the ${meta.label} class.`,
      effects: [{ label: `Unlocks ${meta.label} Core` }],
    },
  ];

  const branchLanes = new Map<string, number>();

  for (const skill of classSkills) {
    if (skill.id === "basic_combat" && classId !== "warrior") {
      // basic_combat is shared; keep on core
    }

    const branchId = resolveBranchId(skill, tier1Ids);
    const laneKey = `${branchId}-${skill.tier ?? 1}`;
    const lane = branchLanes.get(laneKey) ?? 0;
    branchLanes.set(laneKey, lane + 1);

    const requires =
      skill.requires.length > 0
        ? skill.requires
        : skill.id === "basic_combat"
          ? [originId]
          : [];

    nodes.push({
      id: skill.id,
      label: skill.name,
      kind: mapNodeKind(skill),
      branchId,
      ring: ringForSkill(skill),
      lane: lane - 1,
      cost: skill.cost,
      icon: skill.nodeType === "active" ? "✦" : skill.nodeType === "special" ? "✹" : "◆",
      requires,
      blocks: skill.blocks,
      description: skill.description,
      effects: grantsToEffects(skill),
      hiddenUntil: skill.isHidden ? skill.specialRequirement : undefined,
    });
  }

  const edges: SkillEdgeDef[] = [];
  for (const node of nodes) {
    for (const requiredId of node.requires) {
      edges.push({ from: requiredId, to: node.id });
    }
  }

  return { branches, nodes, edges };
}

export function buildBloodlineSkillTree(skills: SkillNode[]): {
  branches: SkillBranch[];
  nodes: SkillNodeDef[];
  edges: SkillEdgeDef[];
} {
  const bloodlineSkills = skills.filter((s) => s.treeScope === "bloodline");
  const branches: SkillBranch[] = [
    {
      id: "core",
      label: "Bloodline Legacy",
      angleStart: 0,
      angleEnd: 360,
      color: "#c9a227",
      secondaryColor: "#5c4510",
      motif: "royal",
    },
  ];

  const nodes: SkillNodeDef[] = bloodlineSkills.map((skill) => {
    const isRoot = skill.id === "bloodline_root";
    const tier = skill.tier ?? 1;
    const angleFromPos =
      skill.position != null
        ? ((Math.atan2(skill.position.y, skill.position.x) * 180) / Math.PI + 90 + 360) % 360
        : undefined;

    return {
      id: skill.id,
      label: skill.name,
      kind: isRoot ? "origin" : mapNodeKind(skill),
      branchId: "core",
      ring: isRoot ? 0 : Math.max(1, tier),
      angleDeg: angleFromPos,
      cost: skill.cost,
      icon: isRoot ? "♛" : skill.nodeType === "special" ? "✹" : "✦",
      requires: skill.requires,
      blocks: skill.blocks,
      description: skill.description,
      effects: grantsToEffects(skill),
      hiddenUntil: skill.isHidden ? skill.specialRequirement : undefined,
    };
  });

  const edges: SkillEdgeDef[] = [];
  for (const node of nodes) {
    for (const requiredId of node.requires) {
      edges.push({ from: requiredId, to: node.id });
      if (node.hiddenUntil) {
        edges[edges.length - 1] = {
          ...edges[edges.length - 1],
          hiddenUntilNodeId: node.id,
        };
      }
    }
  }

  return { branches, nodes, edges };
}
