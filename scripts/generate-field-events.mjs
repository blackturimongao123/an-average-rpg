/**
 * Generates game-data/events.json — 100+ field encounters sharing scene backgrounds.
 * Run: node scripts/generate-field-events.mjs
 */

import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../game-data/events.json");

const SCENES = {
  forest: "/an-average-rpg/scenes/forest.png",
  forestShrine: "/an-average-rpg/scenes/forest-shrine.png",
  forestGoblinCave: "/an-average-rpg/scenes/forest-goblin-cave.png",
  mountain: "/an-average-rpg/scenes/mountain.png",
  town: "/an-average-rpg/scenes/town-shady-mage.png",
  goblinEntrance: "/an-average-rpg/scenes/goblin-cave-entrance.png",
  goblinInside: "/an-average-rpg/scenes/goblin-cave-inside.png",
  dungeonInside: "/an-average-rpg/scenes/dungeon-inside.png",
  goblinKing: "/an-average-rpg/scenes/goblin-king-room.png",
};

function slug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 48);
}

function outcome(desc, gold = 0, xp = 10, extra = {}) {
  return {
    weight: 100,
    description: desc,
    goldDelta: gold,
    xpDelta: xp,
    itemRewards: [],
    effectsAdded: [],
    effectsRemoved: [],
    heirDies: false,
    ...extra,
  };
}

function weightedOutcomes(entries) {
  return entries.map(([weight, desc, gold, xp, extra]) =>
    outcome(desc, gold, xp, { weight, ...extra })
  );
}

function statChoice(id, text, stat, difficulty, pass, fail) {
  return {
    id,
    text,
    statCheck: { stat, difficulty },
    outcomes: [outcome(pass[0], pass[1] ?? 0, pass[2] ?? 15), outcome(fail[0], fail[1] ?? 0, fail[2] ?? 8)],
  };
}

function randomChoice(id, text, outcomes) {
  return { id, text, outcomes: weightedOutcomes(outcomes) };
}

function safeChoice(id, text, desc, gold = 0, xp = 8) {
  return { id, text, outcomes: [outcome(desc, gold, xp)] };
}

function buildEvent({
  location,
  sceneImage,
  eventType,
  name,
  description,
  minLevel = 1,
  weight = 18,
  extraReq = {},
  choices,
  idPrefix,
}) {
  const id = `${idPrefix ?? location}_${slug(name)}`;
  return {
    id,
    name,
    description,
    requirements: { minLevel, ...extraReq },
    weight,
    sceneImage,
    eventType,
    location,
    choices,
  };
}

