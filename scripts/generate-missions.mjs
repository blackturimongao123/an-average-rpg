/**
 * @deprecated Use scripts/import-mission-bible.mjs — canonical source is docs/an_average_rpg_event_mission_bible.md
 * Generates game-data/missions.json — 115+ guild contracts, each with 10 fixed plot steps.
 * Run: node scripts/generate-missions.mjs
 */

console.error(
  "DEPRECATED: Use `node scripts/import-mission-bible.mjs` instead.\n" +
    "Canonical content: docs/an_average_rpg_event_mission_bible.md"
);
process.exit(1);

import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../game-data/missions.json");

const SCENES = {
  town: "/an-average-rpg/scenes/town-shady-mage.png",
  forest: "/an-average-rpg/scenes/forest.png",
  wilderness: "/an-average-rpg/scenes/forest-shrine.png",
  cave: "/an-average-rpg/scenes/goblin-cave-inside.png",
  caveEntrance: "/an-average-rpg/scenes/goblin-cave-entrance.png",
  mountain: "/an-average-rpg/scenes/mountain.png",
  dungeon: "/an-average-rpg/scenes/dungeon-inside.png",
  coast: "/an-average-rpg/scenes/forest.png",
  forestCave: "/an-average-rpg/scenes/forest-goblin-cave.png",
  throne: "/an-average-rpg/scenes/goblin-king-room.png",
};

const RANKS = ["F", "E", "D", "C", "B", "A", "S", "SS", "SSS"];
const RANK_MIN_LEVEL = { F: 1, E: 2, D: 4, C: 6, B: 8, A: 10, S: 12, SS: 14, SSS: 16 };
const RANK_MIN_RANK = { F: "F", E: "F", D: "E", C: "D", B: "C", A: "B", S: "A", SS: "S", SSS: "SS" };
const RANK_GOLD = { F: 10, E: 18, D: 32, C: 52, B: 78, A: 115, S: 170, SS: 280, SSS: 450 };
const RANK_XP = { F: 16, E: 28, D: 48, C: 75, B: 110, A: 155, S: 220, SS: 340, SSS: 520 };
const RANK_RANK_XP = { F: 8, E: 12, D: 20, C: 32, B: 48, A: 70, S: 100, SS: 150, SSS: 220 };

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

function slug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 44);
}

function rankForIndex(i, total) {
  const idx = Math.min(RANKS.length - 1, Math.floor((i / total) * RANKS.length));
  return RANKS[idx];
}

