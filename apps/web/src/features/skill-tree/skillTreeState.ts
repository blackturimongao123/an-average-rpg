// src/features/skill-tree/skillTreeState.ts

import type {
  EdgeState,
  PlayerSkillState,
  ResolvedSkillEdge,
  ResolvedSkillNode,
  SkillEdgeDef,
  SkillNodeDef,
} from "./skillTreeTypes";

export function resolveSkillTreeState(
  nodes: SkillNodeDef[],
  edges: SkillEdgeDef[],
  playerState: PlayerSkillState
): {
  nodes: ResolvedSkillNode[];
  edges: ResolvedSkillEdge[];
} {
  const unlocked = new Set(playerState.unlockedNodeIds);
  const discoveredHidden = new Set(playerState.discoveredHiddenNodeIds);

  for (const node of nodes) {
    if (node.kind === "origin") {
      unlocked.add(node.id);
    }
  }

  const blocked = new Set<string>();

  for (const node of nodes) {
    if (!unlocked.has(node.id)) continue;

    for (const blockedNodeId of node.blocks ?? []) {
      blocked.add(blockedNodeId);
    }
  }

  const resolvedNodes: ResolvedSkillNode[] = nodes.map((node) => {
    if (node.hiddenUntil && !discoveredHidden.has(node.id)) {
      return {
        ...node,
        state: "hidden",
      };
    }

    if (unlocked.has(node.id)) {
      return {
        ...node,
        state: "unlocked",
      };
    }

    if (blocked.has(node.id)) {
      return {
        ...node,
        state: "blocked",
      };
    }

    const requirementsMet = node.requires.every((requiredId) =>
      unlocked.has(requiredId)
    );

    if (requirementsMet) {
      return {
        ...node,
        state: "available",
      };
    }

    return {
      ...node,
      state: "locked",
    };
  });

  const nodeById = new Map(resolvedNodes.map((node) => [node.id, node]));

  const resolvedEdges: ResolvedSkillEdge[] = edges.map((edge, index) => {
    const from = nodeById.get(edge.from);
    const to = nodeById.get(edge.to);

    if (!from || !to) {
      throw new Error(`Invalid skill edge: ${edge.from} -> ${edge.to}`);
    }

    let state: EdgeState = "locked";

    if (edge.hiddenUntilNodeId && !discoveredHidden.has(edge.hiddenUntilNodeId)) {
      state = "hidden";
    } else if (to.state === "blocked") {
      state = "blocked";
    } else if (from.state === "unlocked" && to.state === "unlocked") {
      state = "unlocked";
    } else if (from.state === "unlocked" && to.state === "available") {
      state = "available";
    } else {
      state = "locked";
    }

    return {
      ...edge,
      id: edge.id ?? `${edge.from}-${edge.to}-${index}`,
      state,
      branchId: to.branchId,
    };
  });

  return {
    nodes: resolvedNodes,
    edges: resolvedEdges,
  };
}