function forestEvents() {
  const templates = [
    ["Wolf Tracks", "Fresh paw prints cross the leaf-strewn path. Something large hunted here recently.", "discovery", 1, [
      statChoice("track", "Follow the tracks", "dexterity", 8, ["You find an abandoned den with scavenged coin.", 12, 18], ["The trail goes cold in thick brush.", 0, 10]),
      safeChoice("avoid", "Give the area a wide berth", "You skirt the hunting ground and continue safely."),
    ]],
    ["Mushroom Circle", "Pale fungi grow in a perfect ring beneath an ancient oak.", "discovery", 1, [
      randomChoice("harvest", "Harvest the mushrooms", [[50, "Edible caps fetch a few coins at the next village.", 8, 12], [50, "You pick a toxic lookalike and feel ill for hours.", 0, 6, { effectsAdded: ["bruised"] }]]),
      safeChoice("leave", "Leave the circle untouched", "Old superstition keeps your hands clean.", 0, 5),
    ]],
    ["Lost Child", "A sobbing child stumbles from the undergrowth, mud-stained and terrified.", "social", 2, [
      statChoice("comfort", "Calm the child and search for kin", "charisma", 9, ["Villagers reward you for returning the lost heir.", 25, 22], ["The child panics and flees deeper into the woods.", 0, 10]),
      safeChoice("escort", "Escort them toward the nearest road", "A grateful parent pays you at the forest edge.", 15, 18),
    ]],
    ["Bandit Scout", "A scout watches the road from a pine thicket, hand on a dagger.", "hazard", 3, [
      statChoice("ambush", "Ambush the scout first", "strength", 10, ["You disarm the lookout and claim their purse.", 20, 25], ["The scout escapes and raises an alarm.", 0, 12]),
      statChoice("bribe", "Offer coin for safe passage", "charisma", 8, ["The scout takes your gold and vanishes.", -10, 15], ["They laugh and try to rob you instead.", -20, 10]),
    ]],
    ["Herbalist's Cache", "A hidden satchel of dried herbs hangs from a branch marker.", "discovery", 2, [
      randomChoice("take", "Claim the cache", [[70, "Rare herbs sell well to apothecaries.", 18, 20, { itemRewards: ["health_potion"] }], [30, "The owner returns and accuses you of theft.", -5, 8]]),
      safeChoice("mark", "Mark the tree and move on", "Someone else's livelihood, not yours.", 0, 6),
    ]],
    ["Fallen Oak Bridge", "A rotted log bridge spans a rushing creek.", "hazard", 2, [
      statChoice("cross", "Cross carefully", "dexterity", 9, ["You reach the far bank with dry boots.", 0, 14], ["You slip and soak your gear.", 0, 8, { effectsAdded: ["bruised"] }]),
      safeChoice("ford", "Wade downstream at a shallow bend", "Cold water, but no broken bones.", 0, 10),
    ]],
    ["Dryad's Warning", "Bark-like eyes open in a trunk. 'Turn back, mortal.'", "social", 4, [
      statChoice("listen", "Listen to the spirit's counsel", "faith", 10, ["The dryad grants a faint blessing.", 0, 25, { effectsAdded: ["fortune_blessing"] }], ["The spirit falls silent, offended.", 0, 10]),
      safeChoice("ignore", "Ignore the warning and press on", "The forest feels colder behind you.", 0, 8),
    ]],
    ["Poacher's Trap", "A steel snare waits beneath leaves near a game trail.", "hazard", 3, [
      statChoice("disarm", "Disarm the trap", "dexterity", 11, ["You salvage the mechanism for parts.", 10, 18], ["The trap snaps shut on your boot.", 0, 12, { effectsAdded: ["wounded"] }]),
      safeChoice("detour", "Detour around the trail", "Safer steps, slower progress.", 0, 9),
    ]],
    ["Abandoned Campsite", "Cold ashes and torn canvas mark a hurried departure.", "discovery", 2, [
      randomChoice("search", "Search the campsite", [[40, "A coin pouch was left in the panic.", 15, 16], [40, "You find nothing of value.", 0, 8], [20, "A wounded traveler was hiding — they thank you with gold.", 20, 20]]),
      safeChoice("camp", "Rest here briefly", "You recover strength among the trees.", 0, 12),
    ]],
    ["Stag in the Clearing", "A magnificent stag watches you, antlers crowned with mist.", "discovery", 1, [
      statChoice("hunt", "Attempt a clean kill", "dexterity", 12, ["Venison and hide bring coin.", 22, 20], ["The stag bounds away untouched.", 0, 8]),
      safeChoice("watch", "Watch in silence", "A moment of peace steadies your nerves.", 0, 14),
    ]],
    ["Whispering Hollow", "Voices echo without source between the trunks.", "hazard", 5, [
      randomChoice("investigate", "Investigate the voices", [[30, "An old shrine hides a small offering.", 30, 28], [40, "Nothing but wind — but your nerves fray.", 0, 12], [30, "A wraith lashes out before fading.", 0, 18, { effectsAdded: ["wounded"] }]]),
      safeChoice("flee", "Leave the hollow at once", "Some places should not be named.", 0, 10),
    ]],
    ["Beekeeper's Wagon", "An overturned wagon leaks honey into the moss.", "social", 2, [
      statChoice("help", "Right the wagon and help the keeper", "strength", 8, ["They pay you in honey and coin.", 18, 20], ["The bees swarm and drive you off.", 0, 8, { effectsAdded: ["bruised"] }]),
      safeChoice("sample", "Take a jar and move on", "Sweet theft, small guilt.", 5, 10),
    ]],
    ["Ranger's Signal", "Three stones stacked by the path — a ranger's sign.", "discovery", 3, [
      statChoice("read", "Interpret the trail sign", "intelligence", 9, ["A hidden supply cache rewards the wise.", 12, 22, { itemRewards: ["trail_compass"] }], ["You misread the sign and wander in circles.", 0, 8]),
      safeChoice("pass", "Pass without touching the marker", "Not your message to answer.", 0, 6),
    ]],
    ["Foxfire Lights", "Pale flames dance above a bog without heat.", "hazard", 4, [
      randomChoice("follow", "Follow the lights", [[35, "They lead to a buried coffer.", 25, 24], [65, "The bog claims your boots and patience.", 0, 10, { effectsAdded: ["bruised"] }]]),
      safeChoice("avoid", "Avoid the bog entirely", "Will-o-wisps hunger for fools.", 0, 12),
    ]],
    ["Hunter's Snare", "A rabbit struggles in a wire noose.", "social", 1, [
      safeChoice("free", "Free the rabbit", "Small mercy earns quiet luck.", 0, 12),
      statChoice("claim", "Claim the catch for yourself", "luck", 7, ["Supper and a pelt.", 8, 14], ["The trap was rigged — it bites your hand.", 0, 6, { effectsAdded: ["bruised"] }]),
    ]],
    ["Ancient Waystone", "Runes weathered on stone point three directions.", "discovery", 3, [
      statChoice("study", "Study the runes", "intelligence", 10, ["You glean a shortcut worth gold saved.", 15, 25], ["The script remains stubbornly dead.", 0, 10]),
      safeChoice("pray", "Leave a coin offering", "The road feels lighter underfoot.", -2, 14),
    ]],
    ["Crow Murder", "Crows circle something in the ferns.", "hazard", 2, [
      randomChoice("check", "Investigate the carrion", [[50, "A fallen courier still carries a purse.", 20, 18], [50, "Only bones remain.", 0, 10]]),
      safeChoice("away", "Keep walking", "Let the crows finish their work.", 0, 5),
    ]],
    ["Fairy Rings of Dew", "Dew hangs in perfect beads on spider silk at dawn.", "discovery", 1, [
      safeChoice("collect", "Bottle the dew", "Alchemists pay for forest dawn.", 10, 15),
      safeChoice("admire", "Admire and continue", "Beauty costs nothing.", 0, 8),
    ]],
    ["Logging Dispute", "Two woodcutters argue over marked trees.", "social", 3, [
      statChoice("mediate", "Mediate the dispute", "charisma", 10, ["Both sides pay you for fairness.", 20, 22], ["They turn on you instead.", 0, 10, { effectsAdded: ["bruised"] }]),
      safeChoice("avoid", "Avoid the argument", "Not your forest, not your feud.", 0, 6),
    ]],
    ["Hidden Spring", "Clear water bubbles from roots into a stone basin.", "rest", 2, [
      safeChoice("drink", "Drink and rest", "The spring restores your vigor.", 0, 18),
      randomChoice("bottle", "Fill every flask", [[60, "You sell blessed spring water later.", 12, 16], [40, "A territorial nymph scolds you.", 0, 8]]),
    ]],
    ["Thorn Hedge Maze", "A natural hedge blocks the shortcut.", "hazard", 4, [
      statChoice("cut", "Hack through with blade", "strength", 11, ["You emerge scratched but ahead.", 0, 20], ["Thorns win the argument.", 0, 10, { effectsAdded: ["wounded"] }]),
      statChoice("navigate", "Navigate the maze patiently", "intelligence", 9, ["You find berries and a coin on the far side.", 8, 18], ["Lost until dusk.", 0, 8]),
    ]],
    ["Elk Migration", "A herd crosses the trail — hundreds of hooves shake the earth.", "discovery", 2, [
      safeChoice("wait", "Wait for the herd to pass", "Patience keeps you untrampled.", 0, 12),
      statChoice("ride", "Try to ride a stray calf", "dexterity", 14, ["A wild ride and a story worth drinks.", 0, 25], ["Hooves find your ribs.", 0, 12, { effectsAdded: ["wounded"] }]),
    ]],
    ["Smuggler's Drop", "A marked tree hides a wax-sealed packet.", "hazard", 5, [
      randomChoice("open", "Open the packet", [[40, "Forged letters you can sell.", 35, 24], [60, "Royal guards were watching.", -15, 15, { effectsAdded: ["guild_watched"] }]]),
      safeChoice("leave", "Leave contraband alone", "Ignorance is armor.", 0, 10),
    ]],
    ["Owl's Lament", "A giant owl watches from a branch, unblinking.", "discovery", 3, [
      statChoice("offer", "Offer meat from your pack", "charisma", 8, ["The owl drops a silver ring.", 0, 22, { itemRewards: ["lucky_coin"] }], ["It flies away indifferent.", 0, 8]),
      safeChoice("bow", "Bow and move on", "Respect for apex hunters.", 0, 10),
    ]],
    ["Forest Fire Scar", "Blackened trunks mark last season's blaze.", "hazard", 4, [
      randomChoice("forage", "Forage charcoal and resin", [[55, "Useful goods for smiths.", 14, 18], [45, "Embers still burn — smoke chokes you.", 0, 10, { effectsAdded: ["bruised"] }]]),
      safeChoice("cross", "Cross quickly", "Ash coats your cloak but nothing worse.", 0, 9),
    ]],
  ];

  return templates.map(([name, description, eventType, minLevel, choices]) =>
    buildEvent({
      location: "forest",
      sceneImage: SCENES.forest,
      eventType,
      name,
      description,
      minLevel,
      weight: 16,
      choices,
    })
  );
}

