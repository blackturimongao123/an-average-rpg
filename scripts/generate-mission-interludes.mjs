/**
 * @deprecated Use scripts/import-mission-bible.mjs — canonical source is docs/an_average_rpg_event_mission_bible.md
 * Generates game-data/mission-interludes.json — shared random & secret events
 * filtered by setting, tone, level, and completed-mission requirements.
 * Run: node scripts/generate-mission-interludes.mjs
 */

console.error(
  "DEPRECATED: Use `node scripts/import-mission-bible.mjs` instead.\n" +
    "Canonical content: docs/an_average_rpg_event_mission_bible.md"
);
process.exit(1);

import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../game-data/mission-interludes.json");

const SCENES = {
  town: "/an-average-rpg/scenes/town-shady-mage.png",
  forest: "/an-average-rpg/scenes/forest.png",
  wilderness: "/an-average-rpg/scenes/forest-shrine.png",
  cave: "/an-average-rpg/scenes/goblin-cave-inside.png",
  mountain: "/an-average-rpg/scenes/mountain.png",
  dungeon: "/an-average-rpg/scenes/dungeon-inside.png",
  coast: "/an-average-rpg/scenes/forest.png",
};

const SETTINGS = ["town", "forest", "wilderness", "cave", "mountain", "dungeon", "coast"];

function slug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 40);
}

function mildChoice(id, label, subtitle, morale = 3) {
  return {
    id,
    label,
    subtitle,
    tags: [{ label: "Morale +" + morale, tone: "reward" }],
    moraleDelta: morale,
    stageCost: 1,
  };
}

function randomEvent({ id, settings, tones, title, text, eventType = "social", weight = 22, minHeirLevel, minAdventurerRank, requiresMissionCompleted, choices }) {
  return {
    id,
    settings,
    ...(tones ? { tones } : {}),
    weight,
    maxPerRun: 1,
    title,
    text,
    eventType,
    timeCost: "low",
    sceneImage: SCENES[settings[0]],
    ...(minHeirLevel ? { minHeirLevel } : {}),
    ...(minAdventurerRank ? { minAdventurerRank } : {}),
    ...(requiresMissionCompleted ? { requiresMissionCompleted } : {}),
    ...(choices ? { choices } : {}),
  };
}

const TOWN_RANDOM = [
  ["Baker's Gossip", "A baker wipes flour from his brow and shares rumors about your contract.", "social"],
  ["Street Musician", "A lute player tests a chord that makes dogs howl two alleys over.", "social"],
  ["Night Watch", "A tired watchman asks your business and warns you about curfew.", "hazard"],
  ["Fish Market", "Fishmongers haggle loudly; a slip on wet stones could ruin your boots.", "hazard"],
  ["Pickpocket", "A child bumps into you — fingers nimble, conscience flexible.", "hazard"],
  ["Herbalist Stall", "An apothecary offers a cheap tonic that smells like regret.", "discovery"],
  ["Drunk Bard", "A bard slurs a ballad that accidentally names your target.", "social"],
  ["Noble Carriage", "A carriage forces everyone aside; escorts glare at armed adventurers.", "hazard"],
  ["Chimney Smoke", "Thick smoke pours from a rooftop — fire or bad cooking?", "hazard"],
  ["Guild Runner", "A guild runner delivers a revised note about your contract.", "social"],
  ["Stray Dog", "A butcher's hound barks at shadows; no blood, just noise.", "hazard"],
  ["Lantern Seller", "A lantern seller insists you need 'true light' for alley work.", "discovery"],
  ["Cistern Echo", "Your voice echoes wrong beneath a grate — something moves below.", "discovery"],
  ["Milk Cart", "A milk cart blocks the lane; the driver offers directions for coin.", "social"],
  ["Prayer Bell", "Temple bells ring; crowds kneel and block your fastest route.", "social"],
  ["Rat in Gutter", "A rat the size of a shoe watches you pass without fear.", "hazard"],
  ["Painted Sign", "A freshly painted sign mislabels the street — locals laugh.", "social"],
  ["Cooper's Hammer", "Hammer rhythm from a cooper's shop masks footsteps behind you.", "hazard"],
  ["Flower Girl", "A flower girl tries to sell you a bouquet 'for luck'.", "social"],
  ["Shady Mage", "A hooded figure mutters about 'contracts that bite back'.", "discovery"],
];

