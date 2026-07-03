import { CHARACTER_SKILLS, BLOODLINE_SKILLS, SUBCLASSES } from "@/lib/skills";
import { buildBloodlineSkillTree, buildClassSkillTree } from "../buildSkillTreeData";
import type { SkillBranch, SkillEdgeDef, SkillNodeDef } from "../skillTreeTypes";
import {
  warriorBranches,
  warriorEdges,
  warriorNodes,
} from "./warriorTree";

export type SkillTreeData = {
  branches: SkillBranch[];
  nodes: SkillNodeDef[];
  edges: SkillEdgeDef[];
  title: string;
  subtitle: string;
};

const CLASS_TITLES: Record<string, string> = {
  warrior: "Warrior Skill Atlas",
  rogue: "Rogue Skill Atlas",
  mage: "Mage Skill Atlas",
  priest: "Priest Skill Atlas",
  ranger: "Ranger Skill Atlas",
};

export function getClassSkillTree(classId: string): SkillTreeData {
  if (classId === "warrior") {
    return {
      branches: warriorBranches,
      nodes: warriorNodes,
      edges: warriorEdges,
      title: CLASS_TITLES.warrior,
      subtitle: "Constellation passive map / subclass branches",
    };
  }

  const built = buildClassSkillTree(classId, CHARACTER_SKILLS, SUBCLASSES);
  return {
    ...built,
    title: CLASS_TITLES[classId] ?? `${classId} Skill Atlas`,
    subtitle: "Class constellation / subclass branches",
  };
}

export function getBloodlineSkillTree(): SkillTreeData {
  const built = buildBloodlineSkillTree(BLOODLINE_SKILLS);
  return {
    ...built,
    title: "Bloodline Legacy",
    subtitle: "Permanent family upgrades across generations",
  };
}
