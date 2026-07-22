const test = require("node:test");
const assert = require("node:assert/strict");
const { canClaimSkill } = require("../dist/skills/index.js");

test("bloodline root is an implicit prerequisite", () => {
  const skill = {
    id: "ancestral_strength",
    name: "Ancestral Strength",
    description: "Test",
    treeScope: "bloodline",
    classTags: [],
    subclassTags: [],
    cost: 1,
    requires: ["bloodline_root"],
    blocks: [],
    grants: [],
  };
  const root = { ...skill, id: "bloodline_root", name: "Bloodline Root", cost: 0, requires: [] };
  const skills = new Map([[skill.id, skill], [root.id, root]]);
  const heir = {
    classId: "warrior",
    level: 1,
    skillIds: [],
    effectIds: [],
    jobRecords: {},
  };
  const lineage = { generation: 1, bloodlineSkillIds: [], publicSummary: { deadHeirs: 0 } };
  const result = canClaimSkill(skill, {
    heir,
    lineage,
    ownedSkillIds: [],
    treeScope: "bloodline",
  }, {
    getSkillById: (id) => skills.get(id),
    getSubclassById: () => undefined,
  });

  assert.equal(result.canClaim, true);
});
