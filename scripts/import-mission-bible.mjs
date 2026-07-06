/**
 * Import mission & interlude content from docs/an_average_rpg_event_mission_bible.md
 *
 * Usage:
 *   node scripts/import-mission-bible.mjs              # Phase 1: F+E missions + all interludes
 *   node scripts/import-mission-bible.mjs --ranks F,E  # explicit rank filter
 *   node scripts/import-mission-bible.mjs --audit-only   # list missing Part III spines
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BIBLE_PATH = path.resolve(ROOT, "docs/an_average_rpg_event_mission_bible.md");
const MISSIONS_OUT = path.resolve(ROOT, "game-data/missions.json");
const INTERLUDES_OUT = path.resolve(ROOT, "game-data/mission-interludes.json");

/** Part II index entries without Part III prose (SSS rank gaps). */
export const MISSING_MISSION_SPINES = [
  "the-last-road-to-no-dawn",
  "the-palace-of-salt-and-teeth",
  "the-mountains-hidden-name",
  "the-dungeon-that-dreams-heirs",
  "the-ruin-of-tomorrows-capital",
  "the-swamp-where-gods-are-buried",
  "the-black-chronicle-page",
  "the-average-ending",
];

const SCENE_PREFIX = "/an-average-rpg/scenes/";
const SCENE_BY_TAG = {
  town_market: "town-shady-mage.png",
  tavern_street: "town-shady-mage.png",
  forest_briar: "forest.png",
  moonlit_wood: "forest.png",
  cave_mouth: "goblin-cave-entrance.png",
  deep_mine: "goblin-cave-inside.png",
  mountain_pass: "mountain.png",
  snow_peak: "mountain.png",
  dungeon_gate: "dungeon-inside.png",
  dark_halls: "dungeon-inside.png",
  coast_harbor: "forest.png",
  tide_rocks: "forest.png",
  swamp_mire: "forest-shrine.png",
  reedbank: "forest-shrine.png",
  road_milestone: "forest-shrine.png",
  gallows_road: "forest-shrine.png",
  ruins_tower: "goblin-king-room.png",
  broken_keep: "goblin-king-room.png",
  chapel_crypt: "dungeon-inside.png",
  bone_vault: "dungeon-inside.png",
};

const SETTING_SCENE = {
  town: "town-shady-mage.png",
  forest: "forest.png",
  cave: "goblin-cave-inside.png",
  mountain: "mountain.png",
  dungeon: "dungeon-inside.png",
  coast: "forest.png",
  swamp: "forest-shrine.png",
  road: "forest-shrine.png",
  ruins: "goblin-king-room.png",
  crypt: "dungeon-inside.png",
};

const RANK_XP_MULT = { F: 10, E: 11, D: 12, C: 14, B: 16, A: 18, S: 20, SS: 22, SSS: 25 };
const RANK_GOLD_BASE = { F: 57, E: 64, D: 71, C: 85, B: 100, A: 120, S: 150, SS: 200, SSS: 300 };

const COMBAT_BY_RANK = {
  F: { monsterId: "cellar_rat", levelScale: 1 },
  E: { monsterId: "goblin_scout", levelScale: 1.1 },
  D: { monsterId: "goblin_warrior", levelScale: 1.1 },
  C: { monsterId: "skeleton_warrior", levelScale: 1 },
  B: { monsterId: "goblin_elite", levelScale: 1.2 },
  A: { monsterId: "goblin_shaman", levelScale: 1.5 },
  S: { monsterId: "lich_lord", levelScale: 0.7 },
  SS: { monsterId: "goblin_elite", levelScale: 2 },
  SSS: { monsterId: "ancient_red_dragon", levelScale: 0.4 },
};

const ARC_TYPE = {
  rescue: "deliver",
  retrieve: "deliver",
  hunt: "combat",
  investigate: "investigate",
  escort: "deliver",
  exorcise: "investigate",
  defend: "combat",
  delve: "explore",
  seal: "investigate",
  negotiate: "investigate",
  sabotage: "combat",
  pilgrimage: "explore",
};