const FOREST_RANDOM = [
  ["Wolf Howl", "A distant howl answers your footsteps — too close for comfort.", "hazard"],
  ["Mushroom Ring", "Pale fungi grow in a perfect ring beneath an oak.", "discovery"],
  ["Lost Trail", "Your map disagrees with the path; both could be wrong.", "hazard"],
  ["Bird Alarm", "Jays scream overhead — something disturbed the canopy.", "hazard"],
  ["Herbal Cache", "A marked tree hides a satchel of dried herbs.", "discovery"],
  ["Fallen Bridge", "A rotted log bridge spans a rushing creek.", "hazard"],
  ["Hunter's Snare", "A wire snare waits at knee height — not yours, but still dangerous.", "hazard"],
  ["Deer Crossing", "A herd blocks the trail; patience or panic, your choice.", "social"],
  ["Old Milestone", "A mossy milestone lists distances to places that no longer exist.", "discovery"],
  ["Bee Swarm", "Disturbed bees boil from a hollow trunk.", "hazard"],
  ["Woodcutter", "A woodcutter shares tobacco and warnings about 'things at dusk'.", "social"],
  ["Fog Bank", "Sudden fog swallows landmarks you just memorized.", "hazard"],
  ["Fox Fire", "Will-o-wisps dance between pines — pretty, probably lies.", "discovery"],
  ["Thorn Thicket", "Black thorns tear cloaks and patience alike.", "hazard"],
  ["Abandoned Camp", "Cold ashes and a broken compass mark a failed expedition.", "discovery"],
  ["Owl Parliament", "Owls watch from every branch as if judging your worth.", "social"],
  ["Stream Ford", "The ford is deeper than it looked from the bank.", "hazard"],
  ["Carved Face", "Someone carved a screaming face into living bark.", "discovery"],
  ["Nettle Patch", "Nettles punish anyone who shortcuts through the brush.", "hazard"],
  ["Squirrel Hoard", "A squirrel drops an acorn coin purse — accident or bribe?", "discovery"],
];

const WILDERNESS_RANDOM = [
  ["Standing Stones", "Ancient stones hum when wind passes the gaps.", "discovery"],
  ["Dust Devil", "A dust devil crosses your path like a bored spirit.", "hazard"],
  ["Nomad Smoke", "Nomad campfire smoke means trade — or trouble.", "social"],
  ["Bone Cairn", "A cairn of bones marks a battlefield no one remembers.", "discovery"],
  ["Heat Shimmer", "Heat shimmers distort the horizon into impossible shapes.", "hazard"],
  ["Vulture Circle", "Vultures circle — something died, or something will.", "hazard"],
  ["Salt Flat Crack", "Cracked salt flats hide pockets that swallow ankles.", "hazard"],
  ["Lone Shrine", "A roadside shrine still holds offerings despite isolation.", "social"],
  ["Mirage Pool", "Water glitters ahead; your canteen suggests skepticism.", "discovery"],
  ["Grass Fire", "A grass fire races parallel to your route.", "hazard"],
  ["Buried Road", "Half-buried paving stones hint at a forgotten highway.", "discovery"],
  ["Hail Burst", "Hail strikes without warning from a clear sky.", "hazard"],
  ["Scavenger Pack", "Jackals shadow you at a respectful, hungry distance.", "hazard"],
  ["Wind Harp", "Wind through rock slots plays a mournful chord.", "social"],
  ["Cracked Idol", "A cracked idol weeps rusty water into the dust.", "discovery"],
  ["Trader Bones", "Sun-bleached bones surround a stripped merchant cart.", "hazard"],
  ["Star Fall", "A meteor streak leaves hot glass in a smoking pit.", "discovery"],
  ["Dust Mask", "A dust storm forces scarves over mouths and maps away.", "hazard"],
  ["Wandering Priest", "A priest walks without destination, quoting dead kings.", "social"],
  ["Cactus Bloom", "Rare cactus bloom — beautiful, poisonous, valuable.", "discovery"],
];

