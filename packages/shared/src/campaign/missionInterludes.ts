import { rankIndex } from "../constants.js";
import type {
  AdventurerRank,
  CampaignRunState,
  Heir,
  Lineage,
  MissionCampaignChoice,
  MissionCampaignInterlude,
  MissionCampaignStep,
  MissionRandomEvent,
  MissionSecretCondition,
  MissionSecretEvent,
  MissionTemplate,
  MissionTone,
  MissionUniqueEvent,
} from "../types.js";
import { getChoicesForStep, inferEventType, stageCostForTimeCost } from "./adventureHelpers.js";
import type { MissionInterludePools } from "./missionInterludeEligibility.js";
import {
  filterEligibleRandomEvents,
  filterEligibleSecretEvents,
  filterEligibleUniqueEvents,
  type InterludeEligibilityContext,
} from "./missionInterludeEligibility.js";

export interface MissionInterludeContext {
  state: CampaignRunState;
  lineage: Pick<Lineage, "generation" | "publicSummary">;
  heir: Pick<Heir, "level" | "stats" | "classId" | "generation" | "completedMissionIds">;
  adventurerRank: AdventurerRank;
  completedFixedStepIndex: number;
  pools: MissionInterludePools;
}

function isCombatStep(step: MissionCampaignStep): boolean {
  if (step.combatEncounter?.monsterId) return true;
  return step.eventType === "combat";
}

function toneAllowsCombat(tone: MissionTone | undefined, step: MissionCampaignStep): boolean {
  if (tone !== "mild") return true;
  return !isCombatStep(step);
}

function randomEventToStep(
  event: MissionRandomEvent,
  mission: MissionTemplate
): MissionCampaignStep {
  const campaign = mission.campaign;
  return {
    title: event.title,
    text: event.text,
    eventType: event.eventType,
    timeCost: event.timeCost ?? "normal",
    sceneImage: event.sceneImage ?? campaign.defaultSceneImage,
    choices: event.choices,
    combatEncounter: event.combatEncounter,
  };
}

function uniqueEventToStep(
  event: MissionUniqueEvent,
  mission: MissionTemplate
): MissionCampaignStep {
  const campaign = mission.campaign;
  return {
    title: event.title,
    text: event.text,
    eventType: event.eventType,
    timeCost: event.timeCost ?? "normal",
    sceneImage: event.sceneImage ?? campaign.defaultSceneImage,
    choices: event.choices,
    combatEncounter: event.combatEncounter,
  };
}

function secretEventToStep(
  event: MissionSecretEvent,
  mission: MissionTemplate
): MissionCampaignStep {
  const campaign = mission.campaign;
  return {
    title: event.title,
    text: event.text,
    eventType: event.eventType,
    timeCost: event.timeCost ?? "normal",
    sceneImage: event.sceneImage ?? campaign.defaultSceneImage,
    choices: event.choices,
    combatEncounter: event.combatEncounter,
  };
}

function countSeen(
  ids: string[] | undefined,
  eventId: string,
  maxPerRun: number | undefined
): boolean {
  const seen = ids?.filter((id) => id === eventId).length ?? 0;
  const cap = maxPerRun ?? 1;
  return seen >= cap;
}

export function checkSecretConditions(
  conditions: MissionSecretCondition[],
  ctx: MissionInterludeContext
): boolean {
  const { state, lineage, heir, adventurerRank } = ctx;

  return conditions.every((condition) => {
    switch (condition.type) {
      case "choiceMade":
        return (state.choiceHistory ?? []).includes(condition.choiceId);
      case "moraleAtMost":
        return state.morale <= condition.value;
      case "moraleAtLeast":
        return state.morale >= condition.value;
      case "suppliesAtMost":
        return state.supplies <= condition.value;
      case "heirStatAtLeast":
        return (heir.stats[condition.stat] ?? 0) >= condition.value;
      case "generationAtLeast":
        return Math.max(lineage.generation, heir.generation) >= condition.value;
      case "randomEventSeen":
        return (state.seenRandomEventIds ?? []).includes(condition.eventId);
      case "fixedStepCompleted":
        return ctx.completedFixedStepIndex >= condition.stepIndex;
      case "minHeirLevel":
        return heir.level >= condition.value;
      case "minAdventurerRank":
        return rankIndex(adventurerRank) >= rankIndex(condition.rank);
      case "missionCompleted":
        return (heir.completedMissionIds ?? []).includes(condition.missionId);
      case "anyMissionCompleted":
        return condition.missionIds.some((id) =>
          (heir.completedMissionIds ?? []).includes(id)
        );
      case "heirStatAtMost":
        return (heir.stats[condition.stat] ?? 0) <= condition.value;
      case "infamyAtLeast":
        return (heir.stats.infamy ?? 0) >= condition.value;
      case "infamyAtMost":
        return (heir.stats.infamy ?? 0) <= condition.value;
      case "deadHeirsAtLeast":
        return (ctx.lineage.publicSummary.deadHeirs ?? 0) >= condition.value;
      case "classId":
        return heir.classId === condition.classId;
      default:
        return false;
    }
  });
}

