import { rankIndex } from "../constants.js";
import type {
  AdventurerRank,
  Heir,
  Lineage,
  MissionRandomEvent,
  MissionSecretEvent,
  MissionSetting,
  MissionTemplate,
  MissionTone,
  MissionUniqueEvent,
} from "../types.js";

export interface MissionInterludePools {
  randomEvents: MissionRandomEvent[];
  secretEvents: MissionSecretEvent[];
  uniqueEvents: MissionUniqueEvent[];
}

export interface InterludeEligibilityContext {
  mission: MissionTemplate;
  lineage: Pick<Lineage, "generation" | "publicSummary">;
  heir: Pick<Heir, "level" | "stats" | "classId" | "generation" | "completedMissionIds">;
  adventurerRank: AdventurerRank;
}

function missionSetting(mission: MissionTemplate): MissionSetting {
  return mission.campaign.setting ?? "wilderness";
}

function missionTone(mission: MissionTemplate): MissionTone {
  return mission.campaign.tone ?? "moderate";
}

function meetsStatOrClassGate(
  req: {
    requiredClassIds?: string[];
    requiredStats?: Partial<Record<keyof Heir["stats"], number>>;
    classOrStatGate?: boolean;
  },
  heir: Pick<Heir, "stats" | "classId">
): boolean {
  const classMatch =
    req.requiredClassIds?.length &&
    req.requiredClassIds.includes(heir.classId);
  const stats = req.requiredStats;
  const statsMet =
    stats &&
    Object.entries(stats).every(
      ([stat, min]) => (heir.stats[stat as keyof Heir["stats"]] ?? 0) >= (min ?? 0)
    );

  if (req.classOrStatGate && req.requiredClassIds?.length && stats) {
    return Boolean(classMatch || statsMet);
  }
  if (req.requiredClassIds?.length && !classMatch) {
    return false;
  }
  if (stats && !statsMet) {
    return false;
  }
  return true;
}

function meetsRequirements(
  req: {
    settings?: MissionSetting[];
    tones?: MissionTone[];
    minHeirLevel?: number;
    minAdventurerRank?: AdventurerRank;
    requiresMissionCompleted?: string[];
    generationAtLeast?: number;
    requiredClassIds?: string[];
    requiredStats?: Partial<Record<keyof Heir["stats"], number>>;
    classOrStatGate?: boolean;
    minInfamy?: number;
    maxInfamy?: number;
    deadHeirsAtLeast?: number;
  },
  ctx: InterludeEligibilityContext
): boolean {
  const setting = missionSetting(ctx.mission);
  const tone = missionTone(ctx.mission);

  if (req.settings?.length && !req.settings.includes(setting)) {
    return false;
  }
  if (req.tones?.length && !req.tones.includes(tone)) {
    return false;
  }
  if (req.minHeirLevel && ctx.heir.level < req.minHeirLevel) {
    return false;
  }
  if (
    req.minAdventurerRank &&
    rankIndex(ctx.adventurerRank) < rankIndex(req.minAdventurerRank)
  ) {
    return false;
  }
  if (req.requiresMissionCompleted?.length) {
    const done = new Set(ctx.heir.completedMissionIds ?? []);
    if (!req.requiresMissionCompleted.every((id) => done.has(id))) {
      return false;
    }
  }
  if (
    req.generationAtLeast &&
    Math.max(ctx.lineage.generation, ctx.heir.generation) < req.generationAtLeast
  ) {
    return false;
  }
  if (
    req.deadHeirsAtLeast &&
    (ctx.lineage.publicSummary.deadHeirs ?? 0) < req.deadHeirsAtLeast
  ) {
    return false;
  }
  if (req.minInfamy !== undefined && (ctx.heir.stats.infamy ?? 0) < req.minInfamy) {
    return false;
  }
  if (req.maxInfamy !== undefined && (ctx.heir.stats.infamy ?? 0) > req.maxInfamy) {
    return false;
  }
  if (!meetsStatOrClassGate(req, ctx.heir)) {
    return false;
  }
  return true;
}

export function filterEligibleRandomEvents(
  pools: MissionInterludePools,
  ctx: InterludeEligibilityContext
): MissionRandomEvent[] {
  const inline = ctx.mission.campaign.randomPool ?? [];
  const global = pools.randomEvents.filter((event) => meetsRequirements(event, ctx));
  return [...inline, ...global];
}

export function filterEligibleUniqueEvents(
  pools: MissionInterludePools,
  ctx: InterludeEligibilityContext
): MissionUniqueEvent[] {
  return pools.uniqueEvents.filter((event) => meetsRequirements(event, ctx));
}

export function filterEligibleSecretEvents(
  pools: MissionInterludePools,
  ctx: InterludeEligibilityContext
): MissionSecretEvent[] {
  const inline = ctx.mission.campaign.secretEvents ?? [];
  const global = pools.secretEvents.filter((event) => meetsRequirements(event, ctx));
  return [...inline, ...global];
}