const CAVE_RANDOM = [
  ["Dripping Ceiling", "Stalactite drips mark time you cannot afford to waste.", "hazard"],
  ["Bat Exodus", "Bats erupt from a side tunnel in a shrieking cloud.", "hazard"],
  ["Fungal Glow", "Bioluminescent fungus paints the walls in sickly blue.", "discovery"],
  ["Tight Squeeze", "A squeeze passage shreds pack straps and nerves.", "hazard"],
  ["Echo Trap", "Your shout returns wrong — something mimics your voice.", "hazard"],
  ["Miner's Mark", "Chalk arrows disagree about which way is 'out'.", "discovery"],
  ["Underground Stream", "An underground stream blocks the path — cold, fast, unknown depth.", "hazard"],
  ["Crystal Vein", "A crystal vein winks like trapped stars.", "discovery"],
  ["Gas Pocket", "A sulfurous pocket makes torches sputter.", "hazard"],
  ["Bone Nest", "Rodents have made a nest of finger bones.", "hazard"],
  ["Smuggler Cache", "A rotting crate still holds contraband and mold.", "discovery"],
  ["Rope Bridge", "A rope bridge groans over a pit with no visible bottom.", "hazard"],
  ["Goblin Graffiti", "Goblin graffiti insults your ancestry creatively.", "social"],
  ["Flooded Tunnel", "Knee-deep water hides holes that drop to the knees of giants.", "hazard"],
  ["Fossil Wall", "Fossils of impossible creatures line a chamber wall.", "discovery"],
  ["Cave Cricket", "Cave crickets shriek when your light passes.", "hazard"],
  ["Hidden Vent", "A warm vent suggests surface — or something breathing below.", "discovery"],
  ["Mud Slide", "Mud slides from above — recent, still moving.", "hazard"],
  ["Ore Glint", "Ore glints tempt greed into a dead-end shaft.", "discovery"],
  ["Whisper Gallery", "A whisper gallery carries secrets from tunnels you have not entered.", "social"],
];

const MOUNTAIN_RANDOM = [
  ["Thin Air", "Thin air turns simple climbs into moral tests.", "hazard"],
  ["Goat Path", "Mountain goats judge your footing from impossible ledges.", "hazard"],
  ["Avalanche Rumor", "A low rumble — snow, stone, or thunder?", "hazard"],
  ["Eagle Nest", "An eagle nest guards the only viable ledge.", "discovery"],
  ["Ice Bridge", "An ice bridge spans a chasm that swallows sound.", "hazard"],
  ["Hermit's Smoke", "Hermit smoke curls from a cave — hospitality or trap?", "social"],
  ["Altitude Sickness", "Headaches and stars behind the eyes slow every decision.", "hazard"],
  ["Frost Flowers", "Frost flowers bloom on iron-hard snow.", "discovery"],
  ["Loose Scree", "Scree slides under boots like a traitor.", "hazard"],
  ["Cliff Echo", "Cliff echoes return your name with an extra syllable.", "discovery"],
  ["Prayer Flags", "Weathered prayer flags snap in wind that never stops.", "social"],
  ["Crevasse", "A hidden crevasse swallows a thrown stone without end.", "hazard"],
  ["Iron Deposit", "Iron-stained rock explains why nothing grows here.", "discovery"],
  ["Sudden Storm", "Weather turns violent in the time it takes to blink.", "hazard"],
  ["Frozen Corpse", "A frozen corpse still points the way you were going.", "discovery"],
  ["Wing Shadow", "A vast wing shadow crosses snow — wyvern, eagle, or worse.", "hazard"],
  ["Hot Spring", "A hot spring steams in a hollow — rest, or ambush site?", "discovery"],
  ["Rockfall", "Fresh rockfall blocks the obvious route.", "hazard"],
  ["Summit Cairn", "A summit cairn holds notes from climbers who did not return.", "social"],
  ["Star Vista", "Stars at dusk feel close enough to touch — and cold enough to burn.", "discovery"],
];

