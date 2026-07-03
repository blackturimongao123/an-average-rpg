/**
 * Enriches skill tree JSON with nodeType, constellation positions, minor nodes, and hidden nodes.
 * Run: node scripts/enrich-skill-tree-data.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (rel) => JSON.parse(readFileSync(join(root, rel), "utf8"));
const writeJson = (rel, data) =>
  writeFileSync(join(root, rel), `${JSON.stringify(data, null, 2)}\n`, "utf8");

function inferNodeType(skill) {
  if (skill.subclassTags?.length && skill.tier && skill.tier >= 2) {
    return "special";
  }
  if (skill.subclassTags?.length) {
    return "special";
  }
  if (skill.id === "basic_combat") {
    return "special";
  }
  if (skill.grants?.length > 0) {
    const hasPassive = skill.grants.some(
      (g) => g.effectType === "passive" || g.effectType === "buff"
    );
    if (hasPassive && !skill.name.match(/strike|smite|fireball|bolt|shot|slash/i)) {
      return "passive";
    }
    const hasMinorStat = skill.grants.some((g) =>
      g.modifiers?.some((m) => Math.abs(m.value ?? 0) <= 3)
    );
    if (hasMinorStat) {
      return "minor";
    }
    return "passive";
  }
  if (skill.name.match(/strike|smite|fireball|bolt|shot|slash|fury|rage|cry|hands|aegis|dance|fist/i)) {
    return "active";
  }
  if (skill.specialRequirement || skill.jobRequirement) {
    return "special";
  }
  return "active";
}

const CLASS_ARMS = {
  warrior: [
    { angle: -90, branch: "power" },
    { angle: -30, branch: "shield" },
    { angle: 30, branch: "dual" },
    { angle: 90, branch: "tactical" },
    { angle: 150, branch: "paladin" },
  ],
  rogue: [
    { angle: -80, branch: "stealth" },
    { angle: -20, branch: "dual" },
    { angle: 40, branch: "assassin" },
    { angle: 100, branch: "shadow" },
    { angle: 160, branch: "gunslinger" },
  ],
  mage: [
    { angle: -85, branch: "fire" },
    { angle: -25, branch: "frost" },
    { angle: 35, branch: "arcane" },
    { angle: 95, branch: "summon" },
    { angle: 155, branch: "void" },
  ],
  priest: [
    { angle: -85, branch: "heal" },
    { angle: -25, branch: "shield" },
    { angle: 35, branch: "divine" },
    { angle: 95, branch: "bard" },
    { angle: 155, branch: "paladin" },
  ],
  ranger: [
    { angle: -80, branch: "bow" },
    { angle: -20, branch: "beast" },
    { angle: 40, branch: "trap" },
    { angle: 100, branch: "wind" },
    { angle: 160, branch: "gunslinger" },
  ],
};

function assignConstellationPosition(skill, index, classId) {
  if (skill.id === "basic_combat") {
    return { x: 0, y: 0 };
  }

  const arms = CLASS_ARMS[classId] ?? CLASS_ARMS.warrior;
  const primaryClass =
    skill.classTags.find((t) => CLASS_ARMS[t]) ??
    (skill.originClassTags?.[0] && CLASS_ARMS[skill.originClassTags[0]]
      ? skill.originClassTags[0]
      : classId);

  const armIndex =
    skill.subclassTags?.length > 0
      ? hashString(skill.subclassTags[0]) % arms.length
      : hashString(skill.id) % arms.length;

  const arm = arms[armIndex];
  const tier = skill.tier ?? 1;
  const radius = 1.2 + tier * 1.4;
  const rad = (arm.angle * Math.PI) / 180;
  const jitter = ((hashString(skill.id) % 100) - 50) / 200;

  return {
    x: Math.round((Math.sin(rad) * radius + jitter) * 10) / 10,
    y: Math.round((-Math.cos(rad) * radius + jitter * 0.5) * 10) / 10,
  };
}

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function createMinorNode(id, name, stat, value, classTags, requires, position) {
  return {
    id,
    name,
    description: `${name} — a small step on the constellation path.`,
    classTags,
    cost: 1,
    requires,
    blocks: [],
    grants: [
      {
        id: `${id}_effect`,
        name,
        effectType: "passive",
        modifiers: [{ stat, type: "flat", value }],
      },
    ],
    position,
    tier: 1,
    treeScope: "character",
    subclassTags: [],
    nodeType: "minor",
  };
}

const skillsFile = readJson("game-data/skills.json");
const subclassFile = readJson("game-data/subclass-skills.json");
const bloodlineFile = readJson("game-data/bloodline-skills.json");

skillsFile.skills = skillsFile.skills.filter((s) => !s.id.startsWith("minor_"));

for (const skill of skillsFile.skills) {
  skill.nodeType = inferNodeType(skill);
  const classId = skill.classTags[0] ?? "warrior";
  skill.position = assignConstellationPosition(skill, 0, classId);

  if (skill.specialRequirement === "generation_3") {
    skill.isHidden = true;
    skill.hiddenStyle = "crystal";
  }
  if (skill.specialRequirement === "royal_event_completed") {
    skill.isHidden = true;
    skill.hiddenStyle = "shadow_orb";
  }
  if (skill.specialRequirement === "thieves_guild_joined") {
    skill.isHidden = true;
    skill.hiddenStyle = "silhouette";
  }
}

const minorNodes = [];
const minorTemplates = [
  { suffix: "str", name: "+1 Strength", stat: "strength", value: 1 },
  { suffix: "dex", name: "+1 Dexterity", stat: "dexterity", value: 1 },
  { suffix: "con", name: "+1 Constitution", stat: "constitution", value: 1 },
  { suffix: "int", name: "+1 Intelligence", stat: "intelligence", value: 1 },
  { suffix: "lck", name: "+1 Luck", stat: "luck", value: 1 },
];

for (const baseSkill of skillsFile.skills) {
  if (baseSkill.id === "basic_combat" || baseSkill.classTags.length === 0) {
    continue;
  }
  if (baseSkill.requires.length !== 1 || baseSkill.requires[0] !== "basic_combat") {
    continue;
  }

  for (const cls of baseSkill.classTags) {
    const tpl = minorTemplates[hashString(baseSkill.id + cls) % minorTemplates.length];
    const id = `minor_${cls}_${baseSkill.id}_${tpl.suffix}`;
    if (skillsFile.skills.some((s) => s.id === id)) {
      continue;
    }

    const pos = {
      x: (baseSkill.position.x + 0) * 0.55,
      y: (baseSkill.position.y + 0) * 0.55,
    };

    minorNodes.push(
      createMinorNode(
        id,
        tpl.name,
        tpl.stat,
        tpl.value,
        [cls],
        ["basic_combat"],
        pos
      )
    );
  }
}

skillsFile.skills.push(...minorNodes);

for (const skill of subclassFile.skills) {
  skill.nodeType = inferNodeType(skill);
  const classId =
    skill.originClassTags?.[0] ??
    skill.classTags[0] ??
    (skill.subclassTags?.[0]?.includes("paladin") ? "warrior" : "warrior");
  if (!skill.position || (skill.position.x === 0 && skill.position.y === 0 && skill.tier > 0)) {
    skill.position = assignConstellationPosition(skill, 0, classId);
  } else {
    skill.position = {
      x: skill.position.x * 1.15,
      y: skill.position.y * 1.15,
    };
  }
}

for (const skill of bloodlineFile.skills) {
  skill.nodeType = inferNodeType(skill);
  if (skill.id === "bloodline_root") {
    skill.nodeType = "special";
    skill.position = { x: 0, y: 0 };
  } else if (!skill.position) {
    const angle = (hashString(skill.id) % 360) * (Math.PI / 180);
    const radius = 1.5 + (skill.tier ?? 1) * 1.2;
    skill.position = {
      x: Math.round(Math.sin(angle) * radius * 10) / 10,
      y: Math.round(-Math.cos(angle) * radius * 10) / 10,
    };
  }

  if (skill.specialRequirement === "fallen_heirs_3") {
    skill.isHidden = true;
    skill.hiddenStyle = "crystal";
    skill.revealsPaths = bloodlineFile.skills
      .filter((s) => s.id !== skill.id && s.requires?.includes(skill.id))
      .map((s) => s.id);
  }
  if (skill.specialRequirement === "generation_3") {
    skill.isHidden = true;
    skill.hiddenStyle = "shadow_orb";
  }
}

writeJson("game-data/skills.json", skillsFile);
writeJson("game-data/subclass-skills.json", subclassFile);
writeJson("game-data/bloodline-skills.json", bloodlineFile);

console.log(
  `Enriched ${skillsFile.skills.length} base skills (+${minorNodes.length} minor), ${subclassFile.skills.length} subclass, ${bloodlineFile.skills.length} bloodline`
);