function shrineEvents() {
  const names = [
    ["Offering Bowl Empty", "A stone shrine stands mossy and forgotten. The offering bowl is empty.", "social"],
    ["Pilgrim's Prayer", "A weary pilgrim kneels, lips moving in silent devotion.", "rest"],
    ["Desecrated Altar", "Someone defiled the shrine with crude graffiti.", "hazard"],
    ["Moonlit Vigil", "Candles flicker though no worshipper remains.", "discovery"],
    ["Sacred Spring", "Holy water pools beneath the shrine steps.", "rest"],
    ["Guardian Statue", "A weathered saint's statue weeps resin tears.", "discovery"],
    ["Heretic's Debate", "A preacher argues with a skeptical knight.", "social"],
    ["Bell Without Rope", "A bronze bell hangs but its rope was cut.", "hazard"],
    ["Relic Pedestal", "An empty pedestal waits for a returned relic.", "discovery"],
    ["Forest Blessing", "Priests once blessed travelers here. Residue lingers.", "rest"],
  ];

  return names.map(([name, description, eventType], i) =>
    buildEvent({
      location: "forest_shrine",
      sceneImage: SCENES.forestShrine,
      eventType,
      name,
      description,
      minLevel: 2 + (i % 4),
      weight: 12,
      choices: [
        statChoice("pray", "Pray at the shrine", "faith", 8 + (i % 3), ["Warmth fills your chest.", 0, 20, { effectsAdded: ["fortune_blessing"] }], ["Silence answers.", 0, 8]),
        safeChoice("leave", "Pay respects and leave", "You feel oddly steadier.", 0, 12),
      ],
    })
  );
}