function toEligibilityContext(ctx: MissionInterludeContext, mission: MissionTemplate): InterludeEligibilityContext {
  return {
    mission,
    lineage: ctx.lineage,
    heir: ctx.heir,
    adventurerRank: ctx.adventurerRank,
  };
}

function pickUniqueInterlude(
  mission: MissionTemplate,
  ctx: MissionInterludeContext
): MissionCampaignInterlude | null {
  const uniques = filterEligibleUniqueEvents(ctx.pools, toEligibilityContext(ctx, mission));
  const tone = mission.campaign.tone;

  for (const unique of uniques) {
    if (countSeen(ctx.state.seenUniqueInterludeIds, unique.id, unique.maxPerRun ?? 1)) {
      continue;
    }
    const step = uniqueEventToStep(unique, mission);
    if (!toneAllowsCombat(tone, step)) continue;
    return { kind: "unique", eventId: unique.id, step };
  }

  return null;
}

function pickSecretInterlude(
  mission: MissionTemplate,
  ctx: MissionInterludeContext
): MissionCampaignInterlude | null {
  const secrets = filterEligibleSecretEvents(ctx.pools, toEligibilityContext(ctx, mission));
  const tone = mission.campaign.tone;

  for (const secret of secrets) {
    if (countSeen(ctx.state.seenSecretEventIds, secret.id, secret.maxPerRun)) {
      continue;
    }
    const step = secretEventToStep(secret, mission);
    if (!toneAllowsCombat(tone, step)) continue;
    if (!checkSecretConditions(secret.conditions, ctx)) continue;

    return { kind: "secret", eventId: secret.id, step };
  }

  return null;
}

function pickRandomInterlude(
  mission: MissionTemplate,
  ctx: MissionInterludeContext,
  chanceRoll: number,
  pickRoll: number
): MissionCampaignInterlude | null {
  const pool = filterEligibleRandomEvents(ctx.pools, toEligibilityContext(ctx, mission));
  if (pool.length === 0) return null;

  const chance =
    mission.campaign.randomEventChance ?? (pool.length > 0 ? 0.35 : 0);
  if (chanceRoll >= chance) return null;

  const tone = mission.campaign.tone;
  const eligible = pool.filter((event) => {
    if (countSeen(ctx.state.seenRandomEventIds, event.id, event.maxPerRun)) {
      return false;
    }
    const step = randomEventToStep(event, mission);
    return toneAllowsCombat(tone, step);
  });

  if (eligible.length === 0) return null;

  const totalWeight = eligible.reduce((sum, e) => sum + e.weight, 0);
  let threshold = pickRoll * totalWeight;

  for (const event of eligible) {
    threshold -= event.weight;
    if (threshold <= 0) {
      return {
        kind: "random",
        eventId: event.id,
        step: randomEventToStep(event, mission),
      };
    }
  }

  const fallback = eligible[eligible.length - 1];
  return {
    kind: "random",
    eventId: fallback.id,
    step: randomEventToStep(fallback, mission),
  };
}

export function tryRollMissionInterlude(
  mission: MissionTemplate,
  ctx: MissionInterludeContext,
  chanceRoll: number,
  pickRoll: number
): MissionCampaignInterlude | null {
  const secret = pickSecretInterlude(mission, ctx);
  if (secret) return secret;
  const unique = pickUniqueInterlude(mission, ctx);
  if (unique) return unique;
  return pickRandomInterlude(mission, ctx, chanceRoll, pickRoll);
}

