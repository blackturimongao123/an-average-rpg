import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, "game-data", name), "utf8"));
const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};
const uniqueIds = (entries, label) => {
  const seen = new Set();
  for (const entry of entries) {
    assert(typeof entry.id === "string" && entry.id.length > 0, `${label}: missing id`);
    assert(!seen.has(entry.id), `${label}: duplicate id ${entry.id}`);
    seen.add(entry.id);
  }
  return seen;
};

const missions = read("missions.json").missions;
const interludes = read("mission-interludes.json");
const dungeons = read("dungeons.json");
const items = read("items.json").items;
const classes = read("classes.json").classes;
const jobs = read("jobs.json").jobs;
const skills = read("skills.json").skills;

const missionIds = uniqueIds(missions, "missions");
const monsterIds = uniqueIds(dungeons.monsters, "monsters");
const itemIds = uniqueIds(items, "items");
uniqueIds(classes, "classes");
uniqueIds(jobs, "jobs");
uniqueIds(skills, "skills");
uniqueIds(interludes.randomEvents ?? [], "random interludes");
uniqueIds(interludes.uniqueEvents ?? [], "unique interludes");
uniqueIds(interludes.secretEvents ?? [], "secret interludes");

for (const mission of missions) {
  assert(Array.isArray(mission.campaign?.steps), `mission ${mission.id}: missing campaign steps`);
  assert(mission.campaign?.steps?.length === 10, `mission ${mission.id}: expected 10 fixed steps`);
  for (const itemId of mission.rewards?.items ?? []) {
    assert(itemIds.has(itemId), `mission ${mission.id}: unknown reward item ${itemId}`);
  }
  for (const step of mission.campaign?.steps ?? []) {
    const monsterId = step.combatEncounter?.monsterId;
    if (monsterId) assert(monsterIds.has(monsterId), `mission ${mission.id}: unknown monster ${monsterId}`);
  }
  for (const dependency of mission.boardRequirements?.hiddenUntil?.requiresMissionCompleted ?? []) {
    assert(missionIds.has(dependency), `mission ${mission.id}: unknown prerequisite ${dependency}`);
  }
}

for (const event of [
  ...(interludes.randomEvents ?? []),
  ...(interludes.uniqueEvents ?? []),
  ...(interludes.secretEvents ?? []),
]) {
  const monsterId = event.combatEncounter?.monsterId;
  if (monsterId) assert(monsterIds.has(monsterId), `interlude ${event.id}: unknown monster ${monsterId}`);
  for (const dependency of event.requiresMissionCompleted ?? []) {
    assert(missionIds.has(dependency), `interlude ${event.id}: unknown mission ${dependency}`);
  }
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`- ${failure}`);
  console.error(`Game-data validation failed with ${failures.length} issue(s).`);
  process.exitCode = 1;
} else {
  console.log(`Validated ${missions.length} missions, ${monsterIds.size} monsters, and ${itemIds.size} items.`);
}