function forestGoblinCaveEvents() {
  const templates = [
    ["Cave Mouth Whispers", "Goblin chatter echoes from a crack in the hillside.", "hazard", 2],
    ["Tripwire Warning", "Crude goblin sigils mark a trapped approach.", "hazard", 3],
    ["Captured Supplies", "Abandoned packs litter the forest verge near the cave.", "discovery", 2],
    ["Scout Laughter", "High giggles carry on the wind from hidden watchers.", "combat", 4],
    ["Wolf-Goblin Feud", "Goblins and wolves snarl at each other across the path.", "hazard", 5],
    ["Smoke Trail", "Greenish smoke rises — goblin cookfires inside.", "discovery", 3],
    ["Rope Bridge", "Goblins lashed a rope bridge over a ravine entrance.", "hazard", 4],
    ["Bounty Poster", "A village posted gold for goblin ears.", "social", 3],
    ["Trapped Merchant", "A merchant begs for help — goblins took his cart.", "social", 4],
    ["Night Patrol", "Torchlight bobs near the cave mouth after dusk.", "combat", 5],
  ];

  return templates.map(([name, description, eventType, minLevel]) =>
    buildEvent({
      location: "forest_goblin_cave",
      sceneImage: SCENES.forestGoblinCave,
      eventType,
      name,
      description,
      minLevel,
      weight: 14,
      choices: [
        statChoice("scout", "Scout the entrance", "dexterity", 9, ["You map a safe approach for later.", 10, 18], ["A sling stone grazes you.", 0, 10, { effectsAdded: ["bruised"] }]),
        safeChoice("withdraw", "Withdraw and report to the village", "Coin for intelligence.", 12, 14),
      ],
    })
  );
}

