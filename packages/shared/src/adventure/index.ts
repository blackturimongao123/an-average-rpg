import type {
  AdventureEventStep,
  DungeonData,
  MissionCampaignChoice,
  MissionEventType,
  MissionTemplate,
} from "../types.js";
import {
  defaultChoicesForEvent,
  getChoicesForStep,
  getDefaultSceneGradient,
  getStepChoices,
  getStepTitle,
  inferEventType,
} from "../campaign/adventureHelpers.js";
import {
  getActiveMissionStep,
  getMissionProgressLabel,
} from "../campaign/missionInterludes.js";
import type { ActiveMission } from "../types.js";

export type ChoiceCardTone = "explore" | "safe" | "social" | "rest" | "combat" | "default";

export function getChoiceCardTone(choiceId: string): ChoiceCardTone {
  const id = choiceId.toLowerCase();
  if (id.includes("explore") || id.includes("scout") || id.includes("shrine")) return "explore";
  if (id.includes("safe") || id.includes("retreat") || id.includes("light")) return "safe";
  if (id.includes("persuade") || id.includes("bribe") || id.includes("force") || id.includes("spirit")) {
    return "social";
  }
  if (id.includes("camp") || id.includes("rest")) return "rest";
  if (id.includes("engage") || id.includes("ambush") || id.includes("push") || id.includes("fight")) {
    return "combat";
  }
  return "default";
}

export function getAdventureChoices(
  step: AdventureEventStep,
  eventType: MissionEventType,
  explicitChoices?: MissionCampaignChoice[]
): MissionCampaignChoice[] {
  if (explicitChoices?.length) return explicitChoices;
  if (step.choices?.length) return step.choices;
  return defaultChoicesForEvent(eventType);
}

export function getDungeonFloorApproach(dungeon: DungeonData, floorIndex: number): AdventureEventStep {
  const floor = dungeon.floors[floorIndex];
  if (!floor) {
    return {
      title: dungeon.name,
      text: "The path ahead is unclear.",
      eventType: "hazard",
      timeCost: "normal",
    };
  }

  if (floor.approach) {
    return floor.approach;
  }

  const floorNum = floor.floor;
  const isBoss = Boolean(floor.bossId) || floorNum === dungeon.floors.length;
  const eventType: MissionEventType = isBoss ? "combat" : floorNum % 2 === 1 ? "discovery" : "combat";

  const defaultText = isBoss
    ? `A terrible presence blocks the deepest chamber of ${dungeon.name}. There is no turning back.`
    : floorNum === 1
      ? `You stand at the entrance to ${dungeon.name}. Torchlight flickers against damp stone.`
      : `Deeper into ${dungeon.name}, the air grows heavy. Scrapes and echoes suggest you are not alone.`;

  return {
    title: isBoss ? `The Final Chamber` : `Floor ${floorNum}`,
    text: defaultText,
    eventType,
    timeCost: "normal",
  };
}

export function getDungeonFloorChoices(dungeon: DungeonData, floorIndex: number): MissionCampaignChoice[] {
  const approach = getDungeonFloorApproach(dungeon, floorIndex);
  const eventType = approach.eventType ?? "hazard";
  return getAdventureChoices(approach, eventType);
}

export {
  getDefaultSceneGradient,
  getStepChoices,
  getStepTitle,
  inferEventType,
};

export function missionStepToAdventure(
  mission: MissionTemplate,
  stepIndex: number
): { step: AdventureEventStep; choices: MissionCampaignChoice[]; title: string } {
  const step = mission.campaign.steps[stepIndex];
  if (!step) {
    return {
      step: { text: "The contract is complete.", eventType: "discovery" },
      choices: [],
      title: mission.name,
    };
  }

  const eventType = inferEventType(step, mission.type);
  return {
    step,
    choices: getStepChoices(mission, stepIndex),
    title: getStepTitle(step, mission.name),
  };
}

/** Resolve the step currently shown in an active mission (fixed beat or interlude). */
export function activeMissionToAdventure(
  mission: MissionTemplate,
  activeMission: ActiveMission
): {
  step: AdventureEventStep;
  choices: MissionCampaignChoice[];
  title: string;
  isInterlude: boolean;
  progressLabel: string;
} {
  const { step, choices, title, isInterlude, fixedStepIndex } = getActiveMissionStep(
    mission,
    activeMission
  );

  return {
    step,
    choices,
    title,
    isInterlude,
    progressLabel: getMissionProgressLabel(activeMission, isInterlude),
  };
}

export interface FloorChoiceModifiers {
  monsterDamageMult: number;
  rewardMult: number;
  heirHealFlat: number;
}

export function getFloorChoiceModifiers(choiceId?: string): FloorChoiceModifiers {
  if (!choiceId) {
    return { monsterDamageMult: 1, rewardMult: 1, heirHealFlat: 0 };
  }

  const id = choiceId.toLowerCase();

  if (id.includes("camp") || id.includes("rest")) {
    return { monsterDamageMult: 1, rewardMult: 1, heirHealFlat: 12 };
  }
  if (id.includes("explore") || id.includes("engage") || id.includes("shrine")) {
    return { monsterDamageMult: 1.1, rewardMult: 1.1, heirHealFlat: 0 };
  }
  if (id.includes("ambush") || id.includes("sneak") || id.includes("persuade")) {
    return { monsterDamageMult: 0.92, rewardMult: 1.05, heirHealFlat: 0 };
  }
  if (id.includes("safe") || id.includes("retreat") || id.includes("light")) {
    return { monsterDamageMult: 0.85, rewardMult: 0.85, heirHealFlat: 0 };
  }

  return { monsterDamageMult: 1, rewardMult: 1, heirHealFlat: 0 };
}

export {
  choiceTriggersDungeonBattle,
  resolveDungeonEventOutcome,
  type DungeonEventOutcome,
} from "./dungeonChoices.js";
