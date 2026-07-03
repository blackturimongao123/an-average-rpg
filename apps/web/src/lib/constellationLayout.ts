import type { SkillNode } from "@bloodline/shared/types";
import { SKILL_GRID_SIZE } from "@bloodline/shared/constants";
import { getNodeRadius } from "@/lib/skills";

const LABEL_CLEARANCE = 28;
const COLLISION_ITERATIONS = 32;

function minPairDistance(skillA: SkillNode, skillB: SkillNode): number {
  return getNodeRadius(skillA) + getNodeRadius(skillB) + LABEL_CLEARANCE;
}

function resolveCollisions(
  positions: Map<string, { x: number; y: number }>,
  skillsById: Map<string, SkillNode>
): void {
  const ids = [...positions.keys()];

  for (let iteration = 0; iteration < COLLISION_ITERATIONS; iteration += 1) {
    let moved = false;

    for (let i = 0; i < ids.length; i += 1) {
      for (let j = i + 1; j < ids.length; j += 1) {
        const firstId = ids[i];
        const secondId = ids[j];
        const first = positions.get(firstId)!;
        const second = positions.get(secondId)!;
        const skillA = skillsById.get(firstId);
        const skillB = skillsById.get(secondId);
        const minDistance =
          skillA && skillB ? minPairDistance(skillA, skillB) : getNodeRadius(skillA ?? skillB!) * 2 + 40;

        const dx = second.x - first.x;
        const dy = second.y - first.y;
        const distance = Math.hypot(dx, dy) || 0.01;

        if (distance >= minDistance) {
          continue;
        }

        const push = (minDistance - distance) / 2;
        const nx = dx / distance;
        const ny = dy / distance;

        positions.set(firstId, { x: first.x - nx * push, y: first.y - ny * push });
        positions.set(secondId, { x: second.x + nx * push, y: second.y + ny * push });
        moved = true;
      }
    }

    if (!moved) {
      break;
    }
  }
}

/** Authored grid coords → canvas pixels with collision separation. */
export function computeConstellationLayout(
  skills: SkillNode[],
  options?: { hideCoreSkillId?: string }
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const skillsById = new Map(skills.map((skill) => [skill.id, skill]));

  for (const skill of skills) {
    if (options?.hideCoreSkillId && skill.id === options.hideCoreSkillId) {
      positions.set(skill.id, { x: 0, y: 0 });
      continue;
    }

    positions.set(skill.id, {
      x: skill.position.x * SKILL_GRID_SIZE,
      y: skill.position.y * SKILL_GRID_SIZE,
    });
  }

  resolveCollisions(positions, skillsById);
  return positions;
}

export function getConstellationBounds(
  positions: Map<string, { x: number; y: number }>,
  skills: SkillNode[]
): { minX: number; minY: number; maxX: number; maxY: number } {
  const visible = skills.filter((skill) => positions.has(skill.id));
  if (visible.length === 0) {
    return { minX: -400, minY: -400, maxX: 400, maxY: 400 };
  }

  const padding =
    Math.max(...visible.map((skill) => getNodeRadius(skill))) + 48;

  const coords = visible.map((skill) => positions.get(skill.id)!);

  return {
    minX: Math.min(...coords.map((pos) => pos.x)) - padding,
    minY: Math.min(...coords.map((pos) => pos.y)) - padding,
    maxX: Math.max(...coords.map((pos) => pos.x)) + padding,
    maxY: Math.max(...coords.map((pos) => pos.y)) + padding,
  };
}