function mountainEvents() {
  const templates = [
    ["Avalanche Scar", "Fresh rockfall blocks the high pass.", "hazard", 4],
    ["Eagle's Nest", "A golden eagle guards cliff-side eggs.", "discovery", 3],
    ["Frozen Corpse", "A climber's body preserves a map in frozen hands.", "discovery", 5],
    ["Hermit's Cave", "Smoke curls from a cave above the treeline.", "social", 3],
    ["Ice Bridge", "A frozen waterfall creates a perilous crossing.", "hazard", 5],
    ["Ore Vein", "Quartz and iron glitter in an exposed cliff face.", "discovery", 4],
    ["Mountain Bandits", "Bandits demand toll on a narrow ledge.", "combat", 6],
    ["Sacred Peak", "Prayer flags snap in thin air near a summit cairn.", "rest", 4],
    ["Goat Herder", "A herder offers cheese and rumors of dragons.", "social", 2],
    ["Sudden Blizzard", "Weather turns without warning.", "hazard", 5],
    ["Abandoned Mine", "Timbers groan in a collapsed mine mouth.", "hazard", 6],
    ["Griffon Shadow", "A vast shadow circles once and vanishes.", "hazard", 7],
    ["Hot Spring", "Sulfur steam rises from a rocky pool.", "rest", 3],
    ["Climber's Distress", "A voice calls from a crevice below the path.", "social", 4],
    ["Starfall Crater", "A recent impact smoldered in alpine turf.", "discovery", 6],
  ];

  return templates.map(([name, description, eventType, minLevel]) =>
    buildEvent({
      location: "mountain",
      sceneImage: SCENES.mountain,
      eventType,
      name,
      description,
      minLevel,
      weight: 14,
      choices: [
        statChoice("press", "Press through the challenge", "constitution", 8 + (minLevel % 4), ["The mountain yields its prize.", 15, 22], ["The peak punishes pride.", 0, 12, { effectsAdded: ["bruised"] }]),
        safeChoice("retreat", "Turn back to safer altitude", "Alive is its own reward.", 0, 10),
      ],
    })
  );
}

function townEvents() {
  const templates = [
    ["Shady Potion Deal", "A hooded mage offers glowing vials from a shadowed alley.", "social", 2],
    ["Marked Cards", "A gambler invites you to a back-room game.", "hazard", 3],
    ["Fence's Whisper", "A fence knows who buys stolen relics.", "social", 4],
    ["Night Watch Bribe", "A guard offers to look away for coin.", "social", 3],
    ["Cursed Curiosity Shop", "The shop window displays items that move when unseen.", "discovery", 4],
    ["Alley Duel", "Two rogues circle each other under a broken lantern.", "combat", 5],
    ["Forgery Request", "A noble's seal could be copied for the right price.", "hazard", 6],
    ["Street Preacher", "A prophet screams that the end walks among us.", "social", 2],
    ["Ratcatcher's Tip", "Ratcatchers know every sewer entrance.", "discovery", 3],
    ["Blackmail Note", "An anonymous note demands payment or secrets spill.", "hazard", 5],
    ["Tavern Tip-off", "A drunk mercenary sells dungeon rumors cheap.", "social", 2],
    ["Lantern Thief", "Someone steals lanterns during the fog.", "hazard", 4],
  ];

  return templates.map(([name, description, eventType, minLevel]) =>
    buildEvent({
      location: "town",
      sceneImage: SCENES.town,
      eventType,
      name,
      description,
      minLevel,
      weight: 15,
      choices: [
        randomChoice("engage", "Take the risk", [[45, "Profit from the city's shadows.", 25, 20], [55, "The city's grime wins this round.", -10, 10]]),
        safeChoice("walk", "Walk away", "Surviving the alley is victory enough.", 0, 8),
      ],
    })
  );
}

