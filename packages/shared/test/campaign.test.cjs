const test = require("node:test");
const assert = require("node:assert/strict");
const {
  advanceMissionCampaign,
  advanceMissionObjective,
  advanceMissionObjectives,
  areMainMissionObjectivesComplete,
  canExtractFromMission,
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

test("objective missions cannot extract until every main objective is complete", () => {
  const objectiveMission = {
    ...mission,
    campaign: {
      ...mission.campaign,
      maxStages: 12,
      objectives: [
        { id: "goblins", label: "Kill 5 Goblins", kind: "main", target: 5 },
        { id: "king", label: "Defeat the Goblin King", kind: "hidden", target: 1, hiddenUntilDiscovered: true },
      ],
    },
  };
  const initial = createInitialCampaignState(objectiveMission);
  assert.equal(initial.stagesRemaining, 12);
  assert.equal(canExtractFromMission(objectiveMission, initial), false);
  assert.equal(initial.objectiveProgress[1].discovered, false);

  const completed = advanceMissionObjective(initial, "goblins", 5);
  assert.equal(areMainMissionObjectivesComplete(objectiveMission, completed), true);
  assert.equal(canExtractFromMission(objectiveMission, completed), true);
});

test("safe extraction completes an objective mission without consuming another stage", () => {
  const objectiveMission = {
    ...mission,
    campaign: {
      ...mission.campaign,
      objectives: [{ id: "goal", label: "Finish the goal", kind: "main", target: 1 }],
    },
  };
  const state = advanceMissionObjective(createInitialCampaignState(objectiveMission), "goal");
  const result = advanceMissionCampaign({
    ...input("mission_extract"),
    mission: objectiveMission,
    activeMission: {
      ...input("mission_extract").activeMission,
      campaignState: state,
    },
  });
  assert.equal(result.completed, true);
  assert.equal(result.nextCampaignState.stagesRemaining, state.stagesRemaining);
});

test("mission content can advance objectives declaratively", () => {
  const objectiveMission = {
    ...mission,
    campaign: {
      ...mission.campaign,
      objectives: [{ id: "goblins", label: "Kill 5 Goblins", kind: "main", target: 5 }],
    },
  };
  const state = createInitialCampaignState(objectiveMission);
  const advanced = advanceMissionObjectives(state, { goblins: 2 });
  assert.equal(advanced.objectiveProgress[0].current, 2);
  assert.equal(advanced.objectiveProgress[0].completed, false);
});