const SETTING_CONFIG = {
  town: {
    scene: SCENES.town,
    region: "Lower Market Quarter",
    tone: "mild",
    type: "deliver",
    count: 18,
    hooks: [
      ["Lost Cat", "widow's tabby Misty", "return the cat before curfew", "guild clerk"],
      ["Missing Heirloom", "stolen locket", "recover the locket from fence", "noble house"],
      ["Bread Riot", "hungry crowd", "calm the riot without blood", "baker's guild"],
      ["False Prophet", "street preacher", "expose the fraud", "temple warden"],
      ["Runaway Apprentice", "fleeing apprentice", "bring them back alive", "master artisan"],
      ["Poisoned Well", "tainted cistern", "find who poisoned the well", "city watch"],
      ["Lantern Thief", "stolen lanterns", "catch the thief", "night watch"],
      ["Debt Collector", "shy debtor", "escort payment to creditor", "moneylender"],
      ["Lost Letter", "sealed letter", "deliver without opening", "courier guild"],
      ["Rat King's Claim", "cellar legend", "prove the rat king is myth", "innkeeper"],
      ["Market Fire", "smoke in stalls", "find the arsonist", "merchant league"],
      ["Mute Witness", "silent child", "learn what the child saw", "magistrate"],
      ["Guild Sabotage", "ruined tools", "identify the saboteur", "smith guild"],
      ["Wedding Ring", "lost ring", "find ring before vows", "bride's family"],
      ["Sick Messenger", "ill courier", "finish the delivery route", "postmaster"],
      ["Painted Threat", "graffiti warnings", "trace who paints threats", "guard captain"],
      ["Charity Chest", "emptied chest", "recover stolen donations", "abbess"],
      ["Clock Tower Stuck", "frozen bell", "fix the mechanism", "clockmaker"],
      ["Alley Duel", "scheduled duel", "prevent illegal duel deaths", "city judge"],
    ],
  },
  forest: {
    scene: SCENES.forest,
    region: "Greenveil Woods",
    tone: "moderate",
    type: "explore",
    count: 17,
    hooks: [
      ["Lost Courier", "missing courier", "recover the parcel", "merchant"],
      ["Wolf Pact", "bold wolves", "drive wolves from the road", "woodcutter"],
      ["Herb Rush", "moonpetal bloom", "gather herbs before dawn", "apothecary"],
      ["Bandit Map", "stolen map", "retrieve map from bandits", "ranger"],
      ["Sacred Grove", "desecrated grove", "restore the grove", "druid circle"],
      ["Hunter's Debt", "missing hunter", "find hunter or proof of fate", "village elder"],
      ["Bridge Sabotage", "cut ropes", "repair bridge before caravan", "caravan master"],
      ["Fey Lights", "will-o-wisps", "learn what lures travelers", "scholar"],
      ["Beast Tracks", "unknown tracks", "identify the beast", "hunter guild"],
      ["Stolen Bees", "hive theft", "recover hives", "beekeeper"],
      ["Dryad's Plea", "weeping tree", "negotiate with forest spirit", "forester"],
      ["Ambush Road", "road ambushes", "break up ambush gang", "guild patrol"],
      ["Lost Dog Sled", "runaway sled", "recover sled and dogs", "trapper"],
      ["Mushroom Blight", "toxic fungus", "contain the blight", "herbalist"],
      ["Poacher Camp", "illegal hunters", "shut down poachers", "warden"],
      ["Ancient Path", "buried road", "map the old highway", "historian"],
      ["Nest Clearing", "harpy rumors", "confirm or deny nest", "militia"],
    ],
  },
  wilderness: {
    scene: SCENES.wilderness,
    region: "Ashwind Expanse",
    tone: "moderate",
    count: 16,
    hooks: [
      ["Nomad Treaty", "broken treaty", "restore peace talks", "nomad khan"],
      ["Dust Tomb", "uncovered tomb", "seal tomb before looters", "archaeologist"],
      ["Mirage Oasis", "false oasis", "mark safe water for caravans", "caravan guild"],
      ["Scorpion Nest", "road scorpions", "clear nest near trail", "guide"],
      ["Salt Theft", "stolen salt", "recover caravan salt", "salt merchant"],
      ["Bone Warnings", "bone cairns", "learn who builds warnings", "scout captain"],
      ["Lost Shrine", "buried shrine", "reconsecrate shrine", "wandering priest"],
      ["Storm Shelter", "collapsed shelter", "rebuild before next storm", "survivors"],
      ["Vulture King", "giant vultures", "cull predators", "herder"],
      ["Star Metal", "meteor fragment", "retrieve fragment safely", "armorer"],
      ["Dust Cult", "desert cult", "disrupt ritual", "inquisitor"],
      ["Trade Route", "blocked route", "reopen passage", "trade council"],
      ["Water War", "poisoned well", "find clean water source", "refugee leader"],
      ["Sand Pirates", "dune raiders", "break raider camp", "governor"],
      ["Echo Canyon", "killing echoes", "map safe passage", "prospector"],
      ["Buried Library", "sand library", "salvage scrolls", "mage college"],
    ],
  },
  cave: {
    scene: SCENES.cave,
    region: "Hollowridge Caves",
    tone: "moderate",
    count: 17,
    hooks: [
      ["Miner's Plea", "trapped miners", "rescue survivors", "mine foreman"],
      ["Goblin Ledger", "smuggler ledger", "steal ledger for guild", "tax collector"],
      ["Crystal Theft", "stolen crystals", "recover crystals", "jeweler"],
      ["Flooded Tunnel", "flooded shaft", "open drainage path", "engineer"],
      ["Bat Plague", "sick bats", "find infection source", "physician"],
      ["Cave Choir", "singing depths", "identify sound source", "bard college"],
      ["Ore Claim", "disputed vein", "secure ore rights", "mining guild"],
      ["Fungal Feast", "giant fungi", "harvest safely", "chef guild"],
      ["Rope Gang", "cave bandits", "break bandit hold", "sheriff"],
      ["Lost Cart", "abandoned cart", "recover goods", "merchant"],
      ["Gas Pocket", "deadly gas", "vent pocket safely", "alchemist"],
      ["Underground River", "hidden river", "chart river path", "navigator"],
      ["Fossil Theft", "stolen fossils", "return fossils", "museum"],
      ["Echo Prison", "whispering cells", "free trapped voices", "medium"],
      ["Slimed Gate", "slime blocked gate", "clear guild access", "adventurer guild"],
      ["Cave Shrine", "dark shrine", "desecrate or cleanse", "temple"],
      ["Bat King", "giant bat", "drive bat from roost", "village"],
    ],
  },
  mountain: {
    scene: SCENES.mountain,
    region: "Ironspine Heights",
    tone: "dangerous",
    count: 17,
    hooks: [
      ["Wyvern Scare", "wyvern nest", "scare wyvern from farms", "farmer league"],
      ["Cliff Rescue", "stranded climber", "bring climber down", "rescue guild"],
      ["Avalanche Path", "unstable slope", "mark safe route", "pathfinder"],
      ["Eagle Theft", "stolen eggs", "recover eggs or negotiate", "ranger"],
      ["Frozen Mercenary", "ice corpse", "recover mercenary tags", "war office"],
      ["Summit Relic", "peak relic", "retrieve relic", "monastery"],
      ["Ice Bridge", "failing bridge", "reinforce crossing", "caravan"],
      ["Harpy Harass", "harpy raids", "stop raids on goats", "herder"],
      ["Ore Avalanche", "buried vein", "dig out ore", "smith guild"],
      ["Storm Shrine", "lightning shrine", "appease storm spirit", "storm priest"],
      ["Crevasse Map", "hidden crevasse", "map deadly cracks", "survey team"],
      ["Dragon Scale", "shed scales", "gather scales safely", "armorer"],
      ["Goat War", "mountain goats", "relocate aggressive herd", "village"],
      ["Hermit Oracle", "mad hermit", "bring prophecy to lord", "noble"],
      ["Rockslide Cult", "rock cultists", "break cult ritual", "inquisitor"],
      ["Frozen Banner", "lost banner", "recover regiment banner", "veteran"],
      ["Peak Signal", "signal fire", "light summit beacon", "border guard"],
    ],
  },
  dungeon: {
    scene: SCENES.dungeon,
    region: "Crypt of Kings",
    tone: "dangerous",
    count: 17,
    hooks: [
      ["Crypt Cleanup", "rising dead", "put undead to rest", "gravekeeper"],
      ["Relic Hunt", "holy relic", "recover relic", "church"],
      ["Cult Hideout", "sewer cult", "break hideout", "temple"],
      ["Phylactery Hint", "lich rumor", "destroy fragment", "mage guild"],
      ["Tomb Robbers", "active robbers", "stop robbery", "curator"],
      ["Chained Door", "sealed door", "open without unleashing", "historian"],
      ["Bone Archive", "bone library", "catalog remains", "scholar"],
      ["Vampire Nest", "blood rumors", "confirm nest", "inquisitor"],
      ["Cursed Armor", "haunted armor", "retrieve and bind", "knight order"],
      ["Prison Break", "ancient prison", "re-seal cells", "warden"],
      ["King's Debt", "royal tomb", "recover signet ring", "crown"],
      ["Demon Sigil", "summoning circle", "break circle", "cleric council"],
      ["Wraith Pact", "wraith deal", "void illegal pact", "judge"],
      ["Sarcophagus Sale", "black market tomb", "raid auction", "guard"],
      ["Undead Choir", "singing dead", "silence choir", "choirmaster"],
      ["Iron Maiden", "torture device", "destroy device", "survivor guild"],
      ["Last Heir", "tomb heir", "escort heir out alive", "family lawyer"],
    ],
  },
  coast: {
    scene: SCENES.coast,
    region: "Saltmere Coast",
    tone: "moderate",
    count: 17,
    hooks: [
      ["Lost Net", "missing nets", "recover fishing nets", "fisher guild"],
      ["Smuggler Cove", "smuggler cove", "map cove for watch", "harbor master"],
      ["Lighthouse Fix", "broken lighthouse", "repair beacon", "captain"],
      ["Kraken Hoax", "sea monster rumor", "prove hoax or hunt", "mayor"],
      ["Pearl Theft", "stolen pearls", "catch thief", "diver"],
      ["Tide Cave", "flooded cave", "retrieve cargo", "merchant"],
      ["Gull Curse", "hostile gulls", "break curse or cull", "witch"],
      ["Shipwreck Map", "wreck chart", "salvage wreck", "insurer"],
      ["Salt Contract", "salt delivery", "deliver before storm", "factor"],
      ["Rope Ferry", "ferry accident", "restore ferry", "ferryman"],
      ["Harbor Tax Riot", "tax riot", "calm riot", "collector"],
      ["Sea Priest", "drowned priest", "recover body respectfully", "temple"],
      ["Coral Theft", "coral poachers", "stop poachers", "reef warden"],
      ["Fog Pirates", "fog raiders", "break raiding camp", "navy"],
      ["Message Bottles", "bottle messages", "trace message source", "scholar"],
      ["Beached Leviathan", "beached beast", "scare beast back", "village"],
      ["Harbor Fire", "dock fire", "find arsonist", "dock union"],
    ],
  },
};

