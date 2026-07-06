import { rankIndex } from "../constants.js";
import type {
  AdventurerRank,
  Heir,
  Lineage,
  MissionBoardHiddenUntil,
  MissionTemplate,
} from "../types.js";

export interface MissionBoardEligibilityContext {
  lineage: Pick<Lineage, "generation" | "publicSummary">;
  heir: Pick<Heir, "level" | "stats" | "classId" | "completedMissionIds">;
  adventurerRank: AdventurerRank;
}

function meetsStatOrClassGate(
  gate: Pick<
    MissionBoardHiddenUntil,
    "requiredClassIds" | "requiredStats" | "classOrStatGate"
  >,
  heir: Pick<Heir, "stats" | "classId">
): boolean {
  const classMatch =
    gate.requiredClassIds?.length &&
    gate.requiredClassIds.includes(heir.classId);
  const stats = gate.requiredStats;
  const statsMet =
    stats &&
    Object.entries(stats).every(
      ([stat, min]) => (heir.stats[stat as keyof Heir["stats"]] ?? 0) >= (min ?? 0)
    );

  if (gate.classOrStatGate && gate.requiredClassIds?.length && stats) {
    return Boolean(classMatch || statsMet);
  }
  if (gate.requiredClassIds?.length && !classMatch) {
    return false;
  }
  if (stats && !statsMet) {
    return false;
  }
  return true;
}

export function meetsBoardHiddenUntil(
  hiddenUntil: MissionBoardHiddenUntil,
  ctx: MissionBoardEligibilityContext
): boolean {
  if (
    hiddenUntil.minAdventurerRank &&
    rankIndex(ctx.adventurerRank) < rankIndex(hiddenUntil.minAdventurerRank)
  ) {
    return false;
  }
  if (hiddenUntil.minHeirLevel && ctx.heir.level < hiddenUntil.minHeirLevel) {
    return false;
  }
  if (
    hiddenUntil.generationAtLeast &&
    ctx.lineage.generation < hiddenUntil.generationAtLeast
  ) {
    return false;
  }
  if (
    hiddenUntil.deadHeirsAtLeast &&
    (ctx.lineage.publicSummary.deadHeirs ?? 0) < hiddenUntil.deadHeirsAtLeast
  ) {
    return false;
  }
  if (
    hiddenUntil.minInfamy !== undefined &&
    (ctx.heir.stats.infamy ?? 0) < hiddenUntil.minInfamy
  ) {
    return false;
  }
  if (
    hiddenUntil.maxInfamy !== undefined &&
    (ctx.heir.stats.infamy ?? 0) > hiddenUntil.maxInfamy
  ) {
    return false;
  }

  const completed = new Set(ctx.heir.completedMissionIds ?? []);
  if (
    hiddenUntil.requiresMissionCompleted?.length &&
    !hiddenUntil.requiresMissionCompleted.every((id) => completed.has(id))
  ) {
    return false;
  }
  if (
    hiddenUntil.anyMissionCompleted?.length &&
    !hiddenUntil.anyMissionCompleted.some((id) => completed.has(id))
  ) {
    return false;
  }

  if (!meetsStatOrClassGate(hiddenUntil, ctx.heir)) {
    return false;
  }

  return true;
}

export function isMissionBoardEligible(
  mission: MissionTemplate,
  adventurerRank: AdventurerRank,
  heirLevel: number,
  ctx?: MissionBoardEligibilityContext
): boolean {
  if (
    mission.minAdventurerRank &&
    rankIndex(adventurerRank) < rankIndex(mission.minAdventurerRank)
  ) {
    return false;
  }
  if (mission.minHeirLevel && heirLevel < mission.minHeirLevel) {
    return false;
  }

  const hiddenUntil = mission.boardRequirements?.hiddenUntil;
  if (hiddenUntil) {
    if (!ctx) {
      return false;
    }
    if (!meetsBoardHiddenUntil(hiddenUntil, ctx)) {
      return false;
    }
  }

  return true;
}
