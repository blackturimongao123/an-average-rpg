// src/features/skill-tree/skillTreeTypes.ts

export type NodeKind =
  | "origin"
  | "minor"
  | "passive"
  | "active"
  | "special"
  | "subclassGate"
  | "capstone"
  | "hidden";

export type NodeState =
  | "locked"
  | "available"
  | "unlocked"
  | "blocked"
  | "hidden";

export type EdgeState =
  | "locked"
  | "available"
  | "unlocked"
  | "blocked"
  | "hidden";

export type BranchMotif =
  | "core"
  | "embers"
  | "steel"
  | "holy"
  | "royal"
  | "shadow"
  | "arcane"
  | "nature";

export type SkillEffect = {
  label: string;
  value?: number | string;
};

export type SkillBranch = {
  id: string;
  label: string;

  /**
   * 0 degrees points upward.
   * 90 degrees points right.
   * 180 degrees points downward.
   * 270 degrees points left.
   */
  angleStart: number;
  angleEnd: number;

  color: string;
  secondaryColor: string;
  motif: BranchMotif;
};

export type SkillNodeDef = {
  id: string;
  label: string;
  kind: NodeKind;
  branchId: string;

  /**
   * Ring controls distance from the origin.
   * 0 = center, 1 = close to center, 5+ = far outer tree.
   */
  ring: number;

  /**
   * Lane offsets the node within its branch sector.
   * Example: -2, -1, 0, 1, 2.
   */
  lane?: number;

  /**
   * Optional fixed angle. Use this for hand-placed core nodes.
   */
  angleDeg?: number;

  /**
   * Optional manual offset for polishing layout.
   */
  offsetX?: number;
  offsetY?: number;

  cost: number;
  icon?: string;

  requires: string[];
  blocks?: string[];

  description: string;
  effects: SkillEffect[];

  /**
   * If present, the node appears as a hidden shadow node
   * until this discovery flag is unlocked by the player.
   */
  hiddenUntil?: string;
};

export type ResolvedSkillNode = SkillNodeDef & {
  state: NodeState;
};

export type SkillEdgeDef = {
  id?: string;
  from: string;
  to: string;

  /**
   * If present, this edge is invisible until the hidden node is discovered.
   */
  hiddenUntilNodeId?: string;
};

export type ResolvedSkillEdge = Required<Pick<SkillEdgeDef, "id">> &
  Omit<SkillEdgeDef, "id"> & {
    state: EdgeState;
    branchId: string;
  };

export type PlayerSkillState = {
  unlockedNodeIds: string[];
  discoveredHiddenNodeIds: string[];
  /** Subclass branch sectors visible on the map (`core` is always shown). */
  discoveredBranchIds: string[];
};

export type Point = {
  x: number;
  y: number;
};