function goblinEntranceEvents() {
  const templates = [
    ["Cave Guard Post", "A goblin dozes beside a bone whistle.", "combat", 3],
    ["Warning Skulls", "Skulls on pikes line the tunnel mouth.", "hazard", 2],
    ["Stolen Signpost", "Village signs were dragged here as trophies.", "discovery", 2],
    ["Sulfur Draft", "Rotten-egg air pours from the depths.", "hazard", 3],
    ["Crude Toll", "Goblins demand teeth or gold to pass.", "social", 4],
    ["Bat Swarm", "Bats erupt as you near the entrance.", "hazard", 3],
    ["Rival Tribe Marks", "Fresh paint claims territory — war brewing.", "discovery", 4],
    ["Prisoner Plea", "A muffled voice begs from behind a grate.", "social", 4],
  ];

  return templates.map(([name, description, eventType, minLevel]) =>
    buildEvent({
      location: "goblin_cave_entrance",
      sceneImage: SCENES.goblinEntrance,
      eventType,
      name,
      description,
      minLevel,
      weight: 13,
      choices: [
        statChoice("sneak", "Sneak past the entrance", "dexterity", 10, ["Unseen and unheard.", 8, 18], ["A alarm gong rings.", 0, 10]),
        statChoice("charge", "Charge the guards", "strength", 11, ["Glory and loot.", 20, 22], ["They swarm you back.", 0, 14, { effectsAdded: ["wounded"] }]),
      ],
    })
  );
}

function goblinInsideEvents() {
  const templates = [
    ["Fungus Farm", "Goblins cultivate glowing mushrooms for stew.", "discovery", 3],
    ["Shaman's Den", "Bones and charms hang in a side chamber.", "hazard", 5],
    ["Prison Cage", "Village prisoners huddle in a rusted cage.", "social", 4],
    ["Loot Pile", "Discarded adventurer gear forms a trash throne.", "discovery", 4],
    ["Trap Corridor", "Pit spikes wait under woven mats.", "hazard", 5],
    ["Goblin Feast", "Roasted rat and stolen wine flow freely.", "social", 4],
    ["Tunnel Collapse", "Recent fighting collapsed a tunnel.", "hazard", 5],
    ["War Drum", "Drums signal muster deeper in.", "combat", 6],
    ["Shrine of Grib", "A crude idol drips with offerings.", "hazard", 4],
    ["Escapee", "A goblin deserter offers secrets for safety.", "social", 5],
    ["Flooded Passage", "Knee-deep water hides trip hazards.", "hazard", 4],
    ["King's Tax", "Tribute chests head toward the throne room.", "discovery", 6],
  ];

  return templates.map(([name, description, eventType, minLevel]) =>
    buildEvent({
      location: "goblin_cave_inside",
      sceneImage: SCENES.goblinInside,
      eventType,
      name,
      description,
      minLevel,
      weight: 13,
      choices: [
        randomChoice("act", "Act boldly", [[40, "You profit from goblin chaos.", 22, 24], [35, "A close scrape.", 5, 14], [25, "Goblins teach you humility.", 0, 10, { effectsAdded: ["bruised"] }]]),
        safeChoice("hide", "Hide and slip through", "Patience beats pride in caves.", 0, 12),
      ],
    })
  );
}

