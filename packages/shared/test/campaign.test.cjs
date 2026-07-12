const test = require("node:test");
const assert = require("node:assert/strict");
const {
  advanceMissionCampaign,
  createInitialCampaignState,
  rollMissionBoard,
} = require("../dist/campaign/index.js");

const mission = {
  id: "test-mission",
  name: "Test Mission",
  description: "Test",
  difficulty: "F",
  minAdventurerRank: "F",
  minHeirLevel: 1,
  weight: 1,
  type: "explore",
  rewards: { gold: 1, xp: 1, rankXp: 1, items: [] },
  campaign: {
    maxStages: 3,
    startingSupplies: 2,
    steps: [
      {
        text: "Choose",
        choices: [{ id: "costly", label: "Costly", subtitle: "", supplyCost: 3 }],
      },
      { text: "Finish", choices: [{ id: "finish", label: "Finish", subtitle: "" }] },
    ],
  },
};

const lineage = {
  id: "lineage",
  generation: 1,
  publicSummary: { highestGeneration: 1, deadHeirs: 0, currentClass: "warrior" },
};
const heir = {
  id: "heir",
  level: 1,
  classId: "warrior",
  generation: 1,
  completedMissionIds: [],
  seenUniqueMissionEventIds: [],
  stats: {
    strength: 5,
    dexterity: 5,
    intelligence: 5,
    constitution: 5,
    luck: 5,
    charisma: 5,
    faith: 5,
    infamy: 0,
  },
};

function input(choiceId) {
  return {
    mission,
    activeMission: {
      missionId: mission.id,
      missionName: mission.name,
      difficulty: "F",
      slotIndex: 0,
      currentStep: 0,
      totalSteps: mission.campaign.steps.length,
      startedAtMs: 1,
      campaignState: createInitialCampaignState(mission),
    },
    lineage,
    heir,
    adventurerRank: "F",
    choiceId,
    interludeChanceRoll: 1,
    interludePickRoll: 0,
    interludePools: { randomEvents: [], uniqueEvents: [], secretEvents: [] },
  };
}

test("mission advancement rejects unknown choices", () => {
  assert.throws(() => advanceMissionCampaign(input("missing")), /not available/);
});

test("mission advancement rejects unaffordable choices", () => {
  assert.throws(() => advanceMissionCampaign(input("costly")), /Not enough supplies/);
});

test("mission board rolls deterministically for the same hour", () => {
  const context = { lineage, heir, adventurerRank: "F" };
  const first = rollMissionBoard([mission], lineage.id, "F", 1, context, 3_600_000);
  const second = rollMissionBoard([mission], lineage.id, "F", 1, context, 3_600_000);
  assert.deepEqual(first, second);
});