const STEP_BLUEPRINT = [
  { key: "brief", title: "Contract Briefing", eventType: "social", timeCost: "normal" },
  { key: "depart", title: "Setting Out", eventType: "discovery", timeCost: "normal" },
  { key: "leg1", title: "First Stretch", eventType: "hazard", timeCost: "normal" },
  { key: "twist", title: "Complication", eventType: "discovery", timeCost: "normal" },
  { key: "deep", title: "Deeper In", eventType: "hazard", timeCost: "normal" },
  { key: "intel", title: "New Intelligence", eventType: "social", timeCost: "normal" },
  { key: "pressure", title: "Pressure Builds", eventType: "hazard", timeCost: "high" },
  { key: "crisis", title: "Crisis Point", eventType: "discovery", timeCost: "high" },
  { key: "after", title: "Aftermath", eventType: "discovery", timeCost: "normal" },
  { key: "pay", title: "Contract Closed", eventType: "social", timeCost: "low" },
];

function stepText(blueprint, hook, objective, patron, stepIndex) {
  const [name, problem, goal, client] = hook;
  const lines = {
    brief: `The ${client} posts contract "${name}": ${problem}. Your orders are clear — ${goal}.`,
    depart: `You leave for ${name.toLowerCase()} with the guild seal still warm in your pack.`,
    leg1: `The first leg tests patience more than steel — ${problem} leaves traces everywhere.`,
    twist: `New details surface: ${goal} may not be as simple as the posting claimed.`,
    deep: `Deeper into the work, the ${client}'s warnings start to make terrible sense.`,
    intel: `A witness, ledger, or rumor gives you leverage — if you act before nightfall.`,
    pressure: `Time tightens. ${problem} escalates while the ${client}'s coin waits unspent.`,
    crisis: `The heart of "${name}" — ${goal} hangs on the next choice you make.`,
    after: `The worst passes. You regroup, count costs, and secure what can be saved.`,
    pay: `The ${client} pays what was promised. The guild marks "${name}" complete — for now.`,
  };
  return lines[blueprint.key] ?? `Stage ${stepIndex + 1} of ${name}.`;
}

