// src/features/skill-tree/skillTreeLayout.ts

import type {
  Point,
  SkillBranch,
  SkillNodeDef,
} from "./skillTreeTypes";

export const TREE_CENTER: Point = {
  x: 0,
  y: 0,
};

export const RING_SPACING = 210;
export const LANE_SPACING_DEGREES = 12;

export const NODE_SIZE = {
  origin: 104,
  subclassGate: 76,
  capstone: 88,
  special: 68,
  active: 58,
  passive: 50,
  hidden: 58,
  minor: 34,
} as const;

export function normalizeAngle(angle: number): number {
  const result = angle % 360;
  return result < 0 ? result + 360 : result;
}

export function getBranchCenterAngle(branch: SkillBranch): number {
  let start = branch.angleStart;
  let end = branch.angleEnd;

  if (end < start) {
    end += 360;
  }

  return normalizeAngle((start + end) / 2);
}

export function polarToCartesian(
  center: Point,
  radius: number,
  angleDegrees: number
): Point {
  const radians = ((angleDegrees - 90) * Math.PI) / 180;

  return {
    x: center.x + radius * Math.cos(radians),
    y: center.y + radius * Math.sin(radians),
  };
}

export function getNodePosition(
  node: SkillNodeDef,
  branch: SkillBranch
): Point {
  if (node.kind === "origin" || node.ring === 0) {
    return {
      x: TREE_CENTER.x + (node.offsetX ?? 0),
      y: TREE_CENTER.y + (node.offsetY ?? 0),
    };
  }

  const angle =
    node.angleDeg ??
    getBranchCenterAngle(branch) + (node.lane ?? 0) * LANE_SPACING_DEGREES;

  const radius = node.ring * RING_SPACING;

  const point = polarToCartesian(TREE_CENTER, radius, angle);

  return {
    x: point.x + (node.offsetX ?? 0),
    y: point.y + (node.offsetY ?? 0),
  };
}

export function getBranchAuraPosition(branch: SkillBranch): Point {
  const angle = getBranchCenterAngle(branch);
  return polarToCartesian(TREE_CENTER, 720, angle);
}

export function getCurvedEdgePath(from: Point, to: Point): string {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;

  const vectorX = midX - TREE_CENTER.x;
  const vectorY = midY - TREE_CENTER.y;

  const length = Math.max(Math.sqrt(vectorX * vectorX + vectorY * vectorY), 1);

  const normalX = vectorX / length;
  const normalY = vectorY / length;

  const curveStrength = 70;

  const controlX = midX + normalX * curveStrength;
  const controlY = midY + normalY * curveStrength;

  return `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`;
}
