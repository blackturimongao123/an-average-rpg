import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import type { ActiveMission, AdventurerRank, Heir, MissionBoard } from "@bloodline/shared/types";
import { applyAdventurerRankXp, MISSION_COOLDOWN_MS, XP_PER_LEVEL } from "@bloodline/shared/constants";
import {
  applyChoiceToCampaignState,
  createInitialCampaignState,
  getStepChoices,
} from "@bloodline/shared/campaign";
import {
  boardNeedsReroll,
  createMissionBoard,
  getMissionTemplate,
  normalizeAdventurerRank,
  rerollMissionBoard,
} from "@/lib/missions";
import { db } from "./config";

const BOARD_DOC_ID = "current";

/** Firestore rejects undefined field values — strip them before writes. */
function firestoreSafe<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function boardRef(lineageId: string) {
  return doc(db, "lineages", lineageId, "missionBoard", BOARD_DOC_ID);
}

function parseBoard(data: Record<string, unknown>): MissionBoard {
  return {
    slots: (data.slots as MissionBoard["slots"]) ?? [],
    rolledAtMs: (data.rolledAtMs as number) ?? Date.now(),
    nextRerollAtMs: (data.nextRerollAtMs as number) ?? Date.now(),
    hourBucket: (data.hourBucket as number) ?? 0,
  };
}

async function ensureMissionBoard(
  lineageId: string,
  adventurerRank: AdventurerRank,
  heirLevel: number
): Promise<MissionBoard> {
  const ref = boardRef(lineageId);
  const snapshot = await getDoc(ref);
  const nowMs = Date.now();

  if (!snapshot.exists()) {
    const board = createMissionBoard(lineageId, adventurerRank, heirLevel, nowMs);
    await setDoc(ref, board);
    return board;
  }

  const existing = parseBoard(snapshot.data());
  if (!boardNeedsReroll(existing, nowMs)) {
    return existing;
  }

  const board = rerollMissionBoard(lineageId, existing, adventurerRank, heirLevel, nowMs);
  await setDoc(ref, board);
  return board;
}

export async function bootstrapGetMissionBoard(
  userId: string,
  lineageId: string,
  heirLevel: number
) {
  const lineageRef = doc(db, "lineages", lineageId);
  const lineageDoc = await getDoc(lineageRef);

  if (!lineageDoc.exists()) {
    throw new Error("Lineage not found");
  }

  const lineage = lineageDoc.data();
  if (lineage.ownerUid !== userId) {
    throw new Error("You do not own this lineage");
  }

  const adventurerRank = normalizeAdventurerRank(lineage.adventurerRank);
  const board = await ensureMissionBoard(lineageId, adventurerRank, heirLevel);

  return {
    board,
    adventurerRank,
    adventurerRankXp: lineage.adventurerRankXp ?? 0,
  };
}

export async function bootstrapAcceptMission(
  userId: string,
  lineageId: string,
  heirId: string,
  slotIndex: number
) {
  const lineageRef = doc(db, "lineages", lineageId);
  const heirRef = doc(db, "lineages", lineageId, "heirs", heirId);
  const boardDocRef = boardRef(lineageId);

  const [lineageDoc, heirDoc, boardDoc] = await Promise.all([
    getDoc(lineageRef),
    getDoc(heirRef),
    getDoc(boardDocRef),
  ]);

  if (!lineageDoc.exists() || !heirDoc.exists()) {
    throw new Error("Lineage or heir not found");
  }

  const lineage = lineageDoc.data();
  const heir = heirDoc.data() as Heir;

  if (lineage.ownerUid !== userId) {
    throw new Error("You do not own this lineage");
  }

  if (heir.status !== "alive") {
    throw new Error("Heir is not alive");
  }

  if (heir.activeJobShift && heir.activeJobShift.endsAtMs > Date.now()) {
    throw new Error("Your heir is currently working a job shift");
  }

  if (heir.activeMission) {
    throw new Error("You already have an active mission");
  }

  const adventurerRank = normalizeAdventurerRank(lineage.adventurerRank);
  const board = boardDoc.exists()
    ? parseBoard(boardDoc.data())
    : createMissionBoard(lineageId, adventurerRank, heir.level);

  const slot = board.slots.find((entry) => entry.slotIndex === slotIndex);
  if (!slot || slot.status !== "available" || !slot.missionId) {
    throw new Error("That mission is no longer available");
  }

  const mission = getMissionTemplate(slot.missionId);
  if (!mission) {
    throw new Error("Mission not found");
  }

  const cooldownExpiresAt = heir.missionCooldowns?.[mission.id];
  if (cooldownExpiresAt && cooldownExpiresAt > Date.now()) {
    throw new Error("That mission is on cooldown — try again later");
  }

  const activeMission: ActiveMission = {
    missionId: mission.id,
    missionName: mission.name,
    difficulty: mission.difficulty,
    slotIndex,
    currentStep: 0,
    totalSteps: mission.campaign.steps.length,
    startedAtMs: Date.now(),
    campaignState: createInitialCampaignState(mission),
  };

  const updatedSlots = board.slots.map((entry) =>
    entry.slotIndex === slotIndex
      ? { slotIndex, missionId: null, difficulty: null, status: "empty" as const }
      : entry
  );

  const batch = writeBatch(db);
  batch.set(boardDocRef, { ...board, slots: updatedSlots });
  batch.update(heirRef, { activeMission: firestoreSafe(activeMission) });
  await batch.commit();

  return { activeMission, mission, board: { ...board, slots: updatedSlots } };
}