const DUNGEON_RANDOM = [
  ["Torch Sputter", "Torches sputter as if the dark is hungry.", "hazard"],
  ["Chain Rattle", "Chains rattle three rooms away — rhythm not wind.", "hazard"],
  ["Mosaic Floor", "A mosaic floor depicts your profession dying horribly.", "discovery"],
  ["Arrow Slot", "An arrow slot yawns black and patient.", "hazard"],
  ["Crumbling Arch", "A crumbling arch groans under new weight.", "hazard"],
  ["Dust of Ages", "Centuries of dust choke every breath.", "hazard"],
  ["Iron Gate", "An iron gate bears a seal you recognize from bad dreams.", "discovery"],
  ["Pit Trap", "A pit trap's edge crumbles under a careless step.", "hazard"],
  ["Wall Inscription", "Wall inscriptions warn in a language pain still understands.", "discovery"],
  ["Cold Draft", "A cold draft smells of tombs and wet stone.", "hazard"],
  ["Bone Chandelier", "Bones hang as a chandelier — art or warning.", "discovery"],
  ["Slime Pool", "A slime pool dissolves a dropped coin instantly.", "hazard"],
  ["Secret Door", "A secret door sighs open on rusted hinges.", "discovery"],
  ["Guard Echo", "Distant marching echoes — many boots, one purpose.", "hazard"],
  ["Candle Row", "Rows of candles light themselves as you pass.", "discovery"],
  ["Collapse Risk", "Ceiling dust falls in a steady, worrying rhythm.", "hazard"],
  ["Statue Watch", "Statues seem to face you no matter where you stand.", "hazard"],
  ["Holy Seal", "A holy seal on the floor still burns faithful fingers.", "discovery"],
  ["Rat King", "Rats move in unnerving coordination.", "hazard"],
  ["Vault Air", "Vault air tastes of old gold and older sins.", "discovery"],
];

const COAST_RANDOM = [
  ["Tide Pool", "Tide pools mirror clouds — and something beneath them.", "discovery"],
  ["Gull Mob", "Gulls mob anyone holding food.", "hazard"],
  ["Rope Ferry", "A rope ferry sways over churning water.", "hazard"],
  ["Driftwood", "Driftwood marks high tide higher than locals admit.", "discovery"],
  ["Salt Wind", "Salt wind cracks lips and tempers.", "hazard"],
  ["Fisher's Tale", "A fisher swears they saw lights under the waves.", "social"],
  ["Cliff Path", "A cliff path crumbles toward hungry surf.", "hazard"],
  ["Message Bottle", "A bottle holds a note in a dead language.", "discovery"],
  ["Fog Horn", "A fog horn moans — ship safe, or ship lost?", "hazard"],
  ["Kelp Tangle", "Kelp tangles ankles in the shallows.", "hazard"],
  ["Harbor Tax", "Harbor officials demand papers you were not told to carry.", "social"],
  ["Shell Gleam", "Rare shells gleam where waves retreat.", "discovery"],
  ["Crab Army", "Crabs advance in a clicking wall.", "hazard"],
  ["Drowned Bell", "A drowned bell tolls when storms approach.", "discovery"],
  ["Tar Smell", "Tar and rot warn of a wreck just below the waterline.", "hazard"],
  ["Sailor's Bet", "Sailors bet on whether you return before sundown.", "social"],
  ["Quicksand", "Wet sand drinks boots before you notice sinking.", "hazard"],
  ["Sea Cave", "A sea cave exhales air cold as a grave.", "discovery"],
  ["Storm Line", "A storm line blackens the horizon while work remains.", "hazard"],
  ["Lighthouse", "A lighthouse beam sweeps past — guide or accusation.", "social"],
];

