import { doc, updateDoc } from "firebase/firestore";
import type {
  BattleReplayPayload,
  DungeonData,
  PartyActiveDungeon,
  PartyDungeonBattleSummary,
} from "@bloodline/shared/types";
import { generateSeed } from "@/lib/seededRandom";
import { db } from "./config";

export function buildPartyDungeonSeed(
  partyId: string,
  dungeonId: string,
  floor: number,
  floorChoiceId: string
): string {
  return generateSeed(partyId, dungeonId, `party-floor-${floor}-${floorChoiceId}`);
}

export async function startPartyDungeon(
  partyId: string,
  dungeon: DungeonData
): Promise<void> {
  const activeDungeon: PartyActiveDungeon = {
    dungeonId: dungeon.id,
    dungeonName: dungeon.name,
    currentFloor: 1,
    phase: "floor_event",
    floorChoiceId: null,
    battleSeed: null,
    battleReplay: null,
    battleSummary: null,
    lastEventOutcome: null,
    runLog: [
      {
        text: `Party entered ${dungeon.name}`,
        timestampMs: Date.now(),
      },
    ],
    updatedAtMs: Date.now(),
  };

  await updateDoc(doc(db, "parties", partyId), { activeDungeon });
}

export async function updatePartyDungeon(
  partyId: string,
  patch: Partial<PartyActiveDungeon>
): Promise<void> {
  const partyRef = doc(db, "parties", partyId);
  const entries = Object.entries(patch).map(([key, value]) => [
    `activeDungeon.${key}`,
    value,
  ]);
  await updateDoc(partyRef, Object.fromEntries(entries));
}

export async function clearPartyDungeon(partyId: string): Promise<void> {
  await updateDoc(doc(db, "parties", partyId), { activeDungeon: null });
}

export async function syncPartyDungeonBattle(
  partyId: string,
  data: {
    floorChoiceId: string;
    battleSeed: string;
    battleReplay: BattleReplayPayload;
    battleSummary: PartyDungeonBattleSummary;
    logText: string;
    currentFloor: number;
  }
): Promise<void> {
  await updateDoc(doc(db, "parties", partyId), {
    "activeDungeon.phase": "battle",
    "activeDungeon.floorChoiceId": data.floorChoiceId,
    "activeDungeon.battleSeed": data.battleSeed,
    "activeDungeon.battleReplay": data.battleReplay,
    "activeDungeon.battleSummary": data.battleSummary,
    "activeDungeon.currentFloor": data.currentFloor,
    "activeDungeon.updatedAtMs": Date.now(),
    "activeDungeon.runLog": [
      {
        text: data.logText,
        timestampMs: Date.now(),
      },
    ],
  });
}

export async function advancePartyDungeonFloor(
  partyId: string,
  nextFloor: number
): Promise<void> {
  await updateDoc(doc(db, "parties", partyId), {
    "activeDungeon.phase": "floor_event",
    "activeDungeon.currentFloor": nextFloor,
    "activeDungeon.floorChoiceId": null,
    "activeDungeon.battleSeed": null,
    "activeDungeon.battleReplay": null,
    "activeDungeon.battleSummary": null,
    "activeDungeon.lastEventOutcome": null,
    "activeDungeon.updatedAtMs": Date.now(),
  });
}