export function recordInterludeTriggered(
  state: CampaignRunState,
  interlude: MissionCampaignInterlude
): CampaignRunState {
  if (interlude.kind === "secret") {
    return {
      ...state,
      seenSecretEventIds: [...(state.seenSecretEventIds ?? []), interlude.eventId],
      interlude,
      eventLog: [
        ...state.eventLog,
        {
          text: `Secret event: ${interlude.step.title ?? interlude.eventId}`,
          timestampMs: Date.now(),
        },
      ],
    };
  }

  if (interlude.kind === "unique") {
    return {
      ...state,
      seenUniqueInterludeIds: [...(state.seenUniqueInterludeIds ?? []), interlude.eventId],
      interlude,
      eventLog: [
        ...state.eventLog,
        {
          text: `Unique event: ${interlude.step.title ?? interlude.eventId}`,
          timestampMs: Date.now(),
        },
      ],
    };
  }

  return {
    ...state,
    seenRandomEventIds: [...(state.seenRandomEventIds ?? []), interlude.eventId],
    interlude,
    eventLog: [
      ...state.eventLog,
      {
        text: `Detour: ${interlude.step.title ?? interlude.eventId}`,
        timestampMs: Date.now(),
      },
    ],
  };
}

export function clearMissionInterlude(state: CampaignRunState): CampaignRunState {
  const { interlude: _removed, ...rest } = state;
  return rest as CampaignRunState;
}

export function appendChoiceHistory(
  state: CampaignRunState,
  choiceId: string | undefined
): CampaignRunState {
  if (!choiceId) return state;
  return {
    ...state,
    choiceHistory: [...(state.choiceHistory ?? []), choiceId],
  };
}

export function getActiveMissionStep(
  mission: MissionTemplate,
  activeMission: { currentStep: number; campaignState?: CampaignRunState }
): {
  step: MissionCampaignStep;
  choices: MissionCampaignChoice[];
  title: string;
  isInterlude: boolean;
  fixedStepIndex: number;
} {
  const state = activeMission.campaignState;
  const fixedStepIndex = activeMission.currentStep;

  if (state?.interlude) {
    const step = state.interlude.step;
    return {
      step,
      choices: getChoicesForStep(mission, step),
      title: step.title ?? (state.interlude.kind === "secret" ? "Hidden Event" : state.interlude.kind === "unique" ? "Unique Event" : "Detour"),
      isInterlude: true,
      fixedStepIndex,
    };
  }

  const step = mission.campaign.steps[fixedStepIndex];
  if (!step) {
    return {
      step: { text: "The contract is complete.", eventType: "discovery" },
      choices: [],
      title: mission.name,
      isInterlude: false,
      fixedStepIndex,
    };
  }

  return {
    step,
    choices: getChoicesForStep(mission, step),
    title: step.title ?? mission.name,
    isInterlude: false,
    fixedStepIndex,
  };
}

export function stepTriggersCombat(step: MissionCampaignStep): boolean {
  return isCombatStep(step);
}

export function getMissionProgressLabel(
  activeMission: { currentStep: number; totalSteps: number },
  isInterlude: boolean
): string {
  if (isInterlude) {
    return `Detour — before stage ${activeMission.currentStep + 2} / ${activeMission.totalSteps}`;
  }
  return `Stage ${activeMission.currentStep + 1} / ${activeMission.totalSteps}`;
}

export function applyChoiceToStateWithHistory(
  state: CampaignRunState,
  choice: MissionCampaignChoice | null,
  step: MissionCampaignStep,
  logText: string,
  applyChoice: (
    s: CampaignRunState,
    c: MissionCampaignChoice,
    st: MissionCampaignStep,
    log: string
  ) => CampaignRunState
): CampaignRunState {
  let next = choice
    ? applyChoice(state, choice, step, logText)
    : {
        ...state,
        eventLog: [...state.eventLog, { text: logText, timestampMs: Date.now() }],
      };

  next = appendChoiceHistory(next, choice?.id);
  return next;
}

export function stageCostForStep(
  step: MissionCampaignStep,
  choice: MissionCampaignChoice | null
): number {
  return choice?.stageCost ?? stageCostForTimeCost(step.timeCost);
}

export type { MissionInterludePools } from "./missionInterludeEligibility.js";