export async function bootstrapAdvanceMission(
  userId: string,
  lineageId: string,
  heirId: string,
  choiceId?: string
) {
  const lineageRef = doc(db, "lineages", lineageId);
  const heirRef = doc(db, "lineages", lineageId, "heirs", heirId);

  const [lineageDoc, heirDoc] = await Promise.all([getDoc(lineageRef), getDoc(heirRef)]);

  if (!lineageDoc.exists() || !heirDoc.exists()) {
    throw new Error("Lineage or heir not found");
  }

  const lineage = lineageDoc.data();
  const heir = heirDoc.data() as Heir;

  if (lineage.ownerUid !== userId) {
    throw new Error("You do not own this lineage");
  }

  if (!heir.activeMission) {
    throw new Error("No active mission");
  }

  const mission = getMissionTemplate(heir.activeMission.missionId);
  if (!mission) {
    throw new Error("Mission not found");
  }

  const stepIndex = heir.activeMission.currentStep;
  const step = mission.campaign.steps[stepIndex];
  const choices = getStepChoices(mission, stepIndex);
  const choice =
    choices.find((entry) => entry.id === choiceId) ?? choices[0] ?? null;

  const baseState =
    heir.activeMission.campaignState ?? createInitialCampaignState(mission);
  const logText = choice
    ? `${choice.label} — ${step.text.slice(0, 80)}${step.text.length > 80 ? "…" : ""}`
    : step.text;
  const nextCampaignState = choice
    ? applyChoiceToCampaignState(baseState, choice, step, logText)
    : {
        ...baseState,
        eventLog: [
          ...baseState.eventLog,
          { text: logText, timestampMs: Date.now() },
        ],
      };

  const isFinalStep = heir.activeMission.currentStep >= heir.activeMission.totalSteps - 1;
  if (!isFinalStep) {
    const nextMission: ActiveMission = {
      missionId: heir.activeMission.missionId,
      missionName: heir.activeMission.missionName,
      difficulty: normalizeAdventurerRank(heir.activeMission.difficulty),
      slotIndex: heir.activeMission.slotIndex,
      currentStep: heir.activeMission.currentStep + 1,
      totalSteps: heir.activeMission.totalSteps,
      startedAtMs: heir.activeMission.startedAtMs,
      campaignState: nextCampaignState,
    };

    const batch = writeBatch(db);
    batch.update(heirRef, { activeMission: firestoreSafe(nextMission) });
    await batch.commit();

    return {
      completed: false,
      activeMission: nextMission,
      stepText: mission.campaign.steps[nextMission.currentStep].text,
      rewards: null,
      rankUp: null,
    };
  }

  const rewards = mission.rewards;
  const xpForNextLevel = XP_PER_LEVEL(heir.level);
  const newGold = heir.gold + rewards.gold;
  const newXp = heir.xp + rewards.xp;
  const leveledUp = newXp >= xpForNextLevel;
  const finalXp = leveledUp ? newXp - xpForNextLevel : newXp;
  const finalLevel = leveledUp ? heir.level + 1 : heir.level;
  const newInventory = [...heir.inventory, ...rewards.items];

  const rankResult = applyAdventurerRankXp(
    normalizeAdventurerRank(lineage.adventurerRank),
    lineage.adventurerRankXp ?? 0,
    rewards.rankXp
  );

  const batch = writeBatch(db);
  batch.update(heirRef, {
    gold: newGold,
    xp: finalXp,
    level: finalLevel,
    inventory: newInventory,
    activeMission: null,
  });
  batch.update(lineageRef, {
    adventurerRank: rankResult.rank,
    adventurerRankXp: rankResult.rankXp,
    updatedAt: serverTimestamp(),
  });
  await batch.commit();

  return {
    completed: true,
    activeMission: null,
    stepText: mission.campaign.steps[mission.campaign.steps.length - 1].text,
    rewards,
    rankUp: rankResult.rankedUp
      ? { rank: rankResult.rank, rankXp: rankResult.rankXp }
      : null,
    heirGoldAfter: newGold,
    heirXpAfter: finalXp,
    leveledUp,
    heirLevelAfter: finalLevel,
    adventurerRank: rankResult.rank,
    adventurerRankXp: rankResult.rankXp,
  };
}

export async function bootstrapAbandonMission(
  userId: string,
  lineageId: string,
  heirId: string
) {
  const lineageRef = doc(db, "lineages", lineageId);
  const heirRef = doc(db, "lineages", lineageId, "heirs", heirId);

  const [lineageDoc, heirDoc] = await Promise.all([getDoc(lineageRef), getDoc(heirRef)]);

  if (!lineageDoc.exists() || !heirDoc.exists()) {
    throw new Error("Lineage or heir not found");
  }

  const lineage = lineageDoc.data();
  const heir = heirDoc.data() as Heir;

  if (lineage.ownerUid !== userId) {
    throw new Error("You do not own this lineage");
  }

  if (!heir.activeMission) {
    throw new Error("No active mission");
  }

  const missionId = heir.activeMission.missionId;
  const cooldownExpiresAtMs = Date.now() + MISSION_COOLDOWN_MS;
  const missionCooldowns = {
    ...(heir.missionCooldowns ?? {}),
    [missionId]: cooldownExpiresAtMs,
  };

  await updateDoc(heirRef, {
    activeMission: null,
    missionCooldowns,
  });

  return { missionId, cooldownExpiresAtMs };
}