function firstStepChoices(setting, tone) {
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
  return [
    {
      id: "scout",
      label: "Scout Ahead",
      subtitle: "Reduce ambush risk",
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

function buildMission(setting, hook, missionIndex, globalIndex, totalMissions) {
  const cfg = SETTING_CONFIG[setting];
  const [name] = hook;
  const id = `${setting}_${slug(name)}`;
  const rank = rankForIndex(globalIndex, totalMissions);
  const tone = cfg.tone;
  const combat = COMBAT_BY_RANK[rank];

  const steps = STEP_BLUEPRINT.map((bp, stepIndex) => {
    const isFirst = stepIndex === 0;
    const isCrisis = stepIndex === 7;
    const isPay = stepIndex === 9;
    let eventType = bp.eventType;
    if (isCrisis && tone !== "mild") {
      eventType = "combat";
    }

    const step = {
      title: isCrisis ? `Crisis — ${name}` : bp.title,
      text: stepText(bp, hook, hook[2], hook[3], stepIndex),
      eventType,
      timeCost: bp.timeCost,
      sceneImage: cfg.scene,
      kind: "fixed",
    };

    if (isFirst) {
      step.choices = firstStepChoices(setting, tone);
    }
    if (isCrisis && tone !== "mild") {
      step.combatEncounter = combat;
      step.eventType = "combat";
    }
    if (isPay) {
      step.sceneImage = setting === "town" || setting === "coast" ? SCENES.town : cfg.scene;
    }
    return step;
  });

  const types = { town: "deliver", forest: "explore", wilderness: "investigate", cave: "investigate", mountain: "combat", dungeon: "combat", coast: "deliver" };

  return {
    id,
    name,
    description: `${hook[1].charAt(0).toUpperCase() + hook[1].slice(1)}. ${hook[2].charAt(0).toUpperCase() + hook[2].slice(1)}.`,
    difficulty: rank,
    minAdventurerRank: RANK_MIN_RANK[rank],
    minHeirLevel: RANK_MIN_LEVEL[rank],
    weight: Math.max(5, 100 - globalIndex * 2),
    type: types[setting] ?? cfg.type,
    rewards: {
      gold: RANK_GOLD[rank],
      xp: RANK_XP[rank],
      rankXp: RANK_RANK_XP[rank],
      items: [],
    },
    campaign: {
      regionName: cfg.region,
      setting,
      tone,
      defaultSceneImage: cfg.scene,
      maxStages: 14,
      startingSupplies: 22 + RANK_MIN_LEVEL[rank],
      randomEventChance: 0.4,
      steps,
    },
  };
}

const missions = [];
let globalIndex = 0;
const settingKeys = Object.keys(SETTING_CONFIG);
const totalMissions = settingKeys.reduce((n, s) => n + SETTING_CONFIG[s].count, 0);

for (const setting of settingKeys) {
  const cfg = SETTING_CONFIG[setting];
  const hooks = cfg.hooks.slice(0, cfg.count);
  hooks.forEach((hook, i) => {
    missions.push(buildMission(setting, hook, i, globalIndex, totalMissions));
    globalIndex += 1;
  });
}

if (missions.length < 100) {
  throw new Error(`Expected 100+ missions, got ${missions.length}`);
}

for (const m of missions) {
  if (m.campaign.steps.length < 10) {
    throw new Error(`Mission ${m.id} has only ${m.campaign.steps.length} steps`);
  }
}

writeFileSync(OUT, JSON.stringify({ missions }, null, 2) + "\n");
console.log(`Wrote ${missions.length} missions (each ${missions[0].campaign.steps.length} fixed steps) → ${OUT}`);