function dungeonPrisonEvents() {
  const templates = [
    ["Iron Cell Block", "Rows of cells stretch into dripping dark.", "hazard", 5],
    ["Warden's Log", "A ledger lists prisoners never ransomed.", "discovery", 5],
    ["Secret Tunnel", "Mortar crumbles behind a loose stone.", "discovery", 6],
    ["Chain Gang", "Ghostly echoes of chained feet shuffle past.", "hazard", 6],
    ["Torture Rack", "Rust and old stains tell grim stories.", "hazard", 7],
    ["Prison Riot", "Inmates bang doors — chaos spreads.", "combat", 6],
    ["Noble Prisoner", "A masked noble offers wealth for silence.", "social", 6],
    ["Jailer's Bribe", "The jailer sells keys to the highest bidder.", "social", 5],
    ["Flooded Dungeon", "Water rises in the lower levels.", "hazard", 6],
    ["Forgotten Saint", "A prisoner carved prayers into the wall.", "rest", 4],
  ];

  return templates.map(([name, description, eventType, minLevel]) =>
    buildEvent({
      location: "dungeon_prison",
      sceneImage: SCENES.dungeonInside,
      eventType,
      name,
      description,
      minLevel,
      weight: 10,
      choices: [
        statChoice("free", "Attempt a daring rescue", "strength", 12, ["Lives saved, purses gained.", 30, 28], ["Alarms ring — you barely escape.", 0, 15, { effectsAdded: ["wounded"] }]),
        statChoice("keys", "Pick the lock quietly", "dexterity", 11, ["Freedom bought cheaply.", 15, 22], ["The lock wins.", 0, 10]),
        safeChoice("leave", "Leave the condemned to fate", "The dungeon keeps its secrets.", 0, 8),
      ],
    })
  );
}

function goblinKingEvents() {
  const templates = [
    ["Audience with the King", "The Goblin King lounges on a throne of stolen gold.", "combat", 8],
    ["Tribute Demand", "The king demands your gear as 'tax.'", "social", 7],
    ["Champion's Challenge", "The king's champion steps forward grinning.", "combat", 9],
    ["Royal Heist", "The crown sits unguarded — for three heartbeats.", "hazard", 8],
    ["Peace Parley", "The king offers a truce — if you kneel.", "social", 7],
  ];

  return templates.map(([name, description, eventType, minLevel]) =>
    buildEvent({
      location: "goblin_king",
      sceneImage: SCENES.goblinKing,
      eventType,
      name,
      description,
      minLevel,
      weight: 6,
      choices: [
        statChoice("defy", "Defy the Goblin King", "strength", 14, ["Legends will speak of this day.", 80, 45, { itemRewards: ["goblin_kings_crown"] }], ["The king's guards overwhelm you.", 0, 20, { effectsAdded: ["grievous_wound"] }]),
        randomChoice("scheme", "Offer a cunning bargain", [[35, "The king laughs and pays you to leave.", 40, 35], [40, "A tense standoff ends in stalemate.", 10, 25], [25, "Treachery fails — run!", 0, 18, { effectsAdded: ["wounded"] }]]),
        safeChoice("kneel", "Kneel and survive", "Humiliation beats death.", 0, 15),
      ],
    })
  );
}

