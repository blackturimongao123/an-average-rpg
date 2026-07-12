import type {
  AdventurerRank,
  CampaignRunState,
  MissionCampaignChoice,
  MissionCombatEncounter,
  MissionSetting,
  MissionTemplate,
} from "../types.js";

export const MISSION_REST_CHOICE_ID = "mission_rest";
export const MISSION_SCAVENGE_CHOICE_ID = "mission_scavenge";
export const MAX_MISSION_REST_USES = 2;
/** Plot choices shown alongside Rest + Scavenge on every step. */
export const MISSION_PLOT_CHOICE_SLOTS = 2;

const SCAVENGE_LOOT_ITEMS = [
  "health_potion",
  "trail_compass",
  "thieves_tools",
  "mana_crystal",
  "holy_symbol",
] as const;

const SCAVENGE_MONSTERS_BY_RANK: Record<AdventurerRank, string[]> = {
  F: ["cellar_rat", "goblin_scout"],
  E: ["goblin_scout", "goblin_warrior"],
  D: ["goblin_warrior", "goblin_archer"],
  C: ["goblin_archer", "skeleton_warrior"],
  B: ["skeleton_warrior", "zombie"],
  A: ["goblin_shaman", "goblin_elite"],
  S: ["goblin_elite", "lich_lord"],
  SS: ["lich_lord", "ancient_red_dragon"],
  SSS: ["ancient_red_dragon", "lich_lord"],
};

export interface ScavengeOutcome {
  logText: string;
  goldDelta?: number;
  supplyDelta?: number;
  moraleDelta?: number;
  hpDelta?: number;
  itemId?: string;
  combatEncounter?: MissionCombatEncounter;
}

export function restUsesRemaining(state: CampaignRunState): number {
  const used = state.restUsesCount ?? 0;
  return Math.max(0, MAX_MISSION_REST_USES - used);
}

export function buildMissionRestChoice(state: CampaignRunState): MissionCampaignChoice {
  const remaining = restUsesRemaining(state);
  return {
    id: MISSION_REST_CHOICE_ID,
    label: "Rest",
    subtitle:
      remaining > 0
        ? "Catch your breath and tend wounds"
        : "You have rested enough on this contract",
    tags: [
      { label: "+18% HP", tone: "reward" },
      { label: "+6 Morale", tone: "reward" },
      ...(remaining <= 0 ? [{ label: "Unavailable", tone: "cost" as const }] : []),
    ],
    hpDelta: 18,
    moraleDelta: 6,
    stageCost: 1,
    unavailable: remaining <= 0,
  };
}

export function buildMissionScavengeChoice(): MissionCampaignChoice {
  return {
    id: MISSION_SCAVENGE_CHOICE_ID,
    label: "Scavenge",
    subtitle: "Search the area — loot, danger, or nothing",
    tags: [
      { label: "Basic Loot", tone: "reward" },
      { label: "May Provoke Foes", tone: "risk" },
    ],
    stageCost: 1,
  };
}

export function mergeMissionStepChoices(
  plotChoices: MissionCampaignChoice[],
  state: CampaignRunState
): MissionCampaignChoice[] {
  const plot = plotChoices.slice(0, MISSION_PLOT_CHOICE_SLOTS);
  return [buildMissionScavengeChoice(), buildMissionRestChoice(state), ...plot];
}

function pickScavengeMonster(mission: MissionTemplate, roll: number): string {
  const pool = SCAVENGE_MONSTERS_BY_RANK[mission.difficulty] ?? SCAVENGE_MONSTERS_BY_RANK.F;
  const index = Math.floor(roll * pool.length) % pool.length;
  return pool[index] ?? "cellar_rat";
}

function settingFlavor(setting: MissionSetting | undefined): string {
  switch (setting) {
    case "forest":
      return "underbrush";
    case "cave":
    case "crypt":
      return "rubble";
    case "swamp":
      return "muck";
    case "road":
      return "ditch";
    case "ruins":
      return "debris";
    case "coast":
      return "tide pools";
    default:
      return "the area";
  }
}

export function resolveScavengeOutcome(
  roll: number,
  mission: MissionTemplate,
  pickRoll: number
): ScavengeOutcome {
  const area = settingFlavor(mission.campaign.setting);

  if (roll < 0.32) {
    return {
      logText: `Scavenged ${area} — nothing useful turned up.`,
      moraleDelta: -2,
    };
  }

  if (roll < 0.68) {
    const lootKind = pickRoll;
    if (lootKind < 0.4) {
      const gold = 2 + Math.floor(pickRoll * 7);
      return {
        logText: `Scavenged ${area} — found ${gold} gold in a forgotten pouch.`,
        goldDelta: gold,
        moraleDelta: 2,
      };
    }
    if (lootKind < 0.75) {
      const supplies = 3 + Math.floor(pickRoll * 4);
      return {
        logText: `Scavenged ${area} — salvaged ${supplies} supplies.`,
        supplyDelta: supplies,
        moraleDelta: 3,
      };
    }
    const itemIndex = Math.floor(pickRoll * SCAVENGE_LOOT_ITEMS.length) % SCAVENGE_LOOT_ITEMS.length;
    const itemId = SCAVENGE_LOOT_ITEMS[itemIndex]!;
    return {
      logText: `Scavenged ${area} — uncovered a ${itemId.replace(/_/g, " ")}.`,
      itemId,
      moraleDelta: 4,
    };
  }

  if (roll < 0.88) {
    const monsterId = pickScavengeMonster(mission, pickRoll);
    return {
      logText: `Scavenging ${area} stirred something hostile!`,
      moraleDelta: -4,
      combatEncounter: { monsterId, levelScale: 1 },
    };
  }

  if (pickRoll < 0.5) {
    return {
      logText: `A strange shrine in ${area} leaves you unsettled.`,
      moraleDelta: -6,
      hpDelta: -5,
    };
  }

  return {
    logText: `A lucky find in ${area} — hidden supplies and a trinket.`,
    supplyDelta: 5,
    goldDelta: 4,
    moraleDelta: 5,
  };
}

export function applyScavengeOutcomeToState(
  state: CampaignRunState,
  outcome: ScavengeOutcome,
  skipLog = false
): CampaignRunState {
  return {
    ...state,
    runGold: state.runGold + (outcome.goldDelta ?? 0),
    supplies: Math.min(
      state.maxSupplies,
      Math.max(0, state.supplies + (outcome.supplyDelta ?? 0))
    ),
    morale: Math.min(100, Math.max(0, state.morale + (outcome.moraleDelta ?? 0))),
    hpPercent: Math.min(100, Math.max(5, state.hpPercent + (outcome.hpDelta ?? 0))),
    runItems: outcome.itemId ? [...state.runItems, outcome.itemId] : state.runItems,
    eventLog: skipLog
      ? state.eventLog
      : [
          ...state.eventLog,
          { text: outcome.logText, timestampMs: Date.now() },
        ],
  };
}

export function applyRestUseToState(state: CampaignRunState): CampaignRunState {
  return {
    ...state,
    restUsesCount: (state.restUsesCount ?? 0) + 1,
  };
}

export function isMissionRestChoice(choiceId: string | undefined): boolean {
  return choiceId === MISSION_REST_CHOICE_ID;
}

export function isMissionScavengeChoice(choiceId: string | undefined): boolean {
  return choiceId === MISSION_SCAVENGE_CHOICE_ID;
}