const CLASS_MAP = {
  rogue: "rogue",
  cleric: "priest",
  priest: "priest",
  warrior: "warrior",
  mage: "mage",
  ranger: "ranger",
};

const STAT_NAMES = [
  "strength",
  "dexterity",
  "intelligence",
  "constitution",
  "luck",
  "charisma",
  "faith",
  "infamy",
];

function missionSlug(misId) {
  return misId.replace(/^mis_/, "");
}

function sceneFromTag(tagStr) {
  if (!tagStr) return null;
  const tag = tagStr.split("/")[0].trim();
  const file = SCENE_BY_TAG[tag];
  return file ? `${SCENE_PREFIX}${file}` : null;
}

function sceneForSetting(setting) {
  const file = SETTING_SCENE[setting] ?? "forest.png";
  return `${SCENE_PREFIX}${file}`;
}

function parseTableRow(line) {
  if (!line.startsWith("|") || line.includes("---")) return null;
  const cells = line
    .split("|")
    .slice(1, -1)
    .map((c) => c.trim().replace(/<br>/g, "\n"));
  return cells.length >= 2 ? cells : null;
}

function parseRank(rankStr) {
  const m = rankStr?.match(/Rank\s+([A-Z]+)\+/i);
  return m ? m[1] : "F";
}

