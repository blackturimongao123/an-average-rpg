import type {
  AdventurerRank,
  MissionBoard,
  MissionBoardSlot,
  MissionTemplate,
} from "@bloodline/shared/types";
import {
  ADVENTURER_RANKS,
  MISSION_BOARD_REROLL_MS,
  MISSION_BOARD_SIZE,
  rankIndex,
} from "@bloodline/shared/constants";

import missionsData from "@game-data/missions.json";

export const MISSION_TEMPLATES = missionsData.missions as MissionTemplate[];

export function getMissionTemplate(missionId: string): MissionTemplate | undefined {
  return MISSION_TEMPLATES.find((mission) => mission.id === missionId);
}

export function getHourBucket(nowMs: number = Date.now()): number {
  return Math.floor(nowMs / MISSION_BOARD_REROLL_MS);
}

export function getNextRerollAtMs(hourBucket: number): number {
  return (hourBucket + 1) * MISSION_BOARD_REROLL_MS;
}

export function getRerollCountdownMs(nextRerollAtMs: number, nowMs: number = Date.now()): number {
  return Math.max(0, nextRerollAtMs - nowMs);
}

function seededRandom(seed: string, index: number = 0): number {
  let hash = 0;
  const input = `${seed}-${index}`;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 10000) / 10000;
}

function weightedRandomChoice<T>(
  seed: string,
  items: Array<{ item: T; weight: number }>,
  index: number = 0
): T | null {
  if (items.length === 0) {
    return null;
  }

  const totalWeight = items.reduce((sum, entry) => sum + entry.weight, 0);
  if (totalWeight <= 0) {
    return null;
  }

  const roll = seededRandom(seed, index) * totalWeight;
  let cumulative = 0;

  for (const entry of items) {
    cumulative += entry.weight;
    if (roll < cumulative) {
      return entry.item;
    }
  }

  return items[items.length - 1].item;
}

export function isMissionEligible(
  mission: MissionTemplate,
  adventurerRank: AdventurerRank,
  heirLevel: number
): boolean {
  if (mission.minAdventurerRank && rankIndex(adventurerRank) < rankIndex(mission.minAdventurerRank)) {
    return false;
  }

  if (mission.minHeirLevel && heirLevel < mission.minHeirLevel) {
    return false;
  }

  return true;
}

function getMissionRollWeight(mission: MissionTemplate, adventurerRank: AdventurerRank): number {
  const playerIndex = rankIndex(adventurerRank);
  const missionIndex = rankIndex(mission.difficulty);
  const distance = Math.abs(playerIndex - missionIndex);

  if (distance <= 1) {
    return mission.weight * 1.5;
  }

  if (distance === 2) {
    return mission.weight;
  }

  if (distance === 3) {
    return mission.weight * 0.6;
  }

  return mission.weight * 0.25;
}

function rollSingleSlot(
  lineageId: string,
  hourBucket: number,
  slotIndex: number,
  adventurerRank: AdventurerRank,
  heirLevel: number,
  excludeMissionIds: string[]
): MissionBoardSlot {
  const eligible = MISSION_TEMPLATES.filter(
    (mission) =>
      isMissionEligible(mission, adventurerRank, heirLevel) &&
      !excludeMissionIds.includes(mission.id)
  );

  if (eligible.length === 0) {
    return {
      slotIndex,
      missionId: null,
      difficulty: null,
      status: "empty",
    };
  }

  const seed = `${lineageId}-board-${hourBucket}-slot-${slotIndex}`;
  const weighted = eligible.map((mission) => ({
    item: mission,
    weight: getMissionRollWeight(mission, adventurerRank),
  }));
  const picked = weightedRandomChoice(seed, weighted, 0);

  if (!picked) {
    return {
      slotIndex,
      missionId: null,
      difficulty: null,
      status: "empty",
    };
  }

  return {
    slotIndex,
    missionId: picked.id,
    difficulty: picked.difficulty,
    status: "available",
  };
}

export function createMissionBoard(
  lineageId: string,
  adventurerRank: AdventurerRank,
  heirLevel: number,
  nowMs: number = Date.now()
): MissionBoard {
  const hourBucket = getHourBucket(nowMs);
  const slots: MissionBoardSlot[] = [];
  const usedMissionIds: string[] = [];

  for (let slotIndex = 0; slotIndex < MISSION_BOARD_SIZE; slotIndex += 1) {
    const slot = rollSingleSlot(
      lineageId,
      hourBucket,
      slotIndex,
      adventurerRank,
      heirLevel,
      usedMissionIds
    );
    slots.push(slot);
    if (slot.missionId) {
      usedMissionIds.push(slot.missionId);
    }
  }

  return {
    slots,
    rolledAtMs: nowMs,
    nextRerollAtMs: getNextRerollAtMs(hourBucket),
    hourBucket,
  };
}

export function rerollMissionBoard(
  lineageId: string,
  existingBoard: MissionBoard,
  adventurerRank: AdventurerRank,
  heirLevel: number,
  nowMs: number = Date.now()
): MissionBoard {
  const hourBucket = getHourBucket(nowMs);
  const usedMissionIds: string[] = [];
  const slots = existingBoard.slots.map((slot, slotIndex) => {
    if (slot.status !== "available" && slot.status !== "empty") {
      return slot;
    }

    const rolled = rollSingleSlot(
      lineageId,
      hourBucket,
      slotIndex,
      adventurerRank,
      heirLevel,
      usedMissionIds
    );

    if (rolled.missionId) {
      usedMissionIds.push(rolled.missionId);
    }

    return rolled;
  });

  while (slots.length < MISSION_BOARD_SIZE) {
    const slotIndex = slots.length;
    const rolled = rollSingleSlot(
      lineageId,
      hourBucket,
      slotIndex,
      adventurerRank,
      heirLevel,
      usedMissionIds
    );
    slots.push(rolled);
    if (rolled.missionId) {
      usedMissionIds.push(rolled.missionId);
    }
  }

  return {
    slots,
    rolledAtMs: nowMs,
    nextRerollAtMs: getNextRerollAtMs(hourBucket),
    hourBucket,
  };
}

export function boardNeedsReroll(board: MissionBoard | null, nowMs: number = Date.now()): boolean {
  if (!board) {
    return true;
  }

  return nowMs >= board.nextRerollAtMs;
}

export function normalizeAdventurerRank(rank: string | undefined): AdventurerRank {
  if (rank && ADVENTURER_RANKS.includes(rank as AdventurerRank)) {
    return rank as AdventurerRank;
  }

  return "F";
}

export function formatMissionCountdown(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