const SETTING_RANDOM = {
  town: TOWN_RANDOM,
  forest: FOREST_RANDOM,
  wilderness: WILDERNESS_RANDOM,
  cave: CAVE_RANDOM,
  mountain: MOUNTAIN_RANDOM,
  dungeon: DUNGEON_RANDOM,
  coast: COAST_RANDOM,
};

const randomEvents = [];

for (const setting of SETTINGS) {
  const templates = SETTING_RANDOM[setting];
  const tones = setting === "town" ? ["mild", "moderate"] : setting === "dungeon" ? ["moderate", "dangerous"] : ["mild", "moderate", "dangerous"];

  templates.forEach(([title, text, eventType], index) => {
    const id = `${setting}_${slug(title)}`;
    const tonePick = tones[index % tones.length];
    randomEvents.push(
      randomEvent({
        id,
        settings: [setting],
        tones: [tonePick],
        title,
        text,
        eventType,
        weight: 18 + (index % 7),
        choices:
          eventType === "social"
            ? [
                mildChoice("engage", "Lean In", "See what you can learn", 4),
                mildChoice("pass", "Move On", "Stay focused on the contract", 1),
              ]
            : undefined,
      })
    );
  });
}

// Higher-level random events (level gated)
randomEvents.push(
  randomEvent({
    id: "dungeon_veteran_tip",
    settings: ["dungeon", "cave"],
    tones: ["dangerous"],
    title: "Veteran's Warning",
    text: "A scarred veteran recognizes your insignia and mutters advice about what lies ahead.",
    eventType: "social",
    minHeirLevel: 8,
    minAdventurerRank: "C",
    weight: 12,
    choices: [mildChoice("listen", "Listen", "File away every word", 6)],
  }),
  randomEvent({
    id: "town_scholar_note",
    settings: ["town"],
    tones: ["mild", "moderate"],
    title: "Scholar's Note",
    text: "A scholar presses a folded note into your hand — 'For the one on the guild contract.'",
    eventType: "discovery",
    minHeirLevel: 5,
    weight: 14,
  })
);

const secretEvents = [];

function secret({ id, settings, tones, title, text, conditions, minHeirLevel, minAdventurerRank, requiresMissionCompleted, eventType = "discovery" }) {
  return {
    id,
    settings,
    ...(tones ? { tones } : {}),
    maxPerRun: 1,
    title,
    text,
    eventType,
    timeCost: "low",
    sceneImage: SCENES[settings[0]],
    conditions,
    ...(minHeirLevel ? { minHeirLevel } : {}),
    ...(minAdventurerRank ? { minAdventurerRank } : {}),
    ...(requiresMissionCompleted ? { requiresMissionCompleted } : {}),
    choices: [mildChoice("continue", "Press On", "Use this advantage", 5)],
  };
}

for (const setting of SETTINGS) {
  const bakerId = `${setting}_${slug(SETTING_RANDOM[setting][0][0])}`;
  secretEvents.push(
    secret({
      id: `secret_${setting}_shortcut`,
      settings: [setting],
      title: "Hidden Shortcut",
      text: `A local shows you a path others pay gold to learn — the contract just got shorter.`,
      conditions: [
        { type: "randomEventSeen", eventId: bakerId },
        { type: "fixedStepCompleted", stepIndex: 0 },
      ],
    })
  );
}