function parseMissionNameToSlug(name, nameToSlug) {
  const normalized = name.toLowerCase().replace(/['']/g, "");
  for (const [slug, displayName] of Object.entries(nameToSlug)) {
    if (displayName.toLowerCase().replace(/['']/g, "") === normalized) {
      return slug;
    }
  }
  return normalized
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseBoardHiddenFromSecret(secretText, nameToSlug) {
  const hidden = {};

  const misCompleted = [...secretText.matchAll(/completedMissionIds includes ([\w-]+)/gi)];
  if (misCompleted.length) {
    hidden.requiresMissionCompleted = misCompleted.map((m) => m[1]);
  }

  const charisma = secretText.match(/charisma\s*>=\s*(\d+)/i);
  if (charisma) hidden.requiredStats = { charisma: Number(charisma[1]) };

  const infMax = secretText.match(/infamy\s*<=\s*(\d+)/i);
  if (infMax) hidden.maxInfamy = Number(infMax[1]);

  const cleric = /cleric heir/i.test(secretText);
  if (cleric) {
    hidden.requiredClassIds = ["priest"];
    hidden.classOrStatGate = true;
    if (infMax) hidden.classOrStatGate = true;
  }

  const genGate = secretText.match(/lineage generation\s*>=\s*(\d+)/i);
  if (genGate) hidden.generationAtLeast = Number(genGate[1]);

  const deadGate = secretText.match(/at least\s+(\d+)\s+dead heirs/i);
  if (deadGate) hidden.deadHeirsAtLeast = Number(deadGate[1]);

  const orMissions = secretText.match(/Requires\s+(.+?)\s+or\s+(.+?)(?:\.|$)/i);
  if (orMissions) {
    hidden.anyMissionCompleted = [
      parseMissionNameToSlug(orMissions[1].replace(/^completed\s+/i, "").trim(), nameToSlug),
      parseMissionNameToSlug(orMissions[2].trim(), nameToSlug),
    ].filter(Boolean);
  }

  const andMission = secretText.match(/Requires completed\s+(.+?)(?:\s+and|$)/i);
  if (andMission && !hidden.anyMissionCompleted?.length) {
    const slug = parseMissionNameToSlug(andMission[1].trim(), nameToSlug);
    if (slug) {
      hidden.requiresMissionCompleted = [...(hidden.requiresMissionCompleted ?? []), slug];
    }
  }

  return Object.keys(hidden).length ? hidden : undefined;
}

function parseEligibilityText(text, nameToSlug, options = {}) {
  const { forBoard = false } = options;
  const result = {
    settings: [],
    minHeirLevel: undefined,
    minAdventurerRank: undefined,
    requiresMissionCompleted: [],
    generationAtLeast: undefined,
    requiredClassIds: [],
    requiredStats: {},
    classOrStatGate: false,
    minInfamy: undefined,
    maxInfamy: undefined,
    deadHeirsAtLeast: undefined,
    secretConditions: [],
    boardHiddenUntil: undefined,
    isUnique: false,
  };

  if (!text) return result;

  const bg = text.match(/[Bb]ackground:\s*(\w+)/);
  if (bg) result.settings = [bg[1]];

  const level = text.match(/[Ll]evel\s*>=\s*(\d+)/);
  if (level) result.minHeirLevel = Number(level[1]);

  const rank = text.match(/rank\s+([A-Z]+)\+/i);
  if (rank) result.minAdventurerRank = rank[1];

  const gen = text.match(/lineage generation\s*>=\s*(\d+)/i);
  if (gen) result.generationAtLeast = Number(gen[1]);

  const dead = text.match(/(\d+)\s+dead heirs/i);
  if (dead) result.deadHeirsAtLeast = Number(dead[1]);

  const infamyMin = text.match(/infamy\s*>=\s*(\d+)/i);
  if (infamyMin) result.minInfamy = Number(infamyMin[1]);

  const infamyMax = text.match(/infamy\s*<=\s*(\d+)/i);
  if (infamyMax) result.maxInfamy = Number(infamyMax[1]);

  const completedMatches = [...text.matchAll(/completedMissionIds includes ([\w-]+)/gi)];
  for (const m of completedMatches) {
    result.requiresMissionCompleted.push(m[1]);
  }

  const completedName = text.match(/completed\s+([^.;]+?)(?:\s+and|\s+or|\.|$)/i);
  if (completedName && !text.includes("completedMissionIds")) {
    const slug = parseMissionNameToSlug(completedName[1].trim(), nameToSlug);
    if (slug) result.requiresMissionCompleted.push(slug);
  }

  if (/one-time unique per heir/i.test(text)) {
    result.isUnique = true;
  }

  const classOrStat = text.match(/Requires\s+(\w+)\s*>=\s*(\d+)\s+or\s+(\w+)\s+class/i);
  if (classOrStat) {
    const stat = classOrStat[1].toLowerCase();
    if (STAT_NAMES.includes(stat)) {
      result.requiredStats[stat] = Number(classOrStat[2]);
    }
    const classId = CLASS_MAP[classOrStat[3].toLowerCase()];
    if (classId) result.requiredClassIds.push(classId);
    result.classOrStatGate = true;
  }

  const statOnly = text.match(/Requires\s+(\w+)\s*>=\s*(\d+)/gi);
  if (statOnly && !result.classOrStatGate) {
    for (const match of statOnly) {
      const parts = match.match(/Requires\s+(\w+)\s*>=\s*(\d+)/i);
      if (parts) {
        const stat = parts[1].toLowerCase();
        if (STAT_NAMES.includes(stat)) {
          result.requiredStats[stat] = Number(parts[2]);
        }
      }
    }
  }

  const classOnly = text.match(/(?:Requires\s+)?(\w+)\s+class/i);
  if (classOnly && !result.classOrStatGate) {
    const classId = CLASS_MAP[classOnly[1].toLowerCase()];
    if (classId) result.requiredClassIds.push(classId);
  }

  const secretPart = text.match(/Secret:\s*(.+)$/i);
  if (secretPart) {
    const secretText = secretPart[1];
    const cleric = /cleric heir/i.test(secretText);

    if (forBoard) {
      result.boardHiddenUntil = parseBoardHiddenFromSecret(secretText, nameToSlug);
    } else if (/hidden variant/i.test(secretText) || /hidden until/i.test(secretText)) {
      result.boardHiddenUntil = parseBoardHiddenFromSecret(secretText, nameToSlug);
    }

    const secretLevel = secretText.match(/level\s*>=\s*(\d+)/i);
    if (secretLevel) {
      result.secretConditions.push({ type: "minHeirLevel", value: Number(secretLevel[1]) });
    }
    if (gen) {
      result.secretConditions.push({ type: "generationAtLeast", value: result.generationAtLeast });
    }
    for (const m of completedMatches) {
      result.secretConditions.push({ type: "missionCompleted", missionId: m[1] });
    }
    if (dead) {
      result.secretConditions.push({ type: "deadHeirsAtLeast", value: result.deadHeirsAtLeast });
    }
    if (infamyMin) {
      result.secretConditions.push({ type: "infamyAtLeast", value: result.minInfamy });
    }
    if (infamyMax && cleric) {
      result.secretConditions.push({ type: "infamyAtMost", value: result.maxInfamy });
      result.secretConditions.push({ type: "classId", classId: "priest" });
    }
  }

  return result;
}

function parseInterludeRow(cells, nameToSlug) {
  const [id, title, typeTone, eligibility, promptBlock] = cells;
  if (!id?.startsWith("evt_")) return null;

  const typeMatch = typeTone.match(/(random interlude|unique event|secret event)/i);
  const toneMatch = typeTone.match(/(mild|moderate|dangerous|lethal)/i);
  const kind = typeMatch?.[1].toLowerCase().includes("unique")
    ? "unique"
    : typeMatch?.[1].toLowerCase().includes("secret")
      ? "secret"
      : "random";

  const elig = parseEligibilityText(eligibility, nameToSlug);

  const promptMatch = promptBlock.match(/Prompt:\s*(.+?)(?:<br>|\n)Outcome:/s);
  const text = (promptMatch?.[1] ?? promptBlock).replace(/<br>/g, " ").trim();

  const sceneMatch = promptBlock.match(/Scene:\s*([\w_/]+)/);
  const sceneImage = sceneFromTag(sceneMatch?.[1]) ?? sceneForSetting(elig.settings[0] ?? "town");

  const base = {
    id,
    weight: kind === "secret" ? 8 : kind === "unique" ? 6 : 12,
    maxPerRun: kind === "unique" || /one-time unique/i.test(eligibility) ? 1 : 2,
    title,
    text,
    eventType: toneMatch?.[1] === "dangerous" || toneMatch?.[1] === "lethal" ? "hazard" : "social",
    timeCost: toneMatch?.[1] === "mild" ? "low" : "normal",
    sceneImage,
    settings: elig.settings.length ? elig.settings : undefined,
    tones: toneMatch ? [toneMatch[1]] : undefined,
    minHeirLevel: elig.minHeirLevel,
    minAdventurerRank: elig.minAdventurerRank,
    requiresMissionCompleted: elig.requiresMissionCompleted.length
      ? elig.requiresMissionCompleted
      : undefined,
    generationAtLeast: elig.generationAtLeast,
    requiredClassIds: elig.requiredClassIds.length ? elig.requiredClassIds : undefined,
    requiredStats: Object.keys(elig.requiredStats).length ? elig.requiredStats : undefined,
    classOrStatGate: elig.classOrStatGate || undefined,
    minInfamy: elig.minInfamy,
    maxInfamy: elig.maxInfamy,
    deadHeirsAtLeast: elig.deadHeirsAtLeast,
  };

  if (kind === "secret") {
    return {
      kind,
      event: {
        ...base,
        conditions: elig.secretConditions.length
          ? elig.secretConditions
          : elig.requiresMissionCompleted.map((missionId) => ({
              type: "missionCompleted",
              missionId,
            })),
      },
    };
  }

  return { kind, event: base };
}

function firstStepChoices(arc, tone) {
  if (tone === "mild") {
    return [
      {
        id: "ask_locals",
        label: "Ask Locals",
        subtitle: "Gather rumors before moving",
        tags: [{ label: "Morale +4", tone: "reward" }],
        moraleDelta: 4,
        stageCost: 1,
      },
      {
        id: "move_fast",
        label: "Move Quickly",
        subtitle: "Beat curfew or weather",
        tags: [{ label: "Time Save", tone: "neutral" }],
        stageCost: 1,
        hpDelta: -4,
      },
      {
        id: "prepare",
        label: "Buy Supplies",
        subtitle: "Spend coin for an easier run",
        tags: [{ label: "-5 Supplies", tone: "cost" }],
        supplyCost: 5,
        moraleDelta: 5,
        stageCost: 1,
      },
    ];
  }

  const arcLabels = {
    rescue: "Search the area",
    retrieve: "Trace the object",
    hunt: "Follow the tracks",
    investigate: "Question witnesses",
    escort: "Scout the route",
    exorcise: "Prepare rites",
    defend: "Fortify position",
    delve: "Map the depths",
    seal: "Study the seal",
    negotiate: "Open talks",
    sabotage: "Scout targets",
    pilgrimage: "Mark the path",
  };

  return [
    {
      id: "scout",
      label: "Scout Ahead",
      subtitle: arcLabels[arc] ?? "Survey before committing",
      tags: [{ label: "Morale +3", tone: "reward" }],
      moraleDelta: 3,
      stageCost: 1,
    },
    {
      id: "push",
      label: "Push Forward",
      subtitle: "Speed over caution",
      tags: [
        { label: "High Risk", tone: "risk" },
        { label: "HP -6", tone: "cost" },
      ],
      stageCost: 1,
      hpDelta: -6,
    },
    {
      id: "camp",
      label: "Brief Rest",
      subtitle: "Recover before the hard stretch",
      tags: [
        { label: "Restore HP", tone: "reward" },
        { label: "-8 Supplies", tone: "cost" },
      ],
      supplyCost: 8,
      hpDelta: 12,
      stageCost: 1,
    },
  ];
}

function choiceBeatChoices(prose) {
  return [
    {
      id: "cautious",
      label: "Proceed Carefully",
      subtitle: "Minimize risk",
      tags: [{ label: "Low Risk", tone: "neutral" }],
      moraleDelta: 2,
      stageCost: 1,
    },
    {
      id: "bold",
      label: "Act Decisively",
      subtitle: "Take the hard line",
      tags: [
        { label: "High Risk", tone: "risk" },
        { label: "High Reward", tone: "reward" },
      ],
      stageCost: 1,
      hpDelta: -5,
    },
    {
      id: "clever",
      label: "Find Another Way",
      subtitle: prose.slice(0, 60),
      tags: [{ label: "Morale +1", tone: "reward" }],
      moraleDelta: 1,
      stageCost: 1,
    },
  ];
}

function beatToStep(beat, rank, setting, sceneImage, arc) {
  const eventType =
    beat.type === "combat"
      ? "combat"
      : beat.type === "hazard"
        ? "hazard"
        : beat.type === "discovery"
          ? "discovery"
          : beat.type === "choice"
            ? "social"
            : "social";

  const step = {
    title: beat.name,
    text: beat.prose,
    eventType,
    timeCost: beat.type === "combat" ? "high" : "normal",
    sceneImage,
    kind: "fixed",
  };

  if (beat.type === "combat") {
    step.combatEncounter = COMBAT_BY_RANK[rank] ?? COMBAT_BY_RANK.F;
  }
  if (beat.type === "choice") {
    step.choices = choiceBeatChoices(beat.prose);
  }
  if (beat.index === 1) {
    step.choices = firstStepChoices(arc, rank === "F" || rank === "E" ? "mild" : "moderate");
  }

  return step;
}

function parsePartI(lines, nameToSlug) {
  const randomEvents = [];
  const secretEvents = [];
  const uniqueEvents = [];

  for (const line of lines) {
    const cells = parseTableRow(line);
    if (!cells || !cells[0]?.startsWith("evt_")) continue;
    const parsed = parseInterludeRow(cells, nameToSlug);
    if (!parsed) continue;
    if (parsed.kind === "secret") secretEvents.push(parsed.event);
    else if (parsed.kind === "unique") uniqueEvents.push(parsed.event);
    else randomEvents.push(parsed.event);
  }

  return { randomEvents, secretEvents, uniqueEvents };
}

function parsePartII(lines) {
  const index = new Map();

  for (const line of lines) {
    const cells = parseTableRow(line);
    if (!cells || !cells[0]?.startsWith("mis_")) continue;

    const [misId, name, setting, arc, minLv, eligibility] = cells;
    const slug = missionSlug(misId);
    index.set(slug, {
      misId,
      slug,
      name,
      setting,
      arc,
      minLevel: Number(minLv),
      eligibility,
    });
  }

  return index;
}

function parsePartIII(content, nameToSlug) {
  const spines = new Map();
  const sections = content.split(/^### mis_/m).slice(1);

  for (const section of sections) {
    const headerEnd = section.indexOf("\n");
    const header = section.slice(0, headerEnd);
    const body = section.slice(headerEnd);

    const [misId, name] = header.split(" — ").map((s) => s.trim());
    const slug = missionSlug(misId);

    const rankLine = body.match(/Rank\s+(\w+)/);
    const rank = rankLine?.[1] ?? "F";
    const toneLine = body.match(/Tone:\s*(\w+)/);
    const tone = toneLine?.[1] ?? "mild";
    const settingLine = body.match(/Setting:\s*(\w+)/);
    const setting = settingLine?.[1] ?? "town";
    const arcLine = body.match(/Arc:\s*(\w+)/);
    const arc = arcLine?.[1] ?? "investigate";
    const sceneLine = body.match(/Scene:\s*([\w_/]+)/);
    const sceneImage = sceneFromTag(sceneLine?.[1]) ?? sceneForSetting(setting);

    const rewardLine = body.match(/Reward:\s*(\d+)\s*gold,\s*(\d+)\s*rank XP/i);
    const gold = rewardLine ? Number(rewardLine[1]) : RANK_GOLD_BASE[rank] ?? 50;
    const rankXp = rewardLine ? Number(rewardLine[2]) : RANK_XP_MULT[rank] ?? 10;

    const clientLine = body.match(/Client:\s*([^|]+)/);
    const focusLine = body.match(/Focus:\s*([^|]+)/);
    const threatLine = body.match(/Main threat:\s*([^|]+)/);

    const beats = [];
    const tableLines = body.split("\n").filter((l) => /^\|\s*\d+\s*\|/.test(l));
    for (const row of tableLines) {
      const cells = parseTableRow(row);
      if (!cells || cells.length < 4) continue;
      const stepNum = Number(cells[0]);
      if (!stepNum) continue;
      beats.push({
        index: stepNum,
        name: cells[1],
        type: cells[2].toLowerCase(),
        prose: cells[3],
      });
    }

    spines.set(slug, {
      slug,
      misId,
      name,
      rank,
      tone,
      setting,
      arc,
      sceneImage,
      gold,
      rankXp,
      description: [clientLine?.[1], focusLine?.[1], threatLine?.[1]]
        .filter(Boolean)
        .join(" — ")
        .trim(),
      beats,
      eligibility: body.match(/Eligibility:\s*(.+)$/m)?.[1] ?? "",
    });
  }

  return spines;
}

function buildMission(indexEntry, spine, nameToSlug) {
  const elig = parseEligibilityText(
    indexEntry?.eligibility ?? spine.eligibility,
    nameToSlug,
    { forBoard: true }
  );

  const steps = spine.beats.map((beat) =>
    beatToStep(beat, spine.rank, spine.setting, spine.sceneImage, spine.arc)
  );

  const mission = {
    id: spine.slug,
    name: spine.name,
    description: spine.description || `${spine.name} — guild contract.`,
    difficulty: spine.rank,
    minAdventurerRank: spine.rank,
    minHeirLevel: indexEntry?.minLevel ?? spine.beats.length,
    weight: 100,
    type: ARC_TYPE[spine.arc] ?? "investigate",
    arc: spine.arc,
    rewards: {
      gold: spine.gold,
      xp: Math.round(spine.gold * 0.28),
      rankXp: spine.rankXp,
      items: [],
    },
    campaign: {
      regionName: spine.name,
      setting: spine.setting,
      tone: spine.tone,
      defaultSceneImage: spine.sceneImage,
      maxStages: 14,
      startingSupplies: 22 + (indexEntry?.minLevel ?? 1),
      randomEventChance: 0.38,
      steps,
    },
  };

  if (elig.boardHiddenUntil) {
    mission.boardRequirements = { hiddenUntil: elig.boardHiddenUntil };
  }

  return mission;
}

function main() {
  const args = process.argv.slice(2);
  const auditOnly = args.includes("--audit-only");
  const ranksArg = args.find((a) => a.startsWith("--ranks"));
  const rankFilter = ranksArg
    ? ranksArg.split("=")[1]?.split(",").map((r) => r.trim().toUpperCase()) ?? ["F", "E"]
    : args.includes("--all-ranks")
      ? null
      : ["F", "E"];

  const bible = readFileSync(BIBLE_PATH, "utf8");
  const partISplit = bible.indexOf("# Part II");
  const partIIISplit = bible.indexOf("# Part III");

  const partI = bible.slice(0, partISplit);
  const partII = bible.slice(partISplit, partIIISplit);
  const partIII = bible.slice(partIIISplit);

  const index = parsePartII(partII.split("\n"));
  const nameToSlug = Object.fromEntries(
    [...index.values()].map((e) => [e.slug, e.name])
  );
  const spines = parsePartIII(partIII, nameToSlug);

  const indexSlugs = [...index.keys()];
  const spineSlugSet = new Set(spines.keys());
  const missing = indexSlugs.filter((slug) => !spineSlugSet.has(slug));

  console.log(`Part II index: ${indexSlugs.length} contracts`);
  console.log(`Part III spines: ${spineSlugSet.size} missions`);
  if (missing.length) {
    console.log(`Missing Part III spines (${missing.length}):`);
    for (const slug of missing) {
      console.log(`  - ${slug}`);
    }
  }

  if (auditOnly) {
    process.exit(missing.length ? 1 : 0);
  }

  if (missing.some((s) => !MISSING_MISSION_SPINES.includes(s))) {
    const unexpected = missing.filter((s) => !MISSING_MISSION_SPINES.includes(s));
    throw new Error(`Unexpected missing spines (not in known list): ${unexpected.join(", ")}`);
  }

  const interludes = parsePartI(partI.split("\n"), nameToSlug);
  console.log(
    `Interludes: ${interludes.randomEvents.length} random, ${interludes.uniqueEvents.length} unique, ${interludes.secretEvents.length} secret`
  );

  if (interludes.randomEvents.length + interludes.uniqueEvents.length + interludes.secretEvents.length !== 200) {
    console.warn(
      `Warning: expected 200 interludes, got ${
        interludes.randomEvents.length + interludes.uniqueEvents.length + interludes.secretEvents.length
      }`
    );
  }

  const missions = [];
  for (const [slug, spine] of spines) {
    if (rankFilter && !rankFilter.includes(spine.rank)) continue;
    if (spine.beats.length !== 10) {
      throw new Error(`Mission ${slug} has ${spine.beats.length} steps, expected 10`);
    }
    const indexEntry = index.get(slug);
    missions.push(buildMission(indexEntry, spine, nameToSlug));
  }

  console.log(`Exporting ${missions.length} missions (ranks: ${rankFilter?.join(",") ?? "ALL"})`);

  writeFileSync(INTERLUDES_OUT, `${JSON.stringify(interludes, null, 2)}\n`, "utf8");
  writeFileSync(MISSIONS_OUT, `${JSON.stringify({ missions }, null, 2)}\n`, "utf8");

  console.log(`Wrote ${INTERLUDES_OUT}`);
  console.log(`Wrote ${MISSIONS_OUT}`);
}

main();
