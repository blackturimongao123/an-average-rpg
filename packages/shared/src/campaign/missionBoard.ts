import {
  ADVENTURER_RANKS,
  MISSION_BOARD_REROLL_MS,
  MISSION_BOARD_SIZE,
  rankIndex,
} from "../constants.js";
import type { AdventurerRank, MissionBoard, MissionBoardSlot, MissionTemplate } from "../types.js";
import { isMissionBoardEligible, type MissionBoardEligibilityContext } from "./missionBoardEligibility.js";

export function normalizeMissionRank(rank: unknown): AdventurerRank {
  return ADVENTURER_RANKS.includes(rank as AdventurerRank) ? (rank as AdventurerRank) : "F";
}

export function missionBoardNeedsReroll(board: MissionBoard | null, nowMs = Date.now()): boolean {
  return !board || nowMs >= board.nextRerollAtMs;
}

function randomUnit(seed: string): number {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash % 10000) / 10000;
}

function rollSlot(
  templates: MissionTemplate[],
  lineageId: string,
  hourBucket: number,
  slotIndex: number,
  rank: AdventurerRank,
  heirLevel: number,
  usedIds: Set<string>,
  context: MissionBoardEligibilityContext
): MissionBoardSlot {
  const eligible = templates.filter(
    (mission) => !usedIds.has(mission.id) && isMissionBoardEligible(mission, rank, heirLevel, context)
  );
  if (eligible.length === 0) {
    return { slotIndex, missionId: null, difficulty: null, status: "empty" };
  }

  const weighted = eligible.map((mission) => {
    const distance = Math.abs(rankIndex(rank) - rankIndex(mission.difficulty));
    const multiplier = distance <= 1 ? 1.5 : distance === 2 ? 1 : distance === 3 ? 0.6 : 0.25;
    return { mission, weight: Math.max(0, mission.weight * multiplier) };
  });
  const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
  let threshold = randomUnit(`${lineageId}-board-${hourBucket}-slot-${slotIndex}`) * total;
  const selected = weighted.find((entry) => {
    threshold -= entry.weight;
    return threshold <= 0;
  })?.mission ?? weighted[weighted.length - 1]!.mission;
  usedIds.add(selected.id);
  return { slotIndex, missionId: selected.id, difficulty: selected.difficulty, status: "available" };
}

export function rollMissionBoard(
  templates: MissionTemplate[],
  lineageId: string,
  rank: AdventurerRank,
  heirLevel: number,
  context: MissionBoardEligibilityContext,
  nowMs = Date.now()
): MissionBoard {
  const hourBucket = Math.floor(nowMs / MISSION_BOARD_REROLL_MS);
  const usedIds = new Set<string>();
  return {
    slots: Array.from({ length: MISSION_BOARD_SIZE }, (_, slotIndex) =>
      rollSlot(templates, lineageId, hourBucket, slotIndex, rank, heirLevel, usedIds, context)
    ),
    rolledAtMs: nowMs,
    nextRerollAtMs: (hourBucket + 1) * MISSION_BOARD_REROLL_MS,
    hourBucket,
  };
}