secretEvents.push(
  secret({
    id: "secret_town_baker_cat",
    settings: ["town"],
    tones: ["mild"],
    title: "Baker Knows the Cat",
    text: "The baker walks you through his delivery door — orange prints are fresh on the flour sacks.",
    conditions: [
      { type: "randomEventSeen", eventId: "town_baker_s_gossip" },
      { type: "missionCompleted", missionId: "town_lost_cat" },
    ],
    requiresMissionCompleted: ["town_lost_cat"],
  }),
  secret({
    id: "secret_forest_old_guide",
    settings: ["forest", "wilderness"],
    title: "Old Guide's Path",
    text: "An old guide appears when you whistle wrong — and leads you around the worst of the woods.",
    conditions: [{ type: "minHeirLevel", value: 4 }],
    minHeirLevel: 4,
  }),
  secret({
    id: "secret_dungeon_sealed_door",
    settings: ["dungeon", "cave"],
    tones: ["moderate", "dangerous"],
    title: "Sealed Door",
    text: "A door everyone else missed stands ajar just long enough for you to slip through.",
    conditions: [
      { type: "minHeirLevel", value: 10 },
      { type: "minAdventurerRank", rank: "B" },
    ],
    minHeirLevel: 10,
    minAdventurerRank: "B",
  }),
  secret({
    id: "secret_mountain_eagle_ally",
    settings: ["mountain"],
    title: "Eagle's Favor",
    text: "An eagle circles thrice and departs — climbers say that means the ridge route is clear today.",
    conditions: [{ type: "heirStatAtLeast", stat: "dexterity", value: 12 }],
  }),
  secret({
    id: "secret_coast_tide_window",
    settings: ["coast"],
    title: "Tide Window",
    text: "A fisher points at the moon and says you have one hour before the path drowns.",
    conditions: [{ type: "moraleAtLeast", value: 60 }],
  }),
  secret({
    id: "secret_veteran_bloodline",
    settings: ["dungeon", "mountain", "wilderness"],
    tones: ["dangerous"],
    title: "Bloodline Recognition",
    text: "A dying mercenary recognizes your family name and whispers where the real prize waits.",
    conditions: [
      { type: "generationAtLeast", value: 3 },
      { type: "minHeirLevel", value: 12 },
    ],
    minHeirLevel: 12,
  })
);

// Level-tier secrets per setting
for (const setting of SETTINGS) {
  for (const [level, rank] of [
    [3, "F"],
    [6, "D"],
    [10, "B"],
    [14, "S"],
  ]) {
    secretEvents.push(
      secret({
        id: `secret_${setting}_rank_${level}`,
        settings: [setting],
        title: "Veteran's Detour",
        text: `A retired adventurer recognizes your rank and opens a door locals pretend does not exist.`,
        conditions: [
          { type: "minHeirLevel", value: level },
          { type: "fixedStepCompleted", stepIndex: 2 },
        ],
        minHeirLevel: level,
        minAdventurerRank: rank,
      })
    );
  }
}

// Mission-completion chain secrets (town cat → forest courier, etc.)
const CHAIN_SECRETS = [
  ["town", "town_lost_cat", "forest", "Forest Courier's Thanks", "A forest courier heard you helped in town — they mark a safe camp on your map."],
  ["forest", "forest_lost_courier", "cave", "Cave Miner's Favor", "Miners owe the courier you saved; they let you use a private shaft."],
  ["cave", "cave_miner_s_plea", "dungeon", "Crypt Key", "A miner passes you a key 'for when the dead get restless'."],
  ["dungeon", "dungeon_crypt_cleanup", "mountain", "Summit Pass", "Gravekeepers vouch for you with mountain guides."],
  ["mountain", "mountain_wyvern_scare", "coast", "Harbor Clearance", "Mountain militia letters ease harbor inspections."],
];

for (const [fromSetting, reqMission, toSetting, title, text] of CHAIN_SECRETS) {
  secretEvents.push(
    secret({
      id: `secret_chain_${slug(reqMission)}`,
      settings: [toSetting],
      title,
      text,
      conditions: [{ type: "missionCompleted", missionId: reqMission }],
      requiresMissionCompleted: [reqMission],
    })
  );
}

const output = { randomEvents, secretEvents };
writeFileSync(OUT, JSON.stringify(output, null, 2) + "\n");
console.log(`Wrote ${randomEvents.length} random + ${secretEvents.length} secret interludes → ${OUT}`);