/** Original tavern-flavored encounters — now with town background. */
function legacyTavernEvents() {
  return [
    buildEvent({
      location: "town",
      sceneImage: SCENES.town,
      eventType: "social",
      name: "The Mysterious Stranger",
      description: "A cloaked figure offers a deal that seems too good to be true.",
      minLevel: 1,
      weight: 20,
      idPrefix: "legacy",
      choices: [
        randomChoice("accept_deal", "Accept the stranger's offer", [[60, "The deal pays off! Gold and information change hands.", 50, 25], [40, "A trap! Your coin purse vanishes.", -30, 10]]),
        safeChoice("refuse_deal", "Politely refuse and walk away", "Caution is its own reward.", 0, 5),
      ],
    }),
    buildEvent({
      location: "town",
      sceneImage: SCENES.town,
      eventType: "combat",
      name: "Tavern Brawl",
      description: "A drunken patron challenges you to a fight!",
      minLevel: 2,
      weight: 22,
      idPrefix: "legacy",
      choices: [
        statChoice("fight_back", "Accept the challenge", "strength", 10, ["The crowd cheers your victory!", 15, 30], ["Beaten and bruised.", -10, 15, { effectsAdded: ["bruised"] }]),
        statChoice("talk_down", "Calm the situation", "charisma", 12, ["A new drinking buddy.", 5, 20], ["You barely escape.", 0, 10]),
      ],
    }),
    buildEvent({
      location: "town",
      sceneImage: SCENES.town,
      eventType: "social",
      name: "The Fortune Teller",
      description: "An old woman with milky eyes beckons you. 'I see your bloodline's fate.'",
      minLevel: 1,
      weight: 15,
      idPrefix: "legacy",
      choices: [
        randomChoice("pay_for_fortune", "Pay 20 gold for a reading", [[40, "Prosperity blesses your bloodline.", -20, 15, { effectsAdded: ["fortune_blessing"] }], [40, "Cryptic warnings fade from memory.", -20, 10], [20, "A curse follows your line!", -20, 25, { effectsAdded: ["fortune_curse"] }]]),
        safeChoice("ignore_fortune", "Ignore her", "Some things stay unknown.", 0, 0),
      ],
    }),
    buildEvent({
      location: "town",
      sceneImage: SCENES.town,
      eventType: "social",
      name: "The Underground Game",
      description: "A shadowy figure offers entry to a high-stakes gambling den.",
      minLevel: 3,
      weight: 18,
      idPrefix: "legacy",
      choices: [
        statChoice("gamble_big", "Bet 50 gold", "luck", 12, ["Lady Luck smiles!", 150, 20, { itemRewards: ["lucky_coin"] }], ["The dice betray you.", -50, 10]),
        statChoice("gamble_small", "Bet 10 gold", "luck", 8, ["A modest win.", 10, 10], ["Small loss, hard lesson.", -10, 5]),
      ],
    }),
    buildEvent({
      location: "town",
      sceneImage: SCENES.town,
      eventType: "discovery",
      name: "The Wandering Merchant",
      description: "A traveling merchant spreads exotic wares across a table.",
      minLevel: 1,
      weight: 20,
      idPrefix: "legacy",
      choices: [
        randomChoice("buy_mystery_item", "Buy a sealed box (30 gold)", [[30, "A rare artifact inside!", -30, 20, { itemRewards: ["mystery_artifact"] }], [50, "A decent potion.", -30, 10, { itemRewards: ["health_potion"] }], [20, "Empty box — swindled.", -30, 5]]),
        safeChoice("browse_only", "Browse without buying", "Window shopping suffices.", 0, 5),
      ],
    }),
    buildEvent({
      location: "town",
      sceneImage: SCENES.town,
      eventType: "hazard",
      name: "The Death Duel",
      description: "A notorious duelist blocks your path. 'Your bloodline ends tonight!'",
      minLevel: 8,
      weight: 5,
      extraReq: { minGeneration: 3 },
      idPrefix: "legacy",
      choices: [
        statChoice("accept_duel", "Accept the duel", "strength", 15, ["Victory and spoils!", 200, 100, { itemRewards: ["duelist_sword"], effectsAdded: ["duelist_renown"] }], ["The blade finds your heart.", 0, 0, { heirDies: true }]),
        safeChoice("flee_duel", "Flee", "Cowardice keeps you breathing.", 0, 5, { effectsAdded: ["cowards_mark"] }),
      ],
    }),
  ];
}

const events = [
  ...forestEvents(),
  ...shrineEvents(),
  ...forestGoblinCaveEvents(),
  ...mountainEvents(),
  ...townEvents(),
  ...goblinEntranceEvents(),
  ...goblinInsideEvents(),
  ...dungeonPrisonEvents(),
  ...goblinKingEvents(),
  ...legacyTavernEvents(),
];

const ids = new Set();
for (const event of events) {
  if (ids.has(event.id)) {
    throw new Error(`Duplicate event id: ${event.id}`);
  }
  ids.add(event.id);
}

writeFileSync(OUT, `${JSON.stringify({ events }, null, 2)}\n`, "utf8");
console.log(`Wrote ${events.length} field events to ${OUT}`);
