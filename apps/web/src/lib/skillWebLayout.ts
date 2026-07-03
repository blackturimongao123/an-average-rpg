import type { SkillNode } from "@bloodline/shared/types";

/** Uniform radial distance between skill tiers (pixels). */
export const LAYOUT_RING_SPACING = 148;

export const SKILL_NODE_RADIUS = 38;

export const SKILL_LABEL_GAP = 10;

const MIN_NODE_DISTANCE = SKILL_NODE_RADIUS * 2 + 56;

export function computeSkillWebLayout(skills: SkillNode[]): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const angles = new Map<string, number>();

  if (skills.length === 0) {
    return positions;
  }

  const skillMap = new Map(skills.map((skill) => [skill.id, skill]));
  const skillIds = new Set(skills.map((skill) => skill.id));
  const children = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const skill of skills) {
    inDegree.set(skill.id, 0);
  }

  for (const skill of skills) {
    const parents = skill.requires.filter((id) => skillIds.has(id));
    inDegree.set(skill.id, parents.length);

    for (const parentId of parents) {
      if (!children.has(parentId)) {
        children.set(parentId, []);
      }
      children.get(parentId)!.push(skill.id);
    }
  }

  const roots = skills
    .filter((skill) => (inDegree.get(skill.id) ?? 0) === 0)
    .sort((left, right) => left.name.localeCompare(right.name));

  const primaryRoot =
    roots.find((skill) => skill.id === "basic_combat") ??
    roots.find((skill) => skill.tier === 0) ??
    roots[0];

  function sortChildren(ids: string[]): string[] {
    return [...ids].sort((leftId, rightId) => {
      const left = skillMap.get(leftId)!;
      const right = skillMap.get(rightId)!;
      const leftBranch = left.subclassTags?.[0] ?? left.classTags[0] ?? left.name;
      const rightBranch = right.subclassTags?.[0] ?? right.classTags[0] ?? right.name;
      return leftBranch.localeCompare(rightBranch) || left.name.localeCompare(right.name);
    });
  }

  function placeNode(nodeId: string, angle: number, depth: number) {
    angles.set(nodeId, angle);
    const radius = depth * LAYOUT_RING_SPACING;
    positions.set(nodeId, {
      x: Math.sin(angle) * radius,
      y: -Math.cos(angle) * radius,
    });
  }

  function assignSubtree(nodeId: string, angleStart: number, angleEnd: number, depth: number) {
    const angle = (angleStart + angleEnd) / 2;
    placeNode(nodeId, angle, depth);

    const kids = sortChildren(children.get(nodeId) ?? []);
    if (kids.length === 0) {
      return;
    }

    const slice = (angleEnd - angleStart) / kids.length;
    kids.forEach((childId, index) => {
      assignSubtree(
        childId,
        angleStart + index * slice,
        angleStart + (index + 1) * slice,
        depth + 1
      );
    });
  }

  if (primaryRoot) {
    assignSubtree(primaryRoot.id, -Math.PI, Math.PI, 0);
  }

  // Nodes with multiple parents or disconnected components.
  let progress = true;
  while (progress) {
    progress = false;

    for (const skill of skills) {
      if (positions.has(skill.id)) {
        continue;
      }

      const parents = skill.requires.filter(
        (id) => skillIds.has(id) && positions.has(id)
      );

      if (parents.length === 0) {
        continue;
      }

      const parentDepths = parents.map((parentId) => {
        const parentPos = positions.get(parentId)!;
        return Math.round(Math.hypot(parentPos.x, parentPos.y) / LAYOUT_RING_SPACING);
      });
      const depth = Math.max(...parentDepths) + 1;
      const avgAngle =
        parents.reduce((sum, parentId) => sum + (angles.get(parentId) ?? 0), 0) / parents.length;

      placeNode(skill.id, avgAngle, depth);
      progress = true;
    }
  }

  const unplaced = skills.filter((skill) => !positions.has(skill.id));
  if (unplaced.length > 0) {
    const maxDepth = Math.max(
      1,
      ...[...positions.values()].map((pos) =>
        Math.round(Math.hypot(pos.x, pos.y) / LAYOUT_RING_SPACING)
      )
    );

    unplaced.forEach((skill, index) => {
      const angle = (2 * Math.PI * index) / unplaced.length - Math.PI / 2;
      placeNode(skill.id, angle, maxDepth + 1);
    });
  }

  resolveCollisions(positions);
  return positions;
}

function resolveCollisions(positions: Map<string, { x: number; y: number }>) {
  const ids = [...positions.keys()];

  for (let iteration = 0; iteration < 24; iteration += 1) {
    let moved = false;

    for (let i = 0; i < ids.length; i += 1) {
      for (let j = i + 1; j < ids.length; j += 1) {
        const first = positions.get(ids[i])!;
        const second = positions.get(ids[j])!;
        const dx = second.x - first.x;
        const dy = second.y - first.y;
        const distance = Math.hypot(dx, dy) || 0.01;

        if (distance >= MIN_NODE_DISTANCE) {
          continue;
        }

        const push = (MIN_NODE_DISTANCE - distance) / 2;
        const nx = dx / distance;
        const ny = dy / distance;

        positions.set(ids[i], { x: first.x - nx * push, y: first.y - ny * push });
        positions.set(ids[j], { x: second.x + nx * push, y: second.y + ny * push });
        moved = true;
      }
    }

    if (!moved) {
      break;
    }
  }
}

export function getLayoutBounds(
  positions: Map<string, { x: number; y: number }>
): { minX: number; minY: number; maxX: number; maxY: number } {
  if (positions.size === 0) {
    return { minX: -400, minY: -400, maxX: 400, maxY: 400 };
  }

  const coords = [...positions.values()];
  const labelPadding = SKILL_NODE_RADIUS + 36;

  return {
    minX: Math.min(...coords.map((pos) => pos.x)) - labelPadding,
    minY: Math.min(...coords.map((pos) => pos.y)) - labelPadding,
    maxX: Math.max(...coords.map((pos) => pos.x)) + labelPadding,
    maxY: Math.max(...coords.map((pos) => pos.y)) + labelPadding,
  };
}
