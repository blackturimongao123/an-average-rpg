# An Average RPG

## Event & Mission Board Content Bible

*200 unique events + 108 mission-board contracts + 1,080 fixed mission events*

# Authoring Assumptions

The lineage is the protagonist. Every mission should leave a chronicle mark: rank XP, bankable gain, heir scar, grudge, blessing, or death.

Mission board contracts are filtered by adventurer rank, heir level, background/scene, and optional secret prerequisites.

Each mission below has exactly 10 fixed story events. Random and secret interludes may be inserted between fixed beats when their eligibility matches.

Settings use the game-facing tags town, forest, cave, mountain, dungeon, coast, swamp, road, ruins, and crypt.

Secret content should not announce itself on the board until prerequisites are met. Store conditions as server-validated rules.

# Eligibility Schema

| Field | Purpose | Examples | Server notes |
| --- | --- | --- | --- |
| setting | Filters scene/background and eligible interludes. | town, forest, cave, mountain, dungeon | Client can display matching background art; server validates event pool. |
| rankBand | Gates mission-board slots. | F-E, C-B, SSS | Use lineage adventurer rank, not only heir level. |
| minLevel | Prevents lethal content appearing too early. | level >= 6 | Use heir level; death resets this gate. |
| completedMissionIds | Unlocks sequel/secret content. | misty-on-the-mill-roof | Can be heir-scoped or lineage-scoped depending on content. |
| stat/class | Personalizes choice branches. | faith >= 10, Rogue, charisma >= 11 | Branch outcomes can differ without hiding the whole event. |
| lineage gates | Makes death/progression matter. | generation >= 5, deadHeirs >= 10 | Useful for bloodline revelations and SSS contracts. |
| infamy | Lets cruel or notorious heirs see darker options. | infamy >= 5 | May increase rewards while creating future danger. |

# Part I — 200 Unique Random, Unique, and Secret Events

Use these as tavern events, field encounters, and mission interludes. Each entry has an eligibility rule so it does not appear in every background.

## Town Events

| ID | Event | Type / Tone | Eligibility | Scene prompt / Outcome |
| --- | --- | --- | --- | --- |
| evt_town_01_widows-flour-sack-trail | Widow's Flour-Sack Trail | random interlude<br>mild | Background: town; Level >= 1; rank F+. | Prompt: A ripped flour sack leaves pale prints through the alley behind the mill.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: town_market/tavern_street |
| evt_town_02_beggar-with-a-noble-ring | Beggar With a Noble Ring | random interlude<br>mild | Background: town; Requires luck >= 12 or Rogue class for best branch. | Prompt: A beggar offers a signet ring in exchange for one night of silence.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: town_market/tavern_street |
| evt_town_03_cat-in-the-bell-rope | Cat in the Bell Rope | random interlude<br>mild | Background: town; Requires charisma >= 11 for peaceful branch. | Prompt: A frightened cat climbs into the chapel bell rope before curfew.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: town_market/tavern_street |
| evt_town_04_well-water-tastes-of-iron | Well Water Tastes of Iron | secret event<br>mild | Background: town; Secret: completedMissionIds includes moonlit-charcoal-kiln. | Prompt: The public well stains cups red, but only after strangers drink.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: town_market/tavern_street |
| evt_town_05_the-tax-candle-burns-black | The Tax Candle Burns Black | unique event<br>mild | Background: town; Secret: lineage generation >= 7. | Prompt: A tax office candle burns black whenever a false account is read.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: town_market/tavern_street |
| evt_town_06_knife-game-behind-the-tavern | Knife Game Behind the Tavern | random interlude<br>mild | Background: town; Requires faith >= 10 or Cleric class. | Prompt: Local toughs play for fingers, secrets, and small debts.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: town_market/tavern_street |
| evt_town_07_rain-on-a-single-door | Rain on a Single Door | random interlude<br>moderate | Background: town; Requires intelligence >= 12 for safe interpretation. | Prompt: One townhouse is soaked by rain falling from a cloudless sky.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: town_market/tavern_street |
| evt_town_08_the-laughing-stocks | The Laughing Stocks | random interlude<br>moderate | Background: town; Requires infamy >= 5 for intimidation option. | Prompt: The punishment stocks laugh using the voices of people locked there last year.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: town_market/tavern_street |
| evt_town_09_blind-cobblers-warning | Blind Cobbler's Warning | secret event<br>moderate | Background: town; Secret: level >= 7 and completedMissionIds includes moonlit-charcoal-kiln. | Prompt: A blind cobbler recognizes the heir by footstep and warns of a debt.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: town_market/tavern_street |
| evt_town_10_duel-at-market-noon | Duel at Market Noon | unique event<br>moderate | Background: town; Always eligible in matching background. | Prompt: Two apprentices demand the heir witness a duel over a forged love letter.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: town_market/tavern_street |
| evt_town_11_child-counting-chimneys | Child Counting Chimneys | random interlude<br>moderate | Background: town; Level >= 7; rank E+. | Prompt: A child counts chimneys and insists one more appears each dusk.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: town_market/tavern_street |
| evt_town_12_the-butchers-honest-scale | The Butcher's Honest Scale | random interlude<br>moderate | Background: town; Requires luck >= 12 or Rogue class for best branch. | Prompt: The butcher's scale weighs guilt instead of meat.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: town_market/tavern_street |
| evt_town_13_lost-heirloom-button | Lost Heirloom Button | random interlude<br>moderate | Background: town; Requires charisma >= 11 for peaceful branch. | Prompt: A silver button with the family mark appears in a gutter.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: town_market/tavern_street |
| evt_town_14_choir-practice-in-empty-chap | Choir Practice in Empty Chapel | secret event<br>moderate | Background: town; Secret: completedMissionIds includes moonlit-charcoal-kiln. | Prompt: The chapel choir sings perfectly though no one is inside.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: town_market/tavern_street |
| evt_town_15_the-scribe-who-forgot-his-na | The Scribe Who Forgot His Name | unique event<br>dangerous | Background: town; Secret: lineage generation >= 5. | Prompt: A guild scribe forgets his name but remembers every unpaid contract.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: town_market/tavern_street |
| evt_town_16_ale-that-shows-tomorrow | Ale That Shows Tomorrow | random interlude<br>dangerous | Background: town; Requires faith >= 10 or Cleric class. | Prompt: One tavern barrel shows tomorrow's face in its foam.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: town_market/tavern_street |
| evt_town_17_the-mayors-locked-smile | The Mayor's Locked Smile | random interlude<br>dangerous | Background: town; Requires intelligence >= 12 for safe interpretation. | Prompt: The mayor smiles through a curse and begs with his eyes.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: town_market/tavern_street |
| evt_town_18_mourning-clothes-on-festival | Mourning Clothes on Festival Day | random interlude<br>dangerous | Background: town; Requires infamy >= 5 for intimidation option. | Prompt: A tailor sells mourning clothes to people who are not dead yet.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: town_market/tavern_street |
| evt_town_19_a-rat-wearing-a-medal | A Rat Wearing a Medal | secret event<br>dangerous | Background: town; Secret: level >= 13 and completedMissionIds includes moonlit-charcoal-kiln. | Prompt: A rat drags a military medal through the street as if on parade.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: town_market/tavern_street |
| evt_town_20_the-clock-that-skips-your-ho | The Clock That Skips Your Hour | random interlude<br>dangerous | Background: town; Always eligible in matching background. | Prompt: The town clock skips the heir's birth hour and the crowd notices.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: town_market/tavern_street |

## Forest Events

| ID | Event | Type / Tone | Eligibility | Scene prompt / Outcome |
| --- | --- | --- | --- | --- |
| evt_forest_01_lanterns-in-the-briars | Lanterns in the Briars | random interlude<br>mild | Background: forest; Requires luck >= 12 or Rogue class for best branch. | Prompt: Small lanterns glow inside brambles where no hand can reach.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: forest_briar/moonlit_wood |
| evt_forest_02_oak-with-a-door-knocker | Oak With a Door-Knocker | random interlude<br>mild | Background: forest; Requires charisma >= 11 for peaceful branch. | Prompt: An oak tree bears a brass knocker warm to the touch.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: forest_briar/moonlit_wood |
| evt_forest_03_deer-wearing-wedding-lace | Deer Wearing Wedding Lace | random interlude<br>mild | Background: forest; Secret: completedMissionIds includes pale-antlers-at-thornmere. | Prompt: A deer runs past in a torn veil and refuses to bleed.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: forest_briar/moonlit_wood |
| evt_forest_04_poachers-snare-map | Poacher's Snare Map | secret event<br>mild | Background: forest; Secret: lineage generation >= 2. | Prompt: A dead poacher's skin is tattooed with a useful snare map.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: forest_briar/moonlit_wood |
| evt_forest_05_mushrooms-in-a-perfect-spira | Mushrooms in a Perfect Spiral | unique event<br>mild | Background: forest; Requires faith >= 10 or Cleric class. | Prompt: Mooncaps form a spiral that tightens when watched.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: forest_briar/moonlit_wood |
| evt_forest_06_the-silent-woodcutters | The Silent Woodcutters | random interlude<br>mild | Background: forest; Requires intelligence >= 12 for safe interpretation. | Prompt: Woodcutters swing axes in perfect silence and never strike bark.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: forest_briar/moonlit_wood |
| evt_forest_07_crow-funeral | Crow Funeral | random interlude<br>moderate | Background: forest; Requires infamy >= 5 for intimidation option. | Prompt: Crows bury a tiny crown under wet leaves.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: forest_briar/moonlit_wood |
| evt_forest_08_bark-mask-on-the-path | Bark Mask on the Path | random interlude<br>moderate | Background: forest; One-time unique per heir; cannot repeat after success. | Prompt: A bark mask lies face up and whispers the heir's surname.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: forest_briar/moonlit_wood |
| evt_forest_09_fox-demands-a-toll | Fox Demands a Toll | secret event<br>moderate | Background: forest; Secret: level >= 8 and completedMissionIds includes moonlit-charcoal-kiln. | Prompt: A fox blocks the trail and demands a joke, coin, or tooth.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: forest_briar/moonlit_wood |
| evt_forest_10_sap-that-smells-of-wine | Sap That Smells of Wine | unique event<br>moderate | Background: forest; Level >= 8; rank E+. | Prompt: Red sap drips from a wounded tree and makes animals drunk.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: forest_briar/moonlit_wood |
| evt_forest_11_hunters-arrow-returns | Hunter's Arrow Returns | random interlude<br>moderate | Background: forest; Requires luck >= 12 or Rogue class for best branch. | Prompt: An arrow lands at the heir's feet with their name carved into it.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: forest_briar/moonlit_wood |
| evt_forest_12_grandmother-root | Grandmother Root | random interlude<br>moderate | Background: forest; Requires charisma >= 11 for peaceful branch. | Prompt: A root shaped like a hand grips a child's doll.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: forest_briar/moonlit_wood |
| evt_forest_13_the-orchard-counts-back | The Orchard Counts Back | random interlude<br>moderate | Background: forest; Secret: completedMissionIds includes pale-antlers-at-thornmere. | Prompt: Every apple tree is numbered, but the numbers count down to one.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: forest_briar/moonlit_wood |
| evt_forest_14_wolf-tracks-around-camp | Wolf Tracks Around Camp | secret event<br>moderate | Background: forest; Secret: lineage generation >= 6. | Prompt: Wolf tracks circle the camp from the inside outward.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: forest_briar/moonlit_wood |
| evt_forest_15_mirror-pool-under-ferns | Mirror Pool Under Ferns | unique event<br>dangerous | Background: forest; Requires faith >= 10 or Cleric class. | Prompt: A hidden pool reflects the heir as an older generation.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: forest_briar/moonlit_wood |
| evt_forest_16_birdsong-in-a-dead-tongue | Birdsong in a Dead Tongue | random interlude<br>dangerous | Background: forest; Requires intelligence >= 12 for safe interpretation. | Prompt: Birdsong forms clear words if the heir knows old prayers.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: forest_briar/moonlit_wood |
| evt_forest_17_the-green-tax-collector | The Green Tax Collector | random interlude<br>dangerous | Background: forest; Requires infamy >= 5 for intimidation option. | Prompt: A moss-cloaked figure presents a bill for every branch broken.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: forest_briar/moonlit_wood |
| evt_forest_18_sleeping-bear-with-human-dre | Sleeping Bear with Human Dreams | random interlude<br>dangerous | Background: forest; One-time unique per heir; cannot repeat after success. | Prompt: A bear mutters legal testimony while sleeping.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: forest_briar/moonlit_wood |
| evt_forest_19_the-fiddle-in-the-hollow | The Fiddle in the Hollow | secret event<br>dangerous | Background: forest; Secret: level >= 14 and completedMissionIds includes moonlit-charcoal-kiln. | Prompt: A fiddle plays beneath a hollow log; dancers have no shadows.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: forest_briar/moonlit_wood |
| evt_forest_20_the-tree-that-asks-permissio | The Tree That Asks Permission | random interlude<br>dangerous | Background: forest; Level >= 17; rank D+. | Prompt: A fallen tree asks politely before crushing the road behind the heir.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: forest_briar/moonlit_wood |

## Cave Events

| ID | Event | Type / Tone | Eligibility | Scene prompt / Outcome |
| --- | --- | --- | --- | --- |
| evt_cave_01_dripping-stone-names | Dripping Stone Names | random interlude<br>mild | Background: cave; Requires charisma >= 11 for peaceful branch. | Prompt: Water drops spell names on the cave floor before vanishing.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: cave_mouth/deep_mine |
| evt_cave_02_miners-candle-refuses-death | Miner's Candle Refuses Death | random interlude<br>mild | Background: cave; Secret: completedMissionIds includes blackwater-ferry-bell. | Prompt: A candle burns underwater and points deeper into the mine.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: cave_mouth/deep_mine |
| evt_cave_03_glass-bat-swarm | Glass Bat Swarm | random interlude<br>mild | Background: cave; Secret: lineage generation >= 3. | Prompt: Transparent bats flash stolen memories through their wings.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: cave_mouth/deep_mine |
| evt_cave_04_echo-counts-your-bones | Echo Counts Your Bones | secret event<br>mild | Background: cave; Secret: level >= 6 and completedMissionIds includes moonlit-charcoal-kiln. | Prompt: An echo answers with a number higher than the heir's bones.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: cave_mouth/deep_mine |
| evt_cave_05_the-rope-pulled-downward | The Rope Pulled Downward | unique event<br>mild | Background: cave; Requires intelligence >= 12 for safe interpretation. | Prompt: A climbing rope tugs as if someone below is begging.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: cave_mouth/deep_mine |
| evt_cave_06_blind-fish-in-a-puddle | Blind Fish in a Puddle | random interlude<br>mild | Background: cave; Requires infamy >= 5 for intimidation option. | Prompt: Blind fish swim in a boot-deep puddle and carry gold flakes.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: cave_mouth/deep_mine |
| evt_cave_07_old-pickaxe-in-fresh-stone | Old Pickaxe in Fresh Stone | random interlude<br>moderate | Background: cave; One-time unique per heir; cannot repeat after success. | Prompt: A rusted pickaxe is embedded in stone formed this morning.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: cave_mouth/deep_mine |
| evt_cave_08_mine-gas-hymn | Mine-Gas Hymn | random interlude<br>moderate | Background: cave; Always eligible in matching background. | Prompt: Gas vents hum the local funeral hymn on the wrong notes.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: cave_mouth/deep_mine |
| evt_cave_09_map-scratched-by-fingernails | Map Scratched by Fingernails | secret event<br>moderate | Background: cave; Secret: level >= 9 and completedMissionIds includes moonlit-charcoal-kiln. | Prompt: A wall map is scratched by fingernails from the other side.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: cave_mouth/deep_mine |
| evt_cave_10_salt-vein-shaped-like-a-spin | Salt Vein Shaped Like a Spine | unique event<br>moderate | Background: cave; Requires luck >= 12 or Rogue class for best branch. | Prompt: A salt vein curves like a giant spine through the wall.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: cave_mouth/deep_mine |
| evt_cave_11_cave-pearl-in-a-skull | Cave Pearl in a Skull | random interlude<br>moderate | Background: cave; Requires charisma >= 11 for peaceful branch. | Prompt: A pearl grows inside a skull wearing miner's teeth.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: cave_mouth/deep_mine |
| evt_cave_12_the-second-footfall | The Second Footfall | random interlude<br>moderate | Background: cave; Secret: completedMissionIds includes blackwater-ferry-bell. | Prompt: Every step echoes twice, then three times, then follows.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: cave_mouth/deep_mine |
| evt_cave_13_iron-door-without-hinges | Iron Door Without Hinges | random interlude<br>moderate | Background: cave; Secret: lineage generation >= 7. | Prompt: A door of iron has no hinges and breathes warm air.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: cave_mouth/deep_mine |
| evt_cave_14_the-lost-canary-speaks | The Lost Canary Speaks | secret event<br>moderate | Background: cave; Secret: level >= 12 and completedMissionIds includes moonlit-charcoal-kiln. | Prompt: A dead canary gives one warning in a miner's voice.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: cave_mouth/deep_mine |
| evt_cave_15_torchlight-goes-blue | Torchlight Goes Blue | unique event<br>dangerous | Background: cave; Requires intelligence >= 12 for safe interpretation. | Prompt: Torches turn blue near an invisible drop.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: cave_mouth/deep_mine |
| evt_cave_16_the-kindly-collapse | The Kindly Collapse | random interlude<br>dangerous | Background: cave; Requires infamy >= 5 for intimidation option. | Prompt: A collapse seals danger away but traps a crying stranger.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: cave_mouth/deep_mine |
| evt_cave_17_old-dwarf-lottery | Old Dwarf Lottery | random interlude<br>dangerous | Background: cave; One-time unique per heir; cannot repeat after success. | Prompt: Carved stones invite the heir to gamble blood for ore.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: cave_mouth/deep_mine |
| evt_cave_18_waterfall-falling-up | Waterfall Falling Up | random interlude<br>dangerous | Background: cave; Always eligible in matching background. | Prompt: An underground waterfall runs upward into a black crack.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: cave_mouth/deep_mine |
| evt_cave_19_the-lode-that-bleeds | The Lode That Bleeds | secret event<br>dangerous | Background: cave; Secret: level >= 15 and completedMissionIds includes moonlit-charcoal-kiln. | Prompt: A silver lode bleeds when struck with steel.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: cave_mouth/deep_mine |
| evt_cave_20_tunnel-drawn-on-skin | Tunnel Drawn on Skin | random interlude<br>dangerous | Background: cave; Requires luck >= 12 or Rogue class for best branch. | Prompt: Dust reveals a tunnel diagram on the heir's arm.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: cave_mouth/deep_mine |

## Mountain Events

| ID | Event | Type / Tone | Eligibility | Scene prompt / Outcome |
| --- | --- | --- | --- | --- |
| evt_mountain_01_goat-with-a-crown-of-ice | Goat with a Crown of Ice | random interlude<br>mild | Background: mountain; Secret: completedMissionIds includes lost-goat-at-briar-ford. | Prompt: A mountain goat wears a crown of ice and kneels to no one.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: snow_pass/cliff_shrine |
| evt_mountain_02_avalanche-bell | Avalanche Bell | random interlude<br>mild | Background: mountain; Secret: lineage generation >= 4. | Prompt: A buried bell rings once before the slope decides to fall.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: snow_pass/cliff_shrine |
| evt_mountain_03_pilgrim-frozen-praying | Pilgrim Frozen Praying | random interlude<br>mild | Background: mountain; Requires faith >= 10 or Cleric class. | Prompt: A frozen pilgrim opens one eye and asks the date.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: snow_pass/cliff_shrine |
| evt_mountain_04_eagle-drops-a-key | Eagle Drops a Key | secret event<br>mild | Background: mountain; Secret: level >= 7 and completedMissionIds includes moonlit-charcoal-kiln. | Prompt: A great eagle drops a warm key into the snow.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: snow_pass/cliff_shrine |
| evt_mountain_05_bridge-of-three-ropes | Bridge of Three Ropes | unique event<br>mild | Background: mountain; Requires infamy >= 5 for intimidation option. | Prompt: A rope bridge has three ropes; one is made of hair.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: snow_pass/cliff_shrine |
| evt_mountain_06_thin-air-confession | Thin-Air Confession | random interlude<br>mild | Background: mountain; One-time unique per heir; cannot repeat after success. | Prompt: At altitude, the heir speaks a secret they never meant to reveal.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: snow_pass/cliff_shrine |
| evt_mountain_07_snow-footprints-going-upward | Snow Footprints Going Upward | random interlude<br>moderate | Background: mountain; Always eligible in matching background. | Prompt: Footprints climb vertically up a cliff face.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: snow_pass/cliff_shrine |
| evt_mountain_08_hermit-selling-thunder | Hermit Selling Thunder | random interlude<br>moderate | Background: mountain; Level >= 10; rank E+. | Prompt: A hermit sells bottled thunder and refuses gold.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: snow_pass/cliff_shrine |
| evt_mountain_09_the-blue-lipped-shrine | The Blue-Lipped Shrine | secret event<br>moderate | Background: mountain; Secret: level >= 10 and completedMissionIds includes moonlit-charcoal-kiln. | Prompt: A shrine answers prayers by stealing heat from the petitioner.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: snow_pass/cliff_shrine |
| evt_mountain_10_harpies-mimic-family-voices | Harpies Mimic Family Voices | unique event<br>moderate | Background: mountain; Requires charisma >= 11 for peaceful branch. | Prompt: Harpies call from the clouds using dead relatives' voices.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: snow_pass/cliff_shrine |
| evt_mountain_11_stone-ram-challenges-passage | Stone Ram Challenges Passage | random interlude<br>moderate | Background: mountain; Secret: completedMissionIds includes lost-goat-at-briar-ford. | Prompt: A stone ram blocks the path until beaten or praised.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: snow_pass/cliff_shrine |
| evt_mountain_12_ice-mirror-overhang | Ice Mirror Overhang | random interlude<br>moderate | Background: mountain; Secret: lineage generation >= 2. | Prompt: An overhang reflects events from a future fall.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: snow_pass/cliff_shrine |
| evt_mountain_13_prayer-flags-strangle-wind | Prayer Flags Strangle Wind | random interlude<br>moderate | Background: mountain; Requires faith >= 10 or Cleric class. | Prompt: Prayer flags snap around the wind and choke it still.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: snow_pass/cliff_shrine |
| evt_mountain_14_summit-soup-pot | Summit Soup Pot | secret event<br>moderate | Background: mountain; Secret: level >= 13 and completedMissionIds includes moonlit-charcoal-kiln. | Prompt: A soup pot simmers unattended on a peak no cook could reach.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: snow_pass/cliff_shrine |
| evt_mountain_15_the-sled-with-no-driver | The Sled with No Driver | unique event<br>dangerous | Background: mountain; Requires infamy >= 5 for intimidation option. | Prompt: A loaded sled races downhill with no driver and fresh blood.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: snow_pass/cliff_shrine |
| evt_mountain_16_cliffside-court | Cliffside Court | random interlude<br>dangerous | Background: mountain; One-time unique per heir; cannot repeat after success. | Prompt: Tiny judges carved into the cliff demand a trial.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: snow_pass/cliff_shrine |
| evt_mountain_17_frostbitten-letter | Frostbitten Letter | random interlude<br>dangerous | Background: mountain; Always eligible in matching background. | Prompt: A letter frozen to stone addresses the heir by generation number.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: snow_pass/cliff_shrine |
| evt_mountain_18_the-sleeping-avalanche | The Sleeping Avalanche | random interlude<br>dangerous | Background: mountain; Level >= 16; rank D+. | Prompt: A snowfield snores and must not be woken.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: snow_pass/cliff_shrine |
| evt_mountain_19_peak-shadow-at-noon | Peak Shadow at Noon | secret event<br>dangerous | Background: mountain; Secret: level >= 16 and completedMissionIds includes moonlit-charcoal-kiln. | Prompt: A peak casts a shadow at noon toward the wrong kingdom.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: snow_pass/cliff_shrine |
| evt_mountain_20_the-saints-last-breath | The Saint's Last Breath | random interlude<br>dangerous | Background: mountain; Requires charisma >= 11 for peaceful branch. | Prompt: A cave exhales warm air once per year; today is the day.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: snow_pass/cliff_shrine |

## Dungeon Events

| ID | Event | Type / Tone | Eligibility | Scene prompt / Outcome |
| --- | --- | --- | --- | --- |
| evt_dungeon_01_cell-door-open-inward | Cell Door Open Inward | random interlude<br>mild | Background: dungeon; Secret: lineage generation >= 5. | Prompt: A cell door opens inward though the lock is outside.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: dungeon_hall/iron_gate |
| evt_dungeon_02_chains-learning-names | Chains Learning Names | random interlude<br>mild | Background: dungeon; Requires faith >= 10 or Cleric class. | Prompt: Chains scrape the floor and practice the heir's name.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: dungeon_hall/iron_gate |
| evt_dungeon_03_gaolers-lunch-still-warm | Gaoler's Lunch Still Warm | random interlude<br>mild | Background: dungeon; Requires intelligence >= 12 for safe interpretation. | Prompt: A gaoler's lunch sits warm beside bones centuries old.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: dungeon_hall/iron_gate |
| evt_dungeon_04_rune-that-counts-wounds | Rune That Counts Wounds | secret event<br>mild | Background: dungeon; Secret: level >= 8 and completedMissionIds includes moonlit-charcoal-kiln. | Prompt: A rune glows brighter for every scar the heir carries.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: dungeon_hall/iron_gate |
| evt_dungeon_05_prisoner-behind-fresh-mortar | Prisoner Behind Fresh Mortar | unique event<br>mild | Background: dungeon; One-time unique per heir; cannot repeat after success. | Prompt: A voice speaks from behind mortar still wet.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: dungeon_hall/iron_gate |
| evt_dungeon_06_the-friendly-rack | The Friendly Rack | random interlude<br>mild | Background: dungeon; Always eligible in matching background. | Prompt: A torture rack politely offers advice about posture.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: dungeon_hall/iron_gate |
| evt_dungeon_07_black-key-in-white-ash | Black Key in White Ash | random interlude<br>moderate | Background: dungeon; Level >= 8; rank E+. | Prompt: A black key lies in a pile of white ash shaped like a hand.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: dungeon_hall/iron_gate |
| evt_dungeon_08_the-courtroom-cell | The Courtroom Cell | random interlude<br>moderate | Background: dungeon; Requires luck >= 12 or Rogue class for best branch. | Prompt: A cell contains a judge's bench and one guilty chair.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: dungeon_hall/iron_gate |
| evt_dungeon_09_iron-maiden-humming | Iron Maiden Humming | secret event<br>moderate | Background: dungeon; Secret: level >= 11 and completedMissionIds includes moonlit-charcoal-kiln. | Prompt: An iron maiden hums a lullaby to a hidden child.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: dungeon_hall/iron_gate |
| evt_dungeon_10_bread-slot-with-teeth | Bread Slot with Teeth | unique event<br>moderate | Background: dungeon; Secret: completedMissionIds includes misty-on-the-mill-roof. | Prompt: A bread slot snaps shut with wet teeth.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: dungeon_hall/iron_gate |
| evt_dungeon_11_the-map-that-punishes-lies | The Map That Punishes Lies | random interlude<br>moderate | Background: dungeon; Secret: lineage generation >= 3. | Prompt: A dungeon map burns every false statement spoken over it.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: dungeon_hall/iron_gate |
| evt_dungeon_12_prayer-etched-upside-down | Prayer Etched Upside Down | random interlude<br>moderate | Background: dungeon; Requires faith >= 10 or Cleric class. | Prompt: A prayer is etched upside down on the ceiling above a pit.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: dungeon_hall/iron_gate |
| evt_dungeon_13_the-false-exit | The False Exit | random interlude<br>moderate | Background: dungeon; Requires intelligence >= 12 for safe interpretation. | Prompt: An exit door opens onto yesterday's corridor.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: dungeon_hall/iron_gate |
| evt_dungeon_14_jailers-shadow-still-patrols | Jailer's Shadow Still Patrols | secret event<br>moderate | Background: dungeon; Secret: level >= 14 and completedMissionIds includes moonlit-charcoal-kiln. | Prompt: A shadow patrols with keys that unlock memories.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: dungeon_hall/iron_gate |
| evt_dungeon_15_well-of-confiscated-names | Well of Confiscated Names | unique event<br>dangerous | Background: dungeon; One-time unique per heir; cannot repeat after success. | Prompt: The prison well echoes names confiscated from inmates.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: dungeon_hall/iron_gate |
| evt_dungeon_16_dice-made-of-knuckles | Dice Made of Knuckles | random interlude<br>dangerous | Background: dungeon; Always eligible in matching background. | Prompt: Bone dice roll themselves and demand a wager.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: dungeon_hall/iron_gate |
| evt_dungeon_17_the-clean-cell | The Clean Cell | random interlude<br>dangerous | Background: dungeon; Level >= 17; rank D+. | Prompt: One immaculate cell has flowers and a fresh noose.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: dungeon_hall/iron_gate |
| evt_dungeon_18_chalk-mark-from-tomorrow | Chalk Mark from Tomorrow | random interlude<br>dangerous | Background: dungeon; Requires luck >= 12 or Rogue class for best branch. | Prompt: A chalk arrow appears where the heir will flee later.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: dungeon_hall/iron_gate |
| evt_dungeon_19_the-hungry-portcullis | The Hungry Portcullis | secret event<br>dangerous | Background: dungeon; Secret: level >= 17 and completedMissionIds includes moonlit-charcoal-kiln. | Prompt: A portcullis drops only when someone lies underneath.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: dungeon_hall/iron_gate |
| evt_dungeon_20_pardon-written-in-blood | Pardon Written in Blood | random interlude<br>dangerous | Background: dungeon; Secret: completedMissionIds includes misty-on-the-mill-roof. | Prompt: A pardon signed in blood waits for an unnamed prisoner.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: dungeon_hall/iron_gate |

## Coast Events

| ID | Event | Type / Tone | Eligibility | Scene prompt / Outcome |
| --- | --- | --- | --- | --- |
| evt_coast_01_bottle-with-a-still-beating- | Bottle with a Still-Beating Heart | random interlude<br>mild | Background: coast; Requires faith >= 10 or Cleric class. | Prompt: A bottle washes ashore with a tiny heart beating inside.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: storm_coast/fishing_dock |
| evt_coast_02_net-full-of-teeth | Net Full of Teeth | random interlude<br>mild | Background: coast; Requires intelligence >= 12 for safe interpretation. | Prompt: A fishing net comes up full of human teeth, sorted by size.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: storm_coast/fishing_dock |
| evt_coast_03_lighthouse-blinks-twice | Lighthouse Blinks Twice | random interlude<br>mild | Background: coast; Requires infamy >= 5 for intimidation option. | Prompt: The lighthouse blinks like an eye when the heir approaches.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: storm_coast/fishing_dock |
| evt_coast_04_drowned-sailor-buys-ale | Drowned Sailor Buys Ale | secret event<br>mild | Background: coast; Secret: level >= 9 and completedMissionIds includes moonlit-charcoal-kiln. | Prompt: A drowned sailor pays with wet coins and asks for directions home.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: storm_coast/fishing_dock |
| evt_coast_05_tide-leaves-a-door | Tide Leaves a Door | unique event<br>mild | Background: coast; Always eligible in matching background. | Prompt: Low tide reveals a barn door standing upright in the mud.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: storm_coast/fishing_dock |
| evt_coast_06_pearls-in-a-dead-gull | Pearls in a Dead Gull | random interlude<br>mild | Background: coast; Level >= 9; rank E+. | Prompt: A dead gull's crop is full of black pearls.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: storm_coast/fishing_dock |
| evt_coast_07_harbor-bell-underwater | Harbor Bell Underwater | random interlude<br>moderate | Background: coast; Requires luck >= 12 or Rogue class for best branch. | Prompt: The harbor bell rings from below the pier.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: storm_coast/fishing_dock |
| evt_coast_08_crab-wearing-a-wedding-ring | Crab Wearing a Wedding Ring | random interlude<br>moderate | Background: coast; Requires charisma >= 11 for peaceful branch. | Prompt: A crab brandishes a wedding ring and refuses to let go.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: storm_coast/fishing_dock |
| evt_coast_09_song-from-the-fogbank | Song from the Fogbank | secret event<br>moderate | Background: coast; Secret: completedMissionIds includes moonlit-charcoal-kiln. | Prompt: A fogbank sings the heir's childhood lullaby.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: storm_coast/fishing_dock |
| evt_coast_10_salt-that-crawls | Salt That Crawls | unique event<br>moderate | Background: coast; Secret: lineage generation >= 4. | Prompt: A line of salt crawls inland like white ants.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: storm_coast/fishing_dock |
| evt_coast_11_ship-without-a-wake | Ship Without a Wake | random interlude<br>moderate | Background: coast; Requires faith >= 10 or Cleric class. | Prompt: A ship crosses the bay without leaving a wake or shadow.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: storm_coast/fishing_dock |
| evt_coast_12_anchor-in-the-market-square | Anchor in the Market Square | random interlude<br>moderate | Background: coast; Requires intelligence >= 12 for safe interpretation. | Prompt: An anchor appears in the square dripping seaweed.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: storm_coast/fishing_dock |
| evt_coast_13_the-mermaids-tax-notice | The Mermaid's Tax Notice | random interlude<br>moderate | Background: coast; Requires infamy >= 5 for intimidation option. | Prompt: A tax notice from a mermaid court is nailed to the dock.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: storm_coast/fishing_dock |
| evt_coast_14_fishmarket-prophet | Fishmarket Prophet | secret event<br>moderate | Background: coast; Secret: level >= 15 and completedMissionIds includes moonlit-charcoal-kiln. | Prompt: A fishmonger predicts death by arranging cod heads.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: storm_coast/fishing_dock |
| evt_coast_15_the-storm-buys-rope | The Storm Buys Rope | unique event<br>dangerous | Background: coast; Always eligible in matching background. | Prompt: A storm speaks through a sailmaker and buys rope.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: storm_coast/fishing_dock |
| evt_coast_16_sea-glass-eye | Sea Glass Eye | random interlude<br>dangerous | Background: coast; Level >= 18; rank D+. | Prompt: A sea-glass eye shows reefs that are not on any chart.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: storm_coast/fishing_dock |
| evt_coast_17_the-widows-dry-boat | The Widow's Dry Boat | random interlude<br>dangerous | Background: coast; Requires luck >= 12 or Rogue class for best branch. | Prompt: A widow's boat returns dry after sinking last year.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: storm_coast/fishing_dock |
| evt_coast_18_kelp-around-the-bedpost | Kelp Around the Bedpost | random interlude<br>dangerous | Background: coast; Requires charisma >= 11 for peaceful branch. | Prompt: Kelp wraps a sailor's bedpost three streets from shore.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: storm_coast/fishing_dock |
| evt_coast_19_moon-tide-duel | Moon-Tide Duel | secret event<br>dangerous | Background: coast; Secret: completedMissionIds includes moonlit-charcoal-kiln. | Prompt: Two tide pools duel by throwing reflections at one another.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: storm_coast/fishing_dock |
| evt_coast_20_the-last-fish-in-the-barrel | The Last Fish in the Barrel | random interlude<br>dangerous | Background: coast; Secret: lineage generation >= 2. | Prompt: The last fish in a barrel begs not to be eaten.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: storm_coast/fishing_dock |

## Swamp Events

| ID | Event | Type / Tone | Eligibility | Scene prompt / Outcome |
| --- | --- | --- | --- | --- |
| evt_swamp_01_lantern-in-black-reeds | Lantern in Black Reeds | random interlude<br>mild | Background: swamp; Requires intelligence >= 12 for safe interpretation. | Prompt: A lantern drifts through black reeds without hand or boat.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: black_mire/reed_path |
| evt_swamp_02_leech-with-a-gold-tooth | Leech with a Gold Tooth | random interlude<br>mild | Background: swamp; Requires infamy >= 5 for intimidation option. | Prompt: A leech smiles with a gold tooth and offers directions.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: black_mire/reed_path |
| evt_swamp_03_bog-body-opens-eyes | Bog Body Opens Eyes | random interlude<br>mild | Background: swamp; One-time unique per heir; cannot repeat after success. | Prompt: A bog body opens its eyes when the heir lies.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: black_mire/reed_path |
| evt_swamp_04_fever-flies-spell-help | Fever-Flies Spell Help | secret event<br>mild | Background: swamp; Secret: level >= 10 and completedMissionIds includes moonlit-charcoal-kiln. | Prompt: Fever-flies swarm into letters spelling help over the water.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: black_mire/reed_path |
| evt_swamp_05_moss-covered-cradle | Moss-Covered Cradle | unique event<br>mild | Background: swamp; Level >= 10; rank E+. | Prompt: A cradle floats by, rocking though empty.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: black_mire/reed_path |
| evt_swamp_06_the-reed-harp | The Reed Harp | random interlude<br>mild | Background: swamp; Requires luck >= 12 or Rogue class for best branch. | Prompt: Wind through reeds plays a song that charms boots off feet.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: black_mire/reed_path |
| evt_swamp_07_mud-prints-ahead | Mud Prints Ahead | random interlude<br>moderate | Background: swamp; Requires charisma >= 11 for peaceful branch. | Prompt: The heir's own footprints appear ahead in fresh mud.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: black_mire/reed_path |
| evt_swamp_08_croaking-jury | Croaking Jury | random interlude<br>moderate | Background: swamp; Secret: completedMissionIds includes pale-antlers-at-thornmere. | Prompt: Frogs gather in a circle and croak like judges.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: black_mire/reed_path |
| evt_swamp_09_heron-carrying-a-knife | Heron Carrying a Knife | secret event<br>moderate | Background: swamp; Secret: lineage generation >= 5. | Prompt: A white heron flies overhead carrying a butcher knife.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: black_mire/reed_path |
| evt_swamp_10_the-sinking-shrine | The Sinking Shrine | unique event<br>moderate | Background: swamp; Requires faith >= 10 or Cleric class. | Prompt: A shrine sinks one inch whenever someone prays falsely.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: black_mire/reed_path |
| evt_swamp_11_blackwater-reflection-missin | Blackwater Reflection Missing | random interlude<br>moderate | Background: swamp; Requires intelligence >= 12 for safe interpretation. | Prompt: The heir's reflection is missing from still blackwater.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: black_mire/reed_path |
| evt_swamp_12_leechwifes-free-cure | Leechwife's Free Cure | random interlude<br>moderate | Background: swamp; Requires infamy >= 5 for intimidation option. | Prompt: A leechwife offers a cure but asks for a memory.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: black_mire/reed_path |
| evt_swamp_13_drowned-road-marker | Drowned Road Marker | random interlude<br>moderate | Background: swamp; One-time unique per heir; cannot repeat after success. | Prompt: A road marker stands knee-deep in water, pointing down.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: black_mire/reed_path |
| evt_swamp_14_bog-oak-baby-rattle | Bog Oak Baby Rattle | secret event<br>moderate | Background: swamp; Secret: level >= 16 and completedMissionIds includes moonlit-charcoal-kiln. | Prompt: A baby rattle made of bog oak rattles by itself.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: black_mire/reed_path |
| evt_swamp_15_the-fog-keeps-receipts | The Fog Keeps Receipts | unique event<br>dangerous | Background: swamp; Level >= 16; rank D+. | Prompt: Fog forms paper receipts for old sins.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: black_mire/reed_path |
| evt_swamp_16_serpent-wearing-prayer-beads | Serpent Wearing Prayer Beads | random interlude<br>dangerous | Background: swamp; Requires luck >= 12 or Rogue class for best branch. | Prompt: A black serpent coils with prayer beads around its neck.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: black_mire/reed_path |
| evt_swamp_17_mire-wedding-procession | Mire Wedding Procession | random interlude<br>dangerous | Background: swamp; Requires charisma >= 11 for peaceful branch. | Prompt: A wedding procession crosses the mire with no footprints.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: black_mire/reed_path |
| evt_swamp_18_reed-witchs-teacup | Reed Witch's Teacup | random interlude<br>dangerous | Background: swamp; Secret: completedMissionIds includes pale-antlers-at-thornmere. | Prompt: A teacup floats by with tea still steaming.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: black_mire/reed_path |
| evt_swamp_19_mosquitoes-avoid-one-corpse | Mosquitoes Avoid One Corpse | secret event<br>dangerous | Background: swamp; Secret: lineage generation >= 3. | Prompt: Mosquitoes avoid one corpse floating face-down.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: black_mire/reed_path |
| evt_swamp_20_the-dry-island | The Dry Island | random interlude<br>dangerous | Background: swamp; Requires faith >= 10 or Cleric class. | Prompt: A dry island appears only when someone gives up hope.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: black_mire/reed_path |

## Road Events

| ID | Event | Type / Tone | Eligibility | Scene prompt / Outcome |
| --- | --- | --- | --- | --- |
| evt_road_01_milestone-with-fresh-blood | Milestone with Fresh Blood | random interlude<br>mild | Background: road; Requires infamy >= 5 for intimidation option. | Prompt: A milestone bleeds from the carved distance number.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: king_road/old_bridge |
| evt_road_02_cart-wheel-turning-alone | Cart Wheel Turning Alone | random interlude<br>mild | Background: road; One-time unique per heir; cannot repeat after success. | Prompt: A broken cart wheel turns beside the road without wind.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: king_road/old_bridge |
| evt_road_03_pilgrim-who-casts-two-shadow | Pilgrim Who Casts Two Shadows | random interlude<br>mild | Background: road; Always eligible in matching background. | Prompt: A pilgrim casts one shadow forward and one back.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: king_road/old_bridge |
| evt_road_04_bandits-polite-toll | Bandit's Polite Toll | secret event<br>mild | Background: road; Secret: level >= 11 and completedMissionIds includes moonlit-charcoal-kiln. | Prompt: A bandit politely asks for a story instead of coin.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: king_road/old_bridge |
| evt_road_05_shoes-facing-west | Shoes Facing West | unique event<br>mild | Background: road; Requires luck >= 12 or Rogue class for best branch. | Prompt: A line of abandoned shoes faces west in perfect order.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: king_road/old_bridge |
| evt_road_06_bridge-that-asks-names | Bridge That Asks Names | random interlude<br>mild | Background: road; Requires charisma >= 11 for peaceful branch. | Prompt: A bridge asks travelers for their names before bearing weight.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: king_road/old_bridge |
| evt_road_07_inn-sign-changed-overnight | Inn Sign Changed Overnight | random interlude<br>moderate | Background: road; Secret: completedMissionIds includes blackwater-ferry-bell. | Prompt: An inn sign changes names while no one looks.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: king_road/old_bridge |
| evt_road_08_crow-on-the-waystone | Crow on the Waystone | random interlude<br>moderate | Background: road; Secret: lineage generation >= 6. | Prompt: A crow on a waystone repeats the heir's last thought.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: king_road/old_bridge |
| evt_road_09_funeral-cart-going-fast | Funeral Cart Going Fast | secret event<br>moderate | Background: road; Secret: level >= 14 and completedMissionIds includes moonlit-charcoal-kiln. | Prompt: A funeral cart races by with no driver and no horse.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: king_road/old_bridge |
| evt_road_10_tollkeeper-counting-fingers | Tollkeeper Counting Fingers | unique event<br>moderate | Background: road; Requires intelligence >= 12 for safe interpretation. | Prompt: A tollkeeper counts fingers, not coins.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: king_road/old_bridge |
| evt_road_11_the-beggars-map-scar | The Beggar's Map Scar | random interlude<br>moderate | Background: road; Requires infamy >= 5 for intimidation option. | Prompt: A beggar reveals a map scarred into his back.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: king_road/old_bridge |
| evt_road_12_roadside-soup-for-the-dead | Roadside Soup for the Dead | random interlude<br>moderate | Background: road; One-time unique per heir; cannot repeat after success. | Prompt: A roadside pot serves soup only to ghosts.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: king_road/old_bridge |
| evt_road_13_royal-couriers-empty-satchel | Royal Courier's Empty Satchel | random interlude<br>moderate | Background: road; Always eligible in matching background. | Prompt: A royal courier arrives with an empty satchel and a slit throat.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: king_road/old_bridge |
| evt_road_14_the-same-tree-again | The Same Tree Again | secret event<br>moderate | Background: road; Secret: level >= 17 and completedMissionIds includes moonlit-charcoal-kiln. | Prompt: The same lightning-struck tree appears after every bend.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: king_road/old_bridge |
| evt_road_15_horse-refuses-a-shadow | Horse Refuses a Shadow | unique event<br>dangerous | Background: road; Requires luck >= 12 or Rogue class for best branch. | Prompt: A horse refuses to step into one patch of road-shadow.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: king_road/old_bridge |
| evt_road_16_the-milestone-counts-down | The Milestone Counts Down | random interlude<br>dangerous | Background: road; Requires charisma >= 11 for peaceful branch. | Prompt: Every mile marker counts down toward the heir's family estate.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: king_road/old_bridge |
| evt_road_17_dust-devil-with-a-voice | Dust Devil with a Voice | random interlude<br>dangerous | Background: road; Secret: completedMissionIds includes blackwater-ferry-bell. | Prompt: A dust devil asks which heir died last.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: king_road/old_bridge |
| evt_road_18_three-roads-two-choices | Three Roads, Two Choices | random interlude<br>dangerous | Background: road; Secret: lineage generation >= 4. | Prompt: The road forks into three paths, but only two have shadows.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: king_road/old_bridge |
| evt_road_19_lantern-cart-at-dawn | Lantern Cart at Dawn | secret event<br>dangerous | Background: road; Secret: level >= 20 and completedMissionIds includes moonlit-charcoal-kiln. | Prompt: A lantern cart rolls by at dawn, though lantern carts run at night.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: king_road/old_bridge |
| evt_road_20_puddle-reflects-a-battlefiel | Puddle Reflects a Battlefield | random interlude<br>dangerous | Background: road; Requires intelligence >= 12 for safe interpretation. | Prompt: A puddle reflects a battlefield instead of the sky.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: king_road/old_bridge |

## Ruins Events

| ID | Event | Type / Tone | Eligibility | Scene prompt / Outcome |
| --- | --- | --- | --- | --- |
| evt_ruins_01_statue-missing-its-apology | Statue Missing Its Apology | random interlude<br>mild | Background: ruins; One-time unique per heir; cannot repeat after success. | Prompt: A statue has its mouth chiseled away and still tries to apologize.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: fallen_tower/old_keep |
| evt_ruins_02_fountain-running-with-dust | Fountain Running with Dust | random interlude<br>mild | Background: ruins; Always eligible in matching background. | Prompt: A fountain sprays dust in perfect arcs.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: fallen_tower/old_keep |
| evt_ruins_03_doorframe-without-wall | Doorframe Without Wall | random interlude<br>mild | Background: ruins; Level >= 9; rank E+. | Prompt: A doorframe stands alone and opens into a furnished room.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: fallen_tower/old_keep |
| evt_ruins_04_mosaic-eye-follows-heir | Mosaic Eye Follows Heir | secret event<br>mild | Background: ruins; Secret: level >= 12 and completedMissionIds includes moonlit-charcoal-kiln. | Prompt: One mosaic eye follows the heir between broken rooms.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: fallen_tower/old_keep |
| evt_ruins_05_banner-that-remembers-wind | Banner That Remembers Wind | unique event<br>mild | Background: ruins; Requires charisma >= 11 for peaceful branch. | Prompt: A torn banner snaps in a wind that died centuries ago.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: fallen_tower/old_keep |
| evt_ruins_06_crown-rust-in-a-cradle | Crown Rust in a Cradle | random interlude<br>mild | Background: ruins; Secret: completedMissionIds includes lost-goat-at-briar-ford. | Prompt: Rust shaped like a crown fills a stone cradle.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: fallen_tower/old_keep |
| evt_ruins_07_broken-sundial-at-midnight | Broken Sundial at Midnight | random interlude<br>moderate | Background: ruins; Secret: lineage generation >= 7. | Prompt: A broken sundial casts a shadow at midnight.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: fallen_tower/old_keep |
| evt_ruins_08_the-librarians-ashes | The Librarian's Ashes | random interlude<br>moderate | Background: ruins; Requires faith >= 10 or Cleric class. | Prompt: Ashes in a jar correct the heir's pronunciation.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: fallen_tower/old_keep |
| evt_ruins_09_steps-descending-upward | Steps Descending Upward | secret event<br>moderate | Background: ruins; Secret: level >= 15 and completedMissionIds includes moonlit-charcoal-kiln. | Prompt: A stairway descends upward when viewed from the side.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: fallen_tower/old_keep |
| evt_ruins_10_table-set-for-dead-kings | Table Set for Dead Kings | unique event<br>moderate | Background: ruins; Requires infamy >= 5 for intimidation option. | Prompt: A banquet table is set for kings whose names are scratched out.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: fallen_tower/old_keep |
| evt_ruins_11_painted-door-bleeding-paint | Painted Door Bleeding Paint | random interlude<br>moderate | Background: ruins; One-time unique per heir; cannot repeat after success. | Prompt: A painted door leaks wet paint like blood.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: fallen_tower/old_keep |
| evt_ruins_12_the-architects-final-nail | The Architect's Final Nail | random interlude<br>moderate | Background: ruins; Always eligible in matching background. | Prompt: A golden nail holds an entire wall upright.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: fallen_tower/old_keep |
| evt_ruins_13_mourner-in-a-window | Mourner in a Window | random interlude<br>moderate | Background: ruins; Level >= 18; rank D+. | Prompt: A mourner appears in every intact window, always facing away.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: fallen_tower/old_keep |
| evt_ruins_14_coin-minted-tomorrow | Coin Minted Tomorrow | secret event<br>moderate | Background: ruins; Secret: level >= 18 and completedMissionIds includes moonlit-charcoal-kiln. | Prompt: A coin minted next year lies under rubble.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: fallen_tower/old_keep |
| evt_ruins_15_the-law-that-bites | The Law That Bites | unique event<br>dangerous | Background: ruins; Requires charisma >= 11 for peaceful branch. | Prompt: A stone law-tablet bites anyone who reads it aloud.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: fallen_tower/old_keep |
| evt_ruins_16_royal-cradle-song | Royal Cradle Song | random interlude<br>dangerous | Background: ruins; Secret: completedMissionIds includes lost-goat-at-briar-ford. | Prompt: A cradle song hums from the collapsed nursery.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: fallen_tower/old_keep |
| evt_ruins_17_guard-statue-asks-password | Guard Statue Asks Password | random interlude<br>dangerous | Background: ruins; Secret: lineage generation >= 5. | Prompt: A guard statue asks for a password outlawed generations ago.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: fallen_tower/old_keep |
| evt_ruins_18_the-map-room-flooded-with-st | The Map Room Flooded with Stars | random interlude<br>dangerous | Background: ruins; Requires faith >= 10 or Cleric class. | Prompt: A map room is flooded with reflected stars though roofless at noon.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: fallen_tower/old_keep |
| evt_ruins_19_throne-without-a-seat | Throne Without a Seat | secret event<br>dangerous | Background: ruins; Secret: level >= 21 and completedMissionIds includes moonlit-charcoal-kiln. | Prompt: A throne has arms, back, and crown, but no place to sit.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: fallen_tower/old_keep |
| evt_ruins_20_bell-tower-below-ground | Bell Tower Below Ground | random interlude<br>dangerous | Background: ruins; Requires infamy >= 5 for intimidation option. | Prompt: A buried bell tower rings whenever someone steps over it.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: fallen_tower/old_keep |

## Crypt Events

| ID | Event | Type / Tone | Eligibility | Scene prompt / Outcome |
| --- | --- | --- | --- | --- |
| evt_crypt_01_grave-moth-halo | Grave-Moth Halo | random interlude<br>mild | Background: crypt; Always eligible in matching background. | Prompt: Grave-moths form a halo over one unmarked grave.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: chapel_crypt/bone_vault |
| evt_crypt_02_bone-dice-in-the-offering-bo | Bone Dice in the Offering Bowl | random interlude<br>mild | Background: crypt; Level >= 10; rank E+. | Prompt: Bone dice roll in the offering bowl and show a skull.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: chapel_crypt/bone_vault |
| evt_crypt_03_ancestor-coughs-in-the-wall | Ancestor Coughs in the Wall | random interlude<br>mild | Background: crypt; Requires luck >= 12 or Rogue class for best branch. | Prompt: An ancestor coughs politely from inside the wall.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: chapel_crypt/bone_vault |
| evt_crypt_04_fresh-flowers-on-old-dust | Fresh Flowers on Old Dust | secret event<br>mild | Background: crypt; Secret: level >= 13 and completedMissionIds includes moonlit-charcoal-kiln. | Prompt: Fresh flowers lie on dust no living foot has disturbed.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: chapel_crypt/bone_vault |
| evt_crypt_05_coffin-nail-warm-to-touch | Coffin Nail Warm to Touch | unique event<br>mild | Background: crypt; Secret: completedMissionIds includes misty-on-the-mill-roof. | Prompt: One coffin nail is warm and beats like a pulse.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: chapel_crypt/bone_vault |
| evt_crypt_06_ossuary-choir-tuning | Ossuary Choir Tuning | random interlude<br>mild | Background: crypt; Secret: lineage generation >= 2. | Prompt: Skulls hum scales before anyone enters the ossuary.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: chapel_crypt/bone_vault |
| evt_crypt_07_the-wrong-epitaph | The Wrong Epitaph | random interlude<br>moderate | Background: crypt; Requires faith >= 10 or Cleric class. | Prompt: A grave bears the heir's name with tomorrow's date.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: chapel_crypt/bone_vault |
| evt_crypt_08_bell-rope-made-of-hair | Bell Rope Made of Hair | random interlude<br>moderate | Background: crypt; Requires intelligence >= 12 for safe interpretation. | Prompt: The crypt bell rope is braided from hair matching the heir's family.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: chapel_crypt/bone_vault |
| evt_crypt_09_mourner-without-a-face | Mourner Without a Face | secret event<br>moderate | Background: crypt; Secret: level >= 16 and completedMissionIds includes moonlit-charcoal-kiln. | Prompt: A faceless mourner kneels where no burial is scheduled.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: chapel_crypt/bone_vault |
| evt_crypt_10_wax-saint-weeping-gold | Wax Saint Weeping Gold | unique event<br>moderate | Background: crypt; One-time unique per heir; cannot repeat after success. | Prompt: A wax saint weeps gold that hardens into teeth.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: chapel_crypt/bone_vault |
| evt_crypt_11_the-coffin-that-apologizes | The Coffin That Apologizes | random interlude<br>moderate | Background: crypt; Always eligible in matching background. | Prompt: A coffin apologizes for what is inside.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: chapel_crypt/bone_vault |
| evt_crypt_12_prayer-book-chews-pages | Prayer Book Chews Pages | random interlude<br>moderate | Background: crypt; Level >= 19; rank D+. | Prompt: A prayer book chews its own pages when opened.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: chapel_crypt/bone_vault |
| evt_crypt_13_black-candle-white-flame | Black Candle, White Flame | random interlude<br>moderate | Background: crypt; Requires luck >= 12 or Rogue class for best branch. | Prompt: A black candle burns with a white flame and casts no light.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: chapel_crypt/bone_vault |
| evt_crypt_14_the-ossuary-keyhole | The Ossuary Keyhole | secret event<br>moderate | Background: crypt; Secret: level >= 19 and completedMissionIds includes moonlit-charcoal-kiln. | Prompt: A keyhole appears in a skull's forehead.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: chapel_crypt/bone_vault |
| evt_crypt_15_dead-childs-chalk-game | Dead Child's Chalk Game | unique event<br>dangerous | Background: crypt; Secret: completedMissionIds includes misty-on-the-mill-roof. | Prompt: A chalk game on the floor changes rules between turns.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: chapel_crypt/bone_vault |
| evt_crypt_16_sarcophagus-breathes-perfume | Sarcophagus Breathes Perfume | random interlude<br>dangerous | Background: crypt; Secret: lineage generation >= 6. | Prompt: A sarcophagus breathes perfume and rot in alternating sighs.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: chapel_crypt/bone_vault |
| evt_crypt_17_the-family-niche-opens | The Family Niche Opens | random interlude<br>dangerous | Background: crypt; Requires faith >= 10 or Cleric class. | Prompt: A sealed family niche opens when the heir speaks their surname.<br>Outcome: Class/stat branch changes reward into gold, item, blessing, or wound.<br>Scene: chapel_crypt/bone_vault |
| evt_crypt_18_marble-angel-drops-feather | Marble Angel Drops Feather | random interlude<br>dangerous | Background: crypt; Requires intelligence >= 12 for safe interpretation. | Prompt: A marble angel drops a real feather into the dust.<br>Outcome: Gain small gold or morale; risky branch can cost HP.<br>Scene: chapel_crypt/bone_vault |
| evt_crypt_19_mourning-veil-in-the-drain | Mourning Veil in the Drain | secret event<br>dangerous | Background: crypt; Secret: level >= 22 and completedMissionIds includes moonlit-charcoal-kiln. | Prompt: A black veil crawls from the drainage channel.<br>Outcome: May grant a temporary heir effect; bad read adds a curse.<br>Scene: chapel_crypt/bone_vault |
| evt_crypt_20_last-will-in-bone-script | Last Will in Bone Script | random interlude<br>dangerous | Background: crypt; One-time unique per heir; cannot repeat after success. | Prompt: A last will is written in bone script across the ceiling.<br>Outcome: Can grant bankable trinket; dangerous branch risks death at low HP.<br>Scene: chapel_crypt/bone_vault |

# Part II — Tavern Board Mission Contracts

There are 108 contracts. Every contract contains 10 fixed lore events; random/secret interludes should be inserted only when setting and condition filters pass.

## Rank F Mission Index

| Mission ID | Name | Setting | Arc | Min Lv | Board eligibility |
| --- | --- | --- | --- | --- | --- |
| mis_misty-on-the-mill-roof | Misty on the Mill-Roof | town | rescue | 1 | Rank F+; level >= 1; background: town. |
| mis_the-bakers-missing-yeast | The Baker's Missing Yeast | town | retrieve | 1 | Rank F+; level >= 1; background: town. |
| mis_rats-under-the-rain-barrel | Rats Under the Rain-Barrel | town | hunt | 1 | Rank F+; level >= 1; background: town. |
| mis_orchard-scarecrow-with-human-teeth | Orchard Scarecrow with Human Teeth | forest | investigate | 1 | Rank F+; level >= 1; background: forest. |
| mis_signpost-turned-backwards | Signpost Turned Backwards | road | investigate | 1 | Rank F+; level >= 1; background: road. |
| mis_the-lantern-boys-errand | The Lantern Boy's Errand | town | escort | 1 | Rank F+; level >= 1; background: town. |
| mis_crows-in-the-chapel-yard | Crows in the Chapel Yard | crypt | exorcise | 1 | Rank F+; level >= 1; background: crypt. |
| mis_the-fishers-blue-net | The Fisher's Blue Net | coast | retrieve | 1 | Rank F+; level >= 1; background: coast. |
| mis_lost-goat-at-briar-ford | Lost Goat at Briar Ford | forest | rescue | 1 | Rank F+; level >= 1; background: forest. |
| mis_the-debt-ledger-of-old-bram | The Debt Ledger of Old Bram | town | investigate | 1 | Rank F+; level >= 1; background: town. Secret: Hidden variant if completedMissionIds includes misty-on-the-mill-roof and charisma >= 11. |
| mis_the-sleepy-watchmans-bell | The Sleepy Watchman's Bell | town | defend | 1 | Rank F+; level >= 1; background: town. |
| mis_mushroom-ring-in-widow-vale | Mushroom Ring in Widow Vale | forest | retrieve | 1 | Rank F+; level >= 1; background: forest. |

## Rank E Mission Index

| Mission ID | Name | Setting | Arc | Min Lv | Board eligibility |
| --- | --- | --- | --- | --- | --- |
| mis_hounds-at-ashbridge | Hounds at Ashbridge | road | hunt | 3 | Rank E+; level >= 3; background: road. |
| mis_the-taxmans-empty-cart | The Taxman's Empty Cart | road | retrieve | 3 | Rank E+; level >= 3; background: road. |
| mis_salt-on-the-stable-door | Salt on the Stable Door | town | exorcise | 3 | Rank E+; level >= 3; background: town. |
| mis_the-hollow-beneath-beekeeper-hill | The Hollow Beneath Beekeeper Hill | cave | rescue | 3 | Rank E+; level >= 3; background: cave. |
| mis_blackwater-ferry-bell | Blackwater Ferry Bell | coast | exorcise | 3 | Rank E+; level >= 3; background: coast. |
| mis_pig-iron-idol-in-mine-shaft-six | Pig-Iron Idol in Mine Shaft Six | cave | retrieve | 3 | Rank E+; level >= 3; background: cave. |
| mis_the-groom-who-never-arrived | The Groom Who Never Arrived | town | investigate | 3 | Rank E+; level >= 3; background: town. |
| mis_candle-smoke-in-bracken-chapel | Candle Smoke in Bracken Chapel | crypt | exorcise | 3 | Rank E+; level >= 3; background: crypt. |
| mis_the-foxs-stolen-crown | The Fox's Stolen Crown | forest | retrieve | 3 | Rank E+; level >= 3; background: forest. |
| mis_a-well-that-answers-back | A Well That Answers Back | town | investigate | 3 | Rank E+; level >= 3; background: town. |
| mis_feathers-over-gallows-road | Feathers over Gallows Road | road | defend | 3 | Rank E+; level >= 3; background: road. |
| mis_the-millers-second-shadow | The Miller's Second Shadow | town | investigate | 3 | Rank E+; level >= 3; background: town. |

## Rank D Mission Index

| Mission ID | Name | Setting | Arc | Min Lv | Board eligibility |
| --- | --- | --- | --- | --- | --- |
| mis_pale-antlers-at-thornmere | Pale Antlers at Thornmere | forest | hunt | 6 | Rank D+; level >= 6; background: forest. |
| mis_the-copper-vein-that-sang | The Copper Vein That Sang | cave | investigate | 6 | Rank D+; level >= 6; background: cave. |
| mis_tide-teeth-in-the-fishmarket | Tide Teeth in the Fishmarket | coast | hunt | 6 | Rank D+; level >= 6; background: coast. |
| mis_the-pilgrims-stolen-saint | The Pilgrim's Stolen Saint | road | retrieve | 6 | Rank D+; level >= 6; background: road. |
| mis_grave-moth-brood | Grave-Moth Brood | crypt | hunt | 6 | Rank D+; level >= 6; background: crypt. |
| mis_the-squire-in-the-fallen-tower | The Squire in the Fallen Tower | ruins | rescue | 6 | Rank D+; level >= 6; background: ruins. |
| mis_saffron-fever-at-reedbank | Saffron Fever at Reedbank | swamp | investigate | 6 | Rank D+; level >= 6; background: swamp. |
| mis_the-knife-behind-the-guild-seal | The Knife Behind the Guild Seal | town | investigate | 6 | Rank D+; level >= 6; background: town. |
| mis_moonlit-charcoal-kiln | Moonlit Charcoal Kiln | forest | exorcise | 6 | Rank D+; level >= 6; background: forest. |
| mis_broken-milestone-bleeding-road | Broken Milestone, Bleeding Road | road | seal | 6 | Rank D+; level >= 6; background: road. Secret: Requires completed Signpost Turned Backwards and lineage generation >= 2. |
| mis_the-miners-bread-oven | The Miner's Bread-Oven | cave | rescue | 6 | Rank D+; level >= 6; background: cave. |
| mis_three-bells-beneath-low-tide | Three Bells Beneath Low Tide | coast | investigate | 6 | Rank D+; level >= 6; background: coast. |

## Rank C Mission Index

| Mission ID | Name | Setting | Arc | Min Lv | Board eligibility |
| --- | --- | --- | --- | --- | --- |
| mis_the-barons-hollow-feast | The Baron's Hollow Feast | town | investigate | 10 | Rank C+; level >= 10; background: town. |
| mis_bones-in-the-orchard-wall | Bones in the Orchard Wall | forest | exorcise | 10 | Rank C+; level >= 10; background: forest. |
| mis_lanterns-in-the-bat-cave | Lanterns in the Bat Cave | cave | delve | 10 | Rank C+; level >= 10; background: cave. |
| mis_the-snow-brides-procession | The Snow Bride's Procession | mountain | escort | 10 | Rank C+; level >= 10; background: mountain. |
| mis_smugglers-of-the-salted-dead | Smugglers of the Salted Dead | coast | sabotage | 10 | Rank C+; level >= 10; background: coast. |
| mis_the-reed-witchs-dowry | The Reed Witch's Dowry | swamp | negotiate | 10 | Rank C+; level >= 10; background: swamp. |
| mis_the-old-keeps-missing-stair | The Old Keep's Missing Stair | ruins | retrieve | 10 | Rank C+; level >= 10; background: ruins. |
| mis_the-prisoner-with-no-name | The Prisoner with No Name | dungeon | rescue | 10 | Rank C+; level >= 10; background: dungeon. |
| mis_the-road-that-collects-shoes | The Road That Collects Shoes | road | investigate | 10 | Rank C+; level >= 10; background: road. |
| mis_underchapel-of-the-ninth-bell | Underchapel of the Ninth Bell | crypt | delve | 10 | Rank C+; level >= 10; background: crypt. Secret: Requires Crows in the Chapel Yard or Candle Smoke in Bracken Chapel. |
| mis_the-laughing-quarry | The Laughing Quarry | mountain | hunt | 10 | Rank C+; level >= 10; background: mountain. |
| mis_ink-plague-in-the-clerkhouse | Ink Plague in the Clerkhouse | town | seal | 10 | Rank C+; level >= 10; background: town. |

## Rank B Mission Index

| Mission ID | Name | Setting | Arc | Min Lv | Board eligibility |
| --- | --- | --- | --- | --- | --- |
| mis_the-ash-wolf-of-crowfen | The Ash-Wolf of Crowfen | swamp | hunt | 15 | Rank B+; level >= 15; background: swamp. |
| mis_trial-of-the-glass-abbey | Trial of the Glass Abbey | mountain | pilgrimage | 15 | Rank B+; level >= 15; background: mountain. |
| mis_the-sunken-scriptorium | The Sunken Scriptorium | ruins | delve | 15 | Rank B+; level >= 15; background: ruins. |
| mis_the-chain-saints-cell | The Chain Saint's Cell | dungeon | exorcise | 15 | Rank B+; level >= 15; background: dungeon. |
| mis_the-eel-queens-tribute | The Eel Queen's Tribute | coast | negotiate | 15 | Rank B+; level >= 15; background: coast. |
| mis_a-crown-in-the-charcoal-wood | A Crown in the Charcoal Wood | forest | retrieve | 15 | Rank B+; level >= 15; background: forest. |
| mis_the-hollow-dukes-hunt | The Hollow Duke's Hunt | road | defend | 15 | Rank B+; level >= 15; background: road. |
| mis_red-rain-over-the-market | Red Rain over the Market | town | seal | 15 | Rank B+; level >= 15; background: town. |
| mis_the-mine-that-remembers-names | The Mine That Remembers Names | cave | rescue | 15 | Rank B+; level >= 15; background: cave. |
| mis_tomb-of-the-unmarried-king | Tomb of the Unmarried King | crypt | delve | 15 | Rank B+; level >= 15; background: crypt. Secret: Requires infamy <= 3 or a Cleric heir. |
| mis_the-bridge-masons-pact | The Bridge Mason's Pact | road | negotiate | 15 | Rank B+; level >= 15; background: road. |
| mis_the-raven-tax | The Raven Tax | forest | sabotage | 15 | Rank B+; level >= 15; background: forest. |

## Rank A Mission Index

| Mission ID | Name | Setting | Arc | Min Lv | Board eligibility |
| --- | --- | --- | --- | --- | --- |
| mis_cathedral-of-the-white-root | Cathedral of the White Root | forest | delve | 22 | Rank A+; level >= 22; background: forest. |
| mis_the-iron-moon-below | The Iron Moon Below | cave | delve | 22 | Rank A+; level >= 22; background: cave. |
| mis_stormwake-lighthouse | Stormwake Lighthouse | coast | defend | 22 | Rank A+; level >= 22; background: coast. |
| mis_the-emperors-broken-road | The Emperor's Broken Road | road | escort | 22 | Rank A+; level >= 22; background: road. |
| mis_the-seven-faced-marshal | The Seven-Faced Marshal | town | investigate | 22 | Rank A+; level >= 22; background: town. |
| mis_the-ogre-nun-of-winterpass | The Ogre Nun of Winterpass | mountain | negotiate | 22 | Rank A+; level >= 22; background: mountain. |
| mis_the-leech-palace | The Leech Palace | swamp | delve | 22 | Rank A+; level >= 22; background: swamp. |
| mis_vault-of-borrowed-years | Vault of Borrowed Years | dungeon | retrieve | 22 | Rank A+; level >= 22; background: dungeon. |
| mis_the-lion-gate-without-a-wall | The Lion Gate Without a Wall | ruins | seal | 22 | Rank A+; level >= 22; background: ruins. |
| mis_reliquary-of-the-hungry-choir | Reliquary of the Hungry Choir | crypt | exorcise | 22 | Rank A+; level >= 22; background: crypt. |
| mis_the-vulture-parliament | The Vulture Parliament | mountain | negotiate | 22 | Rank A+; level >= 22; background: mountain. |
| mis_the-guildmasters-black-warrant | The Guildmaster's Black Warrant | town | sabotage | 22 | Rank A+; level >= 22; background: town. |

## Rank S Mission Index

| Mission ID | Name | Setting | Arc | Min Lv | Board eligibility |
| --- | --- | --- | --- | --- | --- |
| mis_the-starving-bell-tower | The Starving Bell-Tower | town | seal | 30 | Rank S+; level >= 30; background: town. |
| mis_wyrm-eggs-in-the-old-mine | Wyrm-Eggs in the Old Mine | cave | hunt | 30 | Rank S+; level >= 30; background: cave. |
| mis_the-forest-that-walks-north | The Forest That Walks North | forest | defend | 30 | Rank S+; level >= 30; background: forest. |
| mis_pilgrimage-to-the-knife-peak | Pilgrimage to the Knife Peak | mountain | pilgrimage | 30 | Rank S+; level >= 30; background: mountain. |
| mis_the-drowned-armadas-admiral | The Drowned Armada's Admiral | coast | negotiate | 30 | Rank S+; level >= 30; background: coast. |
| mis_the-black-fen-coronation | The Black Fen Coronation | swamp | sabotage | 30 | Rank S+; level >= 30; background: swamp. |
| mis_the-road-of-one-thousand-graves | The Road of One Thousand Graves | road | escort | 30 | Rank S+; level >= 30; background: road. |
| mis_dungeon-of-the-unmade-heir | Dungeon of the Unmade Heir | dungeon | delve | 30 | Rank S+; level >= 30; background: dungeon. Secret: Requires lineage generation >= 5. |
| mis_the-sunless-senate | The Sunless Senate | ruins | investigate | 30 | Rank S+; level >= 30; background: ruins. |
| mis_ossuary-engine-of-saint-vare | Ossuary Engine of Saint Vare | crypt | seal | 30 | Rank S+; level >= 30; background: crypt. Secret: Requires Reliquary of the Hungry Choir completed. |
| mis_the-thorn-crown-awakens | The Thorn Crown Awakens | forest | retrieve | 30 | Rank S+; level >= 30; background: forest. |
| mis_the-mirror-siege | The Mirror Siege | town | defend | 30 | Rank S+; level >= 30; background: town. |

## Rank SS Mission Index

| Mission ID | Name | Setting | Arc | Min Lv | Board eligibility |
| --- | --- | --- | --- | --- | --- |
| mis_the-mountain-that-knelt | The Mountain That Knelt | mountain | seal | 40 | Rank SS+; level >= 40; background: mountain. |
| mis_library-of-last-breaths | Library of Last Breaths | ruins | retrieve | 40 | Rank SS+; level >= 40; background: ruins. |
| mis_the-leviathans-court | The Leviathan's Court | coast | negotiate | 40 | Rank SS+; level >= 40; background: coast. |
| mis_the-ninth-dungeon-door | The Ninth Dungeon Door | dungeon | delve | 40 | Rank SS+; level >= 40; background: dungeon. |
| mis_the-cursed-orchard-of-first-graves | The Cursed Orchard of First Graves | forest | exorcise | 40 | Rank SS+; level >= 40; background: forest. |
| mis_city-beneath-the-market-well | City Beneath the Market Well | town | delve | 40 | Rank SS+; level >= 40; background: town. |
| mis_the-mire-that-married-death | The Mire That Married Death | swamp | seal | 40 | Rank SS+; level >= 40; background: swamp. |
| mis_the-funeral-road-reversed | The Funeral Road Reversed | road | investigate | 40 | Rank SS+; level >= 40; background: road. |
| mis_the-king-in-the-coal-seam | The King in the Coal Seam | cave | rescue | 40 | Rank SS+; level >= 40; background: cave. |
| mis_the-crypt-of-borrowed-blood | The Crypt of Borrowed Blood | crypt | retrieve | 40 | Rank SS+; level >= 40; background: crypt. Secret: Requires at least 10 dead heirs in the lineage chronicle. |
| mis_the-parliament-of-broken-statues | The Parliament of Broken Statues | ruins | negotiate | 40 | Rank SS+; level >= 40; background: ruins. |
| mis_the-glaciers-confession | The Glacier's Confession | mountain | pilgrimage | 40 | Rank SS+; level >= 40; background: mountain. |

## Rank SSS Mission Index

| Mission ID | Name | Setting | Arc | Min Lv | Board eligibility |
| --- | --- | --- | --- | --- | --- |
| mis_the-bloodlines-first-debt | The Bloodline's First Debt | town | investigate | 55 | Rank SSS+; level >= 55; background: town. |
| mis_the-heir-who-refused-death | The Heir Who Refused Death | crypt | exorcise | 55 | Rank SSS+; level >= 55; background: crypt. |
| mis_the-crown-beneath-all-roots | The Crown Beneath All Roots | forest | retrieve | 55 | Rank SSS+; level >= 55; background: forest. |
| mis_the-world-wound-under-irondeep | The World-Wound Under Irondeep | cave | seal | 55 | Rank SSS+; level >= 55; background: cave. |
| mis_the-last-road-to-no-dawn | The Last Road to No Dawn | road | escort | 55 | Rank SSS+; level >= 55; background: road. |
| mis_the-palace-of-salt-and-teeth | The Palace of Salt and Teeth | coast | delve | 55 | Rank SSS+; level >= 55; background: coast. |
| mis_the-mountains-hidden-name | The Mountain's Hidden Name | mountain | pilgrimage | 55 | Rank SSS+; level >= 55; background: mountain. |
| mis_the-dungeon-that-dreams-heirs | The Dungeon That Dreams Heirs | dungeon | sabotage | 55 | Rank SSS+; level >= 55; background: dungeon. |
| mis_the-ruin-of-tomorrows-capital | The Ruin of Tomorrow's Capital | ruins | investigate | 55 | Rank SSS+; level >= 55; background: ruins. |
| mis_the-swamp-where-gods-are-buried | The Swamp Where Gods Are Buried | swamp | seal | 55 | Rank SSS+; level >= 55; background: swamp. |
| mis_the-black-chronicle-page | The Black Chronicle Page | crypt | retrieve | 55 | Rank SSS+; level >= 55; background: crypt. |
| mis_the-average-ending | The Average Ending | town | defend | 55 | Rank SSS+; level >= 55; background: town. Secret: Requires all SSS contracts except this one completed once across the lineage. |

# Part III — Mission Fixed Event Spines

Each mission spine is intentionally compact: a developer can map every numbered beat to a fixed mission event object with beatType, prose, server checks, and outcomes.

## Rank F Contracts

### mis_misty-on-the-mill-roof — Misty on the Mill-Roof

Rank F | Difficulty: easy | Min level: 1 | Setting: town | Tone: mild | Arc: rescue | Scene: town_market/tavern_street

Client: sister Elowen | Focus: Misty, the widow's soot-gray cat | Main threat: rats fat on gravewax | Lore turn: payment is partly cursed unless purified before banking

Eligibility: Rank F+; level >= 1; background: town. Reward: 57 gold, 10 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Frantic Posting | social | sister Elowen begs the heir to recover Misty, the widow's soot-gray cat; delay lowers the rescue reward. |
| 2 | Last Sighting | discovery | A child, track, or dropped token places the missing soul at the edge of the town scene. |
| 3 | False Trail | hazard | A tempting trail wastes supplies unless the heir passes luck or intelligence. |
| 4 | Quiet Call | social | The heir hears a weak answer, but rats fat on gravewax answer from another direction. |
| 5 | Blocked Reach | hazard | Stone, thorns, tide, or locked iron blocks the path and demands a class-flavored solution. |
| 6 | The Captor's Reason | discovery | The mission turns when the heir learns payment is partly cursed unless purified before banking. |
| 7 | Breath and Panic | choice | The rescued target panics; charisma, faith, or a gentle item can prevent injury. |
| 8 | Carry or Clear | hazard | The heir chooses to carry the rescued target slowly or clear danger first. |
| 9 | Breakout | combat | The last obstacle attacks during escape; losing may kill the heir or the target. |
| 10 | Returned Alive | reward | sister Elowen pays through tears, and the line gains rank XP for saving Misty, the widow's soot-gray cat. |

### mis_the-bakers-missing-yeast — The Baker's Missing Yeast

Rank F | Difficulty: easy | Min level: 1 | Setting: town | Tone: mild | Arc: retrieve | Scene: town_market/tavern_street

Client: guild clerk Ren | Focus: a warm jar of old starter that never spoils | Main threat: well-water omens | Lore turn: the final clue only appears after dusk

Eligibility: Rank F+; level >= 1; background: town. Reward: 64 gold, 11 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Written Claim | social | guild clerk Ren claims a warm jar of old starter that never spoils must be recovered before rival hands reach it. |
| 2 | Owner's Mark | discovery | The heir identifies the object's mark and one unsettling sign of well-water omens nearby. |
| 3 | Price of Entry | hazard | A guard, lock, tide, or curse demands supplies, gold, or a stat check. |
| 4 | Competing Hand | social | A second claimant offers coin to walk away from the contract. |
| 5 | Container Trap | hazard | The object's case is trapped; rogues, mages, and clerics each see different warnings. |
| 6 | True Provenance | discovery | A hidden inscription reveals the final clue only appears after dusk. |
| 7 | Weight of the Thing | choice | Carrying a warm jar of old starter that never spoils burdens the heir: speed, stealth, or morale must be sacrificed. |
| 8 | The Pursuit | combat | well-water omens pursue the recovered object through the town scene. |
| 9 | Clean Hands | social | The heir decides whether to reveal the truth, hide it, or mark the client as suspect. |
| 10 | Sealed Receipt | reward | The guild issues pay and rank XP; the item may also unlock a later secret event. |

### mis_rats-under-the-rain-barrel — Rats Under the Rain-Barrel

Rank F | Difficulty: easy | Min level: 1 | Setting: town | Tone: mild | Arc: hunt | Scene: town_market/tavern_street

Client: widow Mara | Focus: a nest of rain-barrel rats carrying blue wax | Main threat: knife-gang watchers | Lore turn: a rival heir already failed here and left a warning mark

Eligibility: Rank F+; level >= 1; background: town. Reward: 71 gold, 11 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Kill Writ | social | widow Mara posts a hunt for a nest of rain-barrel rats carrying blue wax; the writ warns that knife-gang watchers have learned human habits. |
| 2 | Track Bed | discovery | The heir finds tracks that do not match the creature's supposed shape. |
| 3 | Bait Decision | choice | Use bought bait, personal blood, or a risky decoy to draw the quarry. |
| 4 | Hunter Becomes Hunted | hazard | The quarry circles behind the heir, costing supplies or morale. |
| 5 | Victim Remnant | discovery | A survivor, bone, or torn charm reveals a rival heir already failed here and left a warning mark. |
| 6 | Lair Threshold | hazard | The lair terrain favors the quarry and demands a class or stat response. |
| 7 | First Clash | combat | The heir wounds the target but learns it has a second form or hidden ally. |
| 8 | Mercy Window | choice | A chance appears to spare, bind, or finish the target for different consequences. |
| 9 | Blood Price | combat | The final hunt resolves; failure can kill the heir outright. |
| 10 | Trophy and Doubt | reward | The trophy earns rank XP, but the chronicle notes whether the kill was just. |

### mis_orchard-scarecrow-with-human-teeth — Orchard Scarecrow with Human Teeth

Rank F | Difficulty: easy | Min level: 1 | Setting: forest | Tone: mild | Arc: investigate | Scene: forest_briar/moonlit_wood

Client: old poacher Venn | Focus: a scarecrow grinning with stolen dentures | Main threat: poacher snares | Lore turn: the safest route would abandon someone helpless

Eligibility: Rank F+; level >= 1; background: forest. Reward: 78 gold, 12 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Thin Notice | social | The board notice says little; old poacher Venn fears the truth around a scarecrow grinning with stolen dentures more than the cost. |
| 2 | Interview One | social | The first witness lies badly, revealing pressure from poacher snares. |
| 3 | Physical Clue | discovery | A mark, smell, or damaged object anchors the mystery in the forest scene. |
| 4 | Contradiction | discovery | The heir finds evidence that makes the client's version impossible. |
| 5 | Street or Trail Pressure | hazard | Someone tries to scare the heir away with poison, ambush, or public shame. |
| 6 | Old Record | discovery | A ledger, gravestone, map, or hymn reveals the safest route would abandon someone helpless. |
| 7 | Accusation | social | The heir can accuse openly, bait a confession, or keep silent for more evidence. |
| 8 | Proof Under Fire | combat | The culprit or curse lashes out when proof is taken. |
| 9 | Judgment Call | choice | The heir chooses guild law, local mercy, or profitable blackmail. |
| 10 | Filed Truth | reward | The completed report grants pay, rank XP, and possible infamy shift. |

### mis_signpost-turned-backwards — Signpost Turned Backwards

Rank F | Difficulty: easy | Min level: 1 | Setting: road | Tone: mild | Arc: investigate | Scene: king_road/old_bridge

Client: a masked tax scribe | Focus: the crossroads sign that points every traveler home | Main threat: bandit tolls | Lore turn: the client omits a blood debt owed by their grandparent

Eligibility: Rank F+; level >= 1; background: road. Reward: 85 gold, 12 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Thin Notice | social | The board notice says little; a masked tax scribe fears the truth around the crossroads sign that points every traveler home more than the cost. |
| 2 | Interview One | social | The first witness lies badly, revealing pressure from bandit tolls. |
| 3 | Physical Clue | discovery | A mark, smell, or damaged object anchors the mystery in the road scene. |
| 4 | Contradiction | discovery | The heir finds evidence that makes the client's version impossible. |
| 5 | Street or Trail Pressure | hazard | Someone tries to scare the heir away with poison, ambush, or public shame. |
| 6 | Old Record | discovery | A ledger, gravestone, map, or hymn reveals the client omits a blood debt owed by their grandparent. |
| 7 | Accusation | social | The heir can accuse openly, bait a confession, or keep silent for more evidence. |
| 8 | Proof Under Fire | combat | The culprit or curse lashes out when proof is taken. |
| 9 | Judgment Call | choice | The heir chooses guild law, local mercy, or profitable blackmail. |
| 10 | Filed Truth | reward | The completed report grants pay, rank XP, and possible infamy shift. |

### mis_the-lantern-boys-errand — The Lantern Boy's Errand

Rank F | Difficulty: easy | Min level: 1 | Setting: town | Tone: mild | Arc: escort | Scene: town_market/tavern_street

Client: widow Mara | Focus: a lamplighter's nephew with his first dusk route | Main threat: rats fat on gravewax | Lore turn: payment is partly cursed unless purified before banking

Eligibility: Rank F+; level >= 1; background: town. Reward: 92 gold, 13 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Departure Oath | social | widow Mara entrusts a lamplighter's nephew with his first dusk route to the heir under guild witness. |
| 2 | Road Temper | social | The escorted party reveals a flaw, fear, or secret before danger appears. |
| 3 | First Delay | hazard | Weather, mud, gossip, or a closed gate threatens the schedule. |
| 4 | Watcher Sign | discovery | The heir spots rats fat on gravewax tracking the party. |
| 5 | Meal by Bad Light | social | A rest scene tests morale and lets the heir ask why the escort matters. |
| 6 | Ambush Geometry | combat | The route narrows into a tactical choice: protect the charge, flank, or flee. |
| 7 | The Hidden Cargo | discovery | The escort changes meaning when the heir learns payment is partly cursed unless purified before banking. |
| 8 | No Clean Path | choice | One path is safe but slow; the other is dangerous but may preserve the full reward. |
| 9 | Final Gate | hazard | The destination itself rejects entry until a vow, bribe, or skill check succeeds. |
| 10 | Witnessed Arrival | reward | The guild records successful escort and pays according to survival and honesty. |

### mis_crows-in-the-chapel-yard — Crows in the Chapel Yard

Rank F | Difficulty: easy | Min level: 1 | Setting: crypt | Tone: mild | Arc: exorcise | Scene: chapel_crypt/bone_vault

Client: a mourner in black gloves | Focus: crows tapping names into fresh grave soil | Main threat: sealed family sins | Lore turn: the final clue only appears after dusk

Eligibility: Rank F+; level >= 1; background: crypt. Reward: 99 gold, 13 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Holy Writ | social | a mourner in black gloves asks for crows tapping names into fresh grave soil to be quieted, burned, named, or forgiven. |
| 2 | Boundary Salt | discovery | The heir maps the haunting's boundary and where sealed family sins gather. |
| 3 | Name the Dead | social | A living relative or old inscription gives the spirit a usable name. |
| 4 | Wrong Rite | hazard | A common rite worsens the haunting unless faith or intelligence catches the flaw. |
| 5 | Memory Scene | discovery | The ghost shows the heir a fragment proving the final clue only appears after dusk. |
| 6 | Offering Choice | choice | Gold, blood, apology, or relic ash may calm the spirit at different costs. |
| 7 | Possessed Object | combat | An object or corpse attacks while the rite is prepared. |
| 8 | Last Confession | social | The heir chooses whether to expose the truth to the living. |
| 9 | Banish or Bind | hazard | The final rite risks curse, death, or a bloodline-scoped scar. |
| 10 | Quiet Ground | reward | The dead settle; the guild pays and may add a blessing if mercy was shown. |

### mis_the-fishers-blue-net — The Fisher's Blue Net

Rank F | Difficulty: easy | Min level: 1 | Setting: coast | Tone: mild | Arc: retrieve | Scene: storm_coast/fishing_dock

Client: the lighthouse widow | Focus: a blue net tangled with silver bones | Main threat: storm hags | Lore turn: a rival heir already failed here and left a warning mark

Eligibility: Rank F+; level >= 1; background: coast. Reward: 106 gold, 14 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Written Claim | social | the lighthouse widow claims a blue net tangled with silver bones must be recovered before rival hands reach it. |
| 2 | Owner's Mark | discovery | The heir identifies the object's mark and one unsettling sign of storm hags nearby. |
| 3 | Price of Entry | hazard | A guard, lock, tide, or curse demands supplies, gold, or a stat check. |
| 4 | Competing Hand | social | A second claimant offers coin to walk away from the contract. |
| 5 | Container Trap | hazard | The object's case is trapped; rogues, mages, and clerics each see different warnings. |
| 6 | True Provenance | discovery | A hidden inscription reveals a rival heir already failed here and left a warning mark. |
| 7 | Weight of the Thing | choice | Carrying a blue net tangled with silver bones burdens the heir: speed, stealth, or morale must be sacrificed. |
| 8 | The Pursuit | combat | storm hags pursue the recovered object through the coast scene. |
| 9 | Clean Hands | social | The heir decides whether to reveal the truth, hide it, or mark the client as suspect. |
| 10 | Sealed Receipt | reward | The guild issues pay and rank XP; the item may also unlock a later secret event. |

### mis_lost-goat-at-briar-ford — Lost Goat at Briar Ford

Rank F | Difficulty: easy | Min level: 1 | Setting: forest | Tone: mild | Arc: rescue | Scene: forest_briar/moonlit_wood

Client: warden Ilya | Focus: a bell-wether goat wearing a child's ribbon | Main threat: poacher snares | Lore turn: the safest route would abandon someone helpless

Eligibility: Rank F+; level >= 1; background: forest. Reward: 113 gold, 14 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Frantic Posting | social | warden Ilya begs the heir to recover a bell-wether goat wearing a child's ribbon; delay lowers the rescue reward. |
| 2 | Last Sighting | discovery | A child, track, or dropped token places the missing soul at the edge of the forest scene. |
| 3 | False Trail | hazard | A tempting trail wastes supplies unless the heir passes luck or intelligence. |
| 4 | Quiet Call | social | The heir hears a weak answer, but poacher snares answer from another direction. |
| 5 | Blocked Reach | hazard | Stone, thorns, tide, or locked iron blocks the path and demands a class-flavored solution. |
| 6 | The Captor's Reason | discovery | The mission turns when the heir learns the safest route would abandon someone helpless. |
| 7 | Breath and Panic | choice | The rescued target panics; charisma, faith, or a gentle item can prevent injury. |
| 8 | Carry or Clear | hazard | The heir chooses to carry the rescued target slowly or clear danger first. |
| 9 | Breakout | combat | The last obstacle attacks during escape; losing may kill the heir or the target. |
| 10 | Returned Alive | reward | warden Ilya pays through tears, and the line gains rank XP for saving a bell-wether goat wearing a child's ribbon. |

### mis_the-debt-ledger-of-old-bram — The Debt Ledger of Old Bram

Rank F | Difficulty: easy | Min level: 1 | Setting: town | Tone: mild | Arc: investigate | Scene: town_market/tavern_street

Client: sister Elowen | Focus: a miller's ledger that bleeds when opened | Main threat: debt spirits | Lore turn: the client omits a blood debt owed by their grandparent

Eligibility: Rank F+; level >= 1; background: town. Secret: Hidden variant if completedMissionIds includes misty-on-the-mill-roof and charisma >= 11. Reward: 120 gold, 15 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Thin Notice | social | The board notice says little; sister Elowen fears the truth around a miller's ledger that bleeds when opened more than the cost. |
| 2 | Interview One | social | The first witness lies badly, revealing pressure from debt spirits. |
| 3 | Physical Clue | discovery | A mark, smell, or damaged object anchors the mystery in the town scene. |
| 4 | Contradiction | discovery | The heir finds evidence that makes the client's version impossible. |
| 5 | Street or Trail Pressure | hazard | Someone tries to scare the heir away with poison, ambush, or public shame. |
| 6 | Old Record | discovery | A ledger, gravestone, map, or hymn reveals the client omits a blood debt owed by their grandparent. |
| 7 | Accusation | social | The heir can accuse openly, bait a confession, or keep silent for more evidence. |
| 8 | Proof Under Fire | combat | The culprit or curse lashes out when proof is taken. |
| 9 | Judgment Call | choice | The heir chooses guild law, local mercy, or profitable blackmail. |
| 10 | Filed Truth | reward | The completed report grants pay, rank XP, and possible infamy shift. |

### mis_the-sleepy-watchmans-bell — The Sleepy Watchman's Bell

Rank F | Difficulty: easy | Min level: 1 | Setting: town | Tone: mild | Arc: defend | Scene: town_market/tavern_street

Client: guild clerk Ren | Focus: the north bell that refuses to wake the watch | Main threat: rats fat on gravewax | Lore turn: payment is partly cursed unless purified before banking

Eligibility: Rank F+; level >= 1; background: town. Reward: 127 gold, 15 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Alarm Bell | social | guild clerk Ren hires the heir to hold the north bell that refuses to wake the watch until dawn or relief. |
| 2 | Survey Defenses | discovery | The heir identifies weak doors, frightened locals, and where rats fat on gravewax will enter. |
| 3 | Limited Hands | choice | Assign workers, spend supplies, or take a dangerous solo position. |
| 4 | First Probe | combat | A small attack tests the defenses and exposes the real strategy. |
| 5 | Panic in the Ranks | social | Morale threatens collapse unless the heir inspires, threatens, or pays the defenders. |
| 6 | Hidden Breach | hazard | A tunnel, mirror, window, or sewer creates a second front. |
| 7 | Revealed Motive | discovery | The siege makes sense when the heir learns payment is partly cursed unless purified before banking. |
| 8 | Last Reserve | choice | Spend the emergency reserve now or save it for the final wave. |
| 9 | Dawn Assault | combat | The heaviest attack comes just before safety; failure may kill civilians and the heir. |
| 10 | Count the Living | reward | Reward scales with survivors, property saved, and whether the heir kept faith. |

### mis_mushroom-ring-in-widow-vale — Mushroom Ring in Widow Vale

Rank F | Difficulty: easy | Min level: 1 | Setting: forest | Tone: mild | Arc: retrieve | Scene: forest_briar/moonlit_wood

Client: warden Ilya | Focus: seven mooncap mushrooms from a fairy ring | Main threat: fae tax collectors | Lore turn: the final clue only appears after dusk

Eligibility: Rank F+; level >= 1; background: forest. Reward: 134 gold, 16 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Written Claim | social | warden Ilya claims seven mooncap mushrooms from a fairy ring must be recovered before rival hands reach it. |
| 2 | Owner's Mark | discovery | The heir identifies the object's mark and one unsettling sign of fae tax collectors nearby. |
| 3 | Price of Entry | hazard | A guard, lock, tide, or curse demands supplies, gold, or a stat check. |
| 4 | Competing Hand | social | A second claimant offers coin to walk away from the contract. |
| 5 | Container Trap | hazard | The object's case is trapped; rogues, mages, and clerics each see different warnings. |
| 6 | True Provenance | discovery | A hidden inscription reveals the final clue only appears after dusk. |
| 7 | Weight of the Thing | choice | Carrying seven mooncap mushrooms from a fairy ring burdens the heir: speed, stealth, or morale must be sacrificed. |
| 8 | The Pursuit | combat | fae tax collectors pursue the recovered object through the forest scene. |
| 9 | Clean Hands | social | The heir decides whether to reveal the truth, hide it, or mark the client as suspect. |
| 10 | Sealed Receipt | reward | The guild issues pay and rank XP; the item may also unlock a later secret event. |

## Rank E Contracts

### mis_hounds-at-ashbridge — Hounds at Ashbridge

Rank E | Difficulty: easy-moderate | Min level: 3 | Setting: road | Tone: mild | Arc: hunt | Scene: king_road/old_bridge

Client: messenger Priel | Focus: black hounds circling the toll bridge | Main threat: hungry bridges | Lore turn: the client omits a blood debt owed by their grandparent

Eligibility: Rank E+; level >= 3; background: road. Reward: 141 gold, 16 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Kill Writ | social | messenger Priel posts a hunt for black hounds circling the toll bridge; the writ warns that hungry bridges have learned human habits. |
| 2 | Track Bed | discovery | The heir finds tracks that do not match the creature's supposed shape. |
| 3 | Bait Decision | choice | Use bought bait, personal blood, or a risky decoy to draw the quarry. |
| 4 | Hunter Becomes Hunted | hazard | The quarry circles behind the heir, costing supplies or morale. |
| 5 | Victim Remnant | discovery | A survivor, bone, or torn charm reveals the client omits a blood debt owed by their grandparent. |
| 6 | Lair Threshold | hazard | The lair terrain favors the quarry and demands a class or stat response. |
| 7 | First Clash | combat | The heir wounds the target but learns it has a second form or hidden ally. |
| 8 | Mercy Window | choice | A chance appears to spare, bind, or finish the target for different consequences. |
| 9 | Blood Price | combat | The final hunt resolves; failure can kill the heir outright. |
| 10 | Trophy and Doubt | reward | The trophy earns rank XP, but the chronicle notes whether the kill was just. |

### mis_the-taxmans-empty-cart — The Taxman's Empty Cart

Rank E | Difficulty: easy-moderate | Min level: 3 | Setting: road | Tone: mild | Arc: retrieve | Scene: king_road/old_bridge

Client: a masked tax scribe | Focus: a locked tax chest found without horses or driver | Main threat: broken milestones | Lore turn: payment is partly cursed unless purified before banking

Eligibility: Rank E+; level >= 3; background: road. Reward: 148 gold, 17 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Written Claim | social | a masked tax scribe claims a locked tax chest found without horses or driver must be recovered before rival hands reach it. |
| 2 | Owner's Mark | discovery | The heir identifies the object's mark and one unsettling sign of broken milestones nearby. |
| 3 | Price of Entry | hazard | A guard, lock, tide, or curse demands supplies, gold, or a stat check. |
| 4 | Competing Hand | social | A second claimant offers coin to walk away from the contract. |
| 5 | Container Trap | hazard | The object's case is trapped; rogues, mages, and clerics each see different warnings. |
| 6 | True Provenance | discovery | A hidden inscription reveals payment is partly cursed unless purified before banking. |
| 7 | Weight of the Thing | choice | Carrying a locked tax chest found without horses or driver burdens the heir: speed, stealth, or morale must be sacrificed. |
| 8 | The Pursuit | combat | broken milestones pursue the recovered object through the road scene. |
| 9 | Clean Hands | social | The heir decides whether to reveal the truth, hide it, or mark the client as suspect. |
| 10 | Sealed Receipt | reward | The guild issues pay and rank XP; the item may also unlock a later secret event. |

### mis_salt-on-the-stable-door — Salt on the Stable Door

Rank E | Difficulty: easy-moderate | Min level: 3 | Setting: town | Tone: mild | Arc: exorcise | Scene: town_market/tavern_street

Client: widow Mara | Focus: a stable curse marked in salt and hoof blood | Main threat: lying witnesses | Lore turn: the final clue only appears after dusk

Eligibility: Rank E+; level >= 3; background: town. Reward: 155 gold, 17 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Holy Writ | social | widow Mara asks for a stable curse marked in salt and hoof blood to be quieted, burned, named, or forgiven. |
| 2 | Boundary Salt | discovery | The heir maps the haunting's boundary and where lying witnesses gather. |
| 3 | Name the Dead | social | A living relative or old inscription gives the spirit a usable name. |
| 4 | Wrong Rite | hazard | A common rite worsens the haunting unless faith or intelligence catches the flaw. |
| 5 | Memory Scene | discovery | The ghost shows the heir a fragment proving the final clue only appears after dusk. |
| 6 | Offering Choice | choice | Gold, blood, apology, or relic ash may calm the spirit at different costs. |
| 7 | Possessed Object | combat | An object or corpse attacks while the rite is prepared. |
| 8 | Last Confession | social | The heir chooses whether to expose the truth to the living. |
| 9 | Banish or Bind | hazard | The final rite risks curse, death, or a bloodline-scoped scar. |
| 10 | Quiet Ground | reward | The dead settle; the guild pays and may add a blessing if mercy was shown. |

### mis_the-hollow-beneath-beekeeper-hill — The Hollow Beneath Beekeeper Hill

Rank E | Difficulty: easy-moderate | Min level: 3 | Setting: cave | Tone: mild | Arc: rescue | Scene: cave_mouth/deep_mine

Client: candle priest Orrin | Focus: two children trapped under humming stone | Main threat: glass bats | Lore turn: a rival heir already failed here and left a warning mark

Eligibility: Rank E+; level >= 3; background: cave. Reward: 162 gold, 18 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Frantic Posting | social | candle priest Orrin begs the heir to recover two children trapped under humming stone; delay lowers the rescue reward. |
| 2 | Last Sighting | discovery | A child, track, or dropped token places the missing soul at the edge of the cave scene. |
| 3 | False Trail | hazard | A tempting trail wastes supplies unless the heir passes luck or intelligence. |
| 4 | Quiet Call | social | The heir hears a weak answer, but glass bats answer from another direction. |
| 5 | Blocked Reach | hazard | Stone, thorns, tide, or locked iron blocks the path and demands a class-flavored solution. |
| 6 | The Captor's Reason | discovery | The mission turns when the heir learns a rival heir already failed here and left a warning mark. |
| 7 | Breath and Panic | choice | The rescued target panics; charisma, faith, or a gentle item can prevent injury. |
| 8 | Carry or Clear | hazard | The heir chooses to carry the rescued target slowly or clear danger first. |
| 9 | Breakout | combat | The last obstacle attacks during escape; losing may kill the heir or the target. |
| 10 | Returned Alive | reward | candle priest Orrin pays through tears, and the line gains rank XP for saving two children trapped under humming stone. |

### mis_blackwater-ferry-bell — Blackwater Ferry Bell

Rank E | Difficulty: easy-moderate | Min level: 3 | Setting: coast | Tone: mild | Arc: exorcise | Scene: storm_coast/fishing_dock

Client: the lighthouse widow | Focus: a ferry bell rung nightly by drowned hands | Main threat: reef lights | Lore turn: the safest route would abandon someone helpless

Eligibility: Rank E+; level >= 3; background: coast. Reward: 169 gold, 18 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Holy Writ | social | the lighthouse widow asks for a ferry bell rung nightly by drowned hands to be quieted, burned, named, or forgiven. |
| 2 | Boundary Salt | discovery | The heir maps the haunting's boundary and where reef lights gather. |
| 3 | Name the Dead | social | A living relative or old inscription gives the spirit a usable name. |
| 4 | Wrong Rite | hazard | A common rite worsens the haunting unless faith or intelligence catches the flaw. |
| 5 | Memory Scene | discovery | The ghost shows the heir a fragment proving the safest route would abandon someone helpless. |
| 6 | Offering Choice | choice | Gold, blood, apology, or relic ash may calm the spirit at different costs. |
| 7 | Possessed Object | combat | An object or corpse attacks while the rite is prepared. |
| 8 | Last Confession | social | The heir chooses whether to expose the truth to the living. |
| 9 | Banish or Bind | hazard | The final rite risks curse, death, or a bloodline-scoped scar. |
| 10 | Quiet Ground | reward | The dead settle; the guild pays and may add a blessing if mercy was shown. |

### mis_pig-iron-idol-in-mine-shaft-six — Pig-Iron Idol in Mine Shaft Six

Rank E | Difficulty: easy-moderate | Min level: 3 | Setting: cave | Tone: mild | Arc: retrieve | Scene: cave_mouth/deep_mine

Client: foreman Pell | Focus: a pig-iron idol sweating black oil | Main threat: old dwarven locks | Lore turn: the client omits a blood debt owed by their grandparent

Eligibility: Rank E+; level >= 3; background: cave. Reward: 176 gold, 19 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Written Claim | social | foreman Pell claims a pig-iron idol sweating black oil must be recovered before rival hands reach it. |
| 2 | Owner's Mark | discovery | The heir identifies the object's mark and one unsettling sign of old dwarven locks nearby. |
| 3 | Price of Entry | hazard | A guard, lock, tide, or curse demands supplies, gold, or a stat check. |
| 4 | Competing Hand | social | A second claimant offers coin to walk away from the contract. |
| 5 | Container Trap | hazard | The object's case is trapped; rogues, mages, and clerics each see different warnings. |
| 6 | True Provenance | discovery | A hidden inscription reveals the client omits a blood debt owed by their grandparent. |
| 7 | Weight of the Thing | choice | Carrying a pig-iron idol sweating black oil burdens the heir: speed, stealth, or morale must be sacrificed. |
| 8 | The Pursuit | combat | old dwarven locks pursue the recovered object through the cave scene. |
| 9 | Clean Hands | social | The heir decides whether to reveal the truth, hide it, or mark the client as suspect. |
| 10 | Sealed Receipt | reward | The guild issues pay and rank XP; the item may also unlock a later secret event. |

### mis_the-groom-who-never-arrived — The Groom Who Never Arrived

Rank E | Difficulty: easy-moderate | Min level: 3 | Setting: town | Tone: mild | Arc: investigate | Scene: town_market/tavern_street

Client: sister Elowen | Focus: a groom missing from a chapel full of guests | Main threat: knife-gang watchers | Lore turn: payment is partly cursed unless purified before banking

Eligibility: Rank E+; level >= 3; background: town. Reward: 183 gold, 19 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Thin Notice | social | The board notice says little; sister Elowen fears the truth around a groom missing from a chapel full of guests more than the cost. |
| 2 | Interview One | social | The first witness lies badly, revealing pressure from knife-gang watchers. |
| 3 | Physical Clue | discovery | A mark, smell, or damaged object anchors the mystery in the town scene. |
| 4 | Contradiction | discovery | The heir finds evidence that makes the client's version impossible. |
| 5 | Street or Trail Pressure | hazard | Someone tries to scare the heir away with poison, ambush, or public shame. |
| 6 | Old Record | discovery | A ledger, gravestone, map, or hymn reveals payment is partly cursed unless purified before banking. |
| 7 | Accusation | social | The heir can accuse openly, bait a confession, or keep silent for more evidence. |
| 8 | Proof Under Fire | combat | The culprit or curse lashes out when proof is taken. |
| 9 | Judgment Call | choice | The heir chooses guild law, local mercy, or profitable blackmail. |
| 10 | Filed Truth | reward | The completed report grants pay, rank XP, and possible infamy shift. |

### mis_candle-smoke-in-bracken-chapel — Candle Smoke in Bracken Chapel

Rank E | Difficulty: easy-moderate | Min level: 3 | Setting: crypt | Tone: mild | Arc: exorcise | Scene: chapel_crypt/bone_vault

Client: a bell-ringer | Focus: smoke spelling old confession names | Main threat: curse plaques | Lore turn: the final clue only appears after dusk

Eligibility: Rank E+; level >= 3; background: crypt. Reward: 190 gold, 20 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Holy Writ | social | a bell-ringer asks for smoke spelling old confession names to be quieted, burned, named, or forgiven. |
| 2 | Boundary Salt | discovery | The heir maps the haunting's boundary and where curse plaques gather. |
| 3 | Name the Dead | social | A living relative or old inscription gives the spirit a usable name. |
| 4 | Wrong Rite | hazard | A common rite worsens the haunting unless faith or intelligence catches the flaw. |
| 5 | Memory Scene | discovery | The ghost shows the heir a fragment proving the final clue only appears after dusk. |
| 6 | Offering Choice | choice | Gold, blood, apology, or relic ash may calm the spirit at different costs. |
| 7 | Possessed Object | combat | An object or corpse attacks while the rite is prepared. |
| 8 | Last Confession | social | The heir chooses whether to expose the truth to the living. |
| 9 | Banish or Bind | hazard | The final rite risks curse, death, or a bloodline-scoped scar. |
| 10 | Quiet Ground | reward | The dead settle; the guild pays and may add a blessing if mercy was shown. |

### mis_the-foxs-stolen-crown — The Fox's Stolen Crown

Rank E | Difficulty: easy-moderate | Min level: 3 | Setting: forest | Tone: mild | Arc: retrieve | Scene: forest_briar/moonlit_wood

Client: warden Ilya | Focus: a wooden toy crown stolen by a talking fox | Main threat: thorn wolves | Lore turn: a rival heir already failed here and left a warning mark

Eligibility: Rank E+; level >= 3; background: forest. Reward: 197 gold, 20 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Written Claim | social | warden Ilya claims a wooden toy crown stolen by a talking fox must be recovered before rival hands reach it. |
| 2 | Owner's Mark | discovery | The heir identifies the object's mark and one unsettling sign of thorn wolves nearby. |
| 3 | Price of Entry | hazard | A guard, lock, tide, or curse demands supplies, gold, or a stat check. |
| 4 | Competing Hand | social | A second claimant offers coin to walk away from the contract. |
| 5 | Container Trap | hazard | The object's case is trapped; rogues, mages, and clerics each see different warnings. |
| 6 | True Provenance | discovery | A hidden inscription reveals a rival heir already failed here and left a warning mark. |
| 7 | Weight of the Thing | choice | Carrying a wooden toy crown stolen by a talking fox burdens the heir: speed, stealth, or morale must be sacrificed. |
| 8 | The Pursuit | combat | thorn wolves pursue the recovered object through the forest scene. |
| 9 | Clean Hands | social | The heir decides whether to reveal the truth, hide it, or mark the client as suspect. |
| 10 | Sealed Receipt | reward | The guild issues pay and rank XP; the item may also unlock a later secret event. |

### mis_a-well-that-answers-back — A Well That Answers Back

Rank E | Difficulty: easy-moderate | Min level: 3 | Setting: town | Tone: mild | Arc: investigate | Scene: town_market/tavern_street

Client: sister Elowen | Focus: a well that repeats tomorrow's last words | Main threat: rats fat on gravewax | Lore turn: the safest route would abandon someone helpless

Eligibility: Rank E+; level >= 3; background: town. Reward: 204 gold, 21 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Thin Notice | social | The board notice says little; sister Elowen fears the truth around a well that repeats tomorrow's last words more than the cost. |
| 2 | Interview One | social | The first witness lies badly, revealing pressure from rats fat on gravewax. |
| 3 | Physical Clue | discovery | A mark, smell, or damaged object anchors the mystery in the town scene. |
| 4 | Contradiction | discovery | The heir finds evidence that makes the client's version impossible. |
| 5 | Street or Trail Pressure | hazard | Someone tries to scare the heir away with poison, ambush, or public shame. |
| 6 | Old Record | discovery | A ledger, gravestone, map, or hymn reveals the safest route would abandon someone helpless. |
| 7 | Accusation | social | The heir can accuse openly, bait a confession, or keep silent for more evidence. |
| 8 | Proof Under Fire | combat | The culprit or curse lashes out when proof is taken. |
| 9 | Judgment Call | choice | The heir chooses guild law, local mercy, or profitable blackmail. |
| 10 | Filed Truth | reward | The completed report grants pay, rank XP, and possible infamy shift. |

### mis_feathers-over-gallows-road — Feathers over Gallows Road

Rank E | Difficulty: easy-moderate | Min level: 3 | Setting: road | Tone: mild | Arc: defend | Scene: king_road/old_bridge

Client: a masked tax scribe | Focus: a feather-storm that blinds travelers near gallows hill | Main threat: hungry bridges | Lore turn: the client omits a blood debt owed by their grandparent

Eligibility: Rank E+; level >= 3; background: road. Reward: 211 gold, 21 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Alarm Bell | social | a masked tax scribe hires the heir to hold a feather-storm that blinds travelers near gallows hill until dawn or relief. |
| 2 | Survey Defenses | discovery | The heir identifies weak doors, frightened locals, and where hungry bridges will enter. |
| 3 | Limited Hands | choice | Assign workers, spend supplies, or take a dangerous solo position. |
| 4 | First Probe | combat | A small attack tests the defenses and exposes the real strategy. |
| 5 | Panic in the Ranks | social | Morale threatens collapse unless the heir inspires, threatens, or pays the defenders. |
| 6 | Hidden Breach | hazard | A tunnel, mirror, window, or sewer creates a second front. |
| 7 | Revealed Motive | discovery | The siege makes sense when the heir learns the client omits a blood debt owed by their grandparent. |
| 8 | Last Reserve | choice | Spend the emergency reserve now or save it for the final wave. |
| 9 | Dawn Assault | combat | The heaviest attack comes just before safety; failure may kill civilians and the heir. |
| 10 | Count the Living | reward | Reward scales with survivors, property saved, and whether the heir kept faith. |

### mis_the-millers-second-shadow — The Miller's Second Shadow

Rank E | Difficulty: easy-moderate | Min level: 3 | Setting: town | Tone: mild | Arc: investigate | Scene: town_market/tavern_street

Client: widow Mara | Focus: a second shadow grinding grain after midnight | Main threat: knife-gang watchers | Lore turn: payment is partly cursed unless purified before banking

Eligibility: Rank E+; level >= 3; background: town. Reward: 218 gold, 22 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Thin Notice | social | The board notice says little; widow Mara fears the truth around a second shadow grinding grain after midnight more than the cost. |
| 2 | Interview One | social | The first witness lies badly, revealing pressure from knife-gang watchers. |
| 3 | Physical Clue | discovery | A mark, smell, or damaged object anchors the mystery in the town scene. |
| 4 | Contradiction | discovery | The heir finds evidence that makes the client's version impossible. |
| 5 | Street or Trail Pressure | hazard | Someone tries to scare the heir away with poison, ambush, or public shame. |
| 6 | Old Record | discovery | A ledger, gravestone, map, or hymn reveals payment is partly cursed unless purified before banking. |
| 7 | Accusation | social | The heir can accuse openly, bait a confession, or keep silent for more evidence. |
| 8 | Proof Under Fire | combat | The culprit or curse lashes out when proof is taken. |
| 9 | Judgment Call | choice | The heir chooses guild law, local mercy, or profitable blackmail. |
| 10 | Filed Truth | reward | The completed report grants pay, rank XP, and possible infamy shift. |

## Rank D Contracts

### mis_pale-antlers-at-thornmere — Pale Antlers at Thornmere

Rank D | Difficulty: moderate | Min level: 6 | Setting: forest | Tone: moderate | Arc: hunt | Scene: forest_briar/moonlit_wood

Client: old poacher Venn | Focus: a stag with antlers like candlewax | Main threat: crow familiars | Lore turn: the safest route would abandon someone helpless

Eligibility: Rank D+; level >= 6; background: forest. Reward: 225 gold, 22 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Kill Writ | social | old poacher Venn posts a hunt for a stag with antlers like candlewax; the writ warns that crow familiars have learned human habits. |
| 2 | Track Bed | discovery | The heir finds tracks that do not match the creature's supposed shape. |
| 3 | Bait Decision | choice | Use bought bait, personal blood, or a risky decoy to draw the quarry. |
| 4 | Hunter Becomes Hunted | hazard | The quarry circles behind the heir, costing supplies or morale. |
| 5 | Victim Remnant | discovery | A survivor, bone, or torn charm reveals the safest route would abandon someone helpless. |
| 6 | Lair Threshold | hazard | The lair terrain favors the quarry and demands a class or stat response. |
| 7 | First Clash | combat | The heir wounds the target but learns it has a second form or hidden ally. |
| 8 | Mercy Window | choice | A chance appears to spare, bind, or finish the target for different consequences. |
| 9 | Blood Price | combat | The final hunt resolves; failure can kill the heir outright. |
| 10 | Trophy and Doubt | reward | The trophy earns rank XP, but the chronicle notes whether the kill was just. |

### mis_the-copper-vein-that-sang — The Copper Vein That Sang

Rank D | Difficulty: moderate | Min level: 6 | Setting: cave | Tone: moderate | Arc: investigate | Scene: cave_mouth/deep_mine

Client: guild delver Kett | Focus: a copper seam singing the dead miners' hymns | Main threat: collapse-prone tunnels | Lore turn: the client omits a blood debt owed by their grandparent

Eligibility: Rank D+; level >= 6; background: cave. Reward: 232 gold, 23 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Thin Notice | social | The board notice says little; guild delver Kett fears the truth around a copper seam singing the dead miners' hymns more than the cost. |
| 2 | Interview One | social | The first witness lies badly, revealing pressure from collapse-prone tunnels. |
| 3 | Physical Clue | discovery | A mark, smell, or damaged object anchors the mystery in the cave scene. |
| 4 | Contradiction | discovery | The heir finds evidence that makes the client's version impossible. |
| 5 | Street or Trail Pressure | hazard | Someone tries to scare the heir away with poison, ambush, or public shame. |
| 6 | Old Record | discovery | A ledger, gravestone, map, or hymn reveals the client omits a blood debt owed by their grandparent. |
| 7 | Accusation | social | The heir can accuse openly, bait a confession, or keep silent for more evidence. |
| 8 | Proof Under Fire | combat | The culprit or curse lashes out when proof is taken. |
| 9 | Judgment Call | choice | The heir chooses guild law, local mercy, or profitable blackmail. |
| 10 | Filed Truth | reward | The completed report grants pay, rank XP, and possible infamy shift. |

### mis_tide-teeth-in-the-fishmarket — Tide Teeth in the Fishmarket

Rank D | Difficulty: moderate | Min level: 6 | Setting: coast | Tone: moderate | Arc: hunt | Scene: storm_coast/fishing_dock

Client: fisher Jossa | Focus: jawless fish biting through stalls after dawn | Main threat: drowned crews | Lore turn: payment is partly cursed unless purified before banking

Eligibility: Rank D+; level >= 6; background: coast. Reward: 239 gold, 23 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Kill Writ | social | fisher Jossa posts a hunt for jawless fish biting through stalls after dawn; the writ warns that drowned crews have learned human habits. |
| 2 | Track Bed | discovery | The heir finds tracks that do not match the creature's supposed shape. |
| 3 | Bait Decision | choice | Use bought bait, personal blood, or a risky decoy to draw the quarry. |
| 4 | Hunter Becomes Hunted | hazard | The quarry circles behind the heir, costing supplies or morale. |
| 5 | Victim Remnant | discovery | A survivor, bone, or torn charm reveals payment is partly cursed unless purified before banking. |
| 6 | Lair Threshold | hazard | The lair terrain favors the quarry and demands a class or stat response. |
| 7 | First Clash | combat | The heir wounds the target but learns it has a second form or hidden ally. |
| 8 | Mercy Window | choice | A chance appears to spare, bind, or finish the target for different consequences. |
| 9 | Blood Price | combat | The final hunt resolves; failure can kill the heir outright. |
| 10 | Trophy and Doubt | reward | The trophy earns rank XP, but the chronicle notes whether the kill was just. |

### mis_the-pilgrims-stolen-saint — The Pilgrim's Stolen Saint

Rank D | Difficulty: moderate | Min level: 6 | Setting: road | Tone: moderate | Arc: retrieve | Scene: king_road/old_bridge

Client: messenger Priel | Focus: a fingerbone reliquary lifted from a caravan | Main threat: false pilgrims | Lore turn: the final clue only appears after dusk

Eligibility: Rank D+; level >= 6; background: road. Reward: 246 gold, 24 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Written Claim | social | messenger Priel claims a fingerbone reliquary lifted from a caravan must be recovered before rival hands reach it. |
| 2 | Owner's Mark | discovery | The heir identifies the object's mark and one unsettling sign of false pilgrims nearby. |
| 3 | Price of Entry | hazard | A guard, lock, tide, or curse demands supplies, gold, or a stat check. |
| 4 | Competing Hand | social | A second claimant offers coin to walk away from the contract. |
| 5 | Container Trap | hazard | The object's case is trapped; rogues, mages, and clerics each see different warnings. |
| 6 | True Provenance | discovery | A hidden inscription reveals the final clue only appears after dusk. |
| 7 | Weight of the Thing | choice | Carrying a fingerbone reliquary lifted from a caravan burdens the heir: speed, stealth, or morale must be sacrificed. |
| 8 | The Pursuit | combat | false pilgrims pursue the recovered object through the road scene. |
| 9 | Clean Hands | social | The heir decides whether to reveal the truth, hide it, or mark the client as suspect. |
| 10 | Sealed Receipt | reward | The guild issues pay and rank XP; the item may also unlock a later secret event. |

### mis_grave-moth-brood — Grave-Moth Brood

Rank D | Difficulty: moderate | Min level: 6 | Setting: crypt | Tone: moderate | Arc: hunt | Scene: chapel_crypt/bone_vault

Client: a bell-ringer | Focus: grave-moths nesting in the village ossuary | Main threat: sealed family sins | Lore turn: a rival heir already failed here and left a warning mark

Eligibility: Rank D+; level >= 6; background: crypt. Reward: 253 gold, 24 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Kill Writ | social | a bell-ringer posts a hunt for grave-moths nesting in the village ossuary; the writ warns that sealed family sins have learned human habits. |
| 2 | Track Bed | discovery | The heir finds tracks that do not match the creature's supposed shape. |
| 3 | Bait Decision | choice | Use bought bait, personal blood, or a risky decoy to draw the quarry. |
| 4 | Hunter Becomes Hunted | hazard | The quarry circles behind the heir, costing supplies or morale. |
| 5 | Victim Remnant | discovery | A survivor, bone, or torn charm reveals a rival heir already failed here and left a warning mark. |
| 6 | Lair Threshold | hazard | The lair terrain favors the quarry and demands a class or stat response. |
| 7 | First Clash | combat | The heir wounds the target but learns it has a second form or hidden ally. |
| 8 | Mercy Window | choice | A chance appears to spare, bind, or finish the target for different consequences. |
| 9 | Blood Price | combat | The final hunt resolves; failure can kill the heir outright. |
| 10 | Trophy and Doubt | reward | The trophy earns rank XP, but the chronicle notes whether the kill was just. |

### mis_the-squire-in-the-fallen-tower — The Squire in the Fallen Tower

Rank D | Difficulty: moderate | Min level: 6 | Setting: ruins | Tone: moderate | Arc: rescue | Scene: fallen_tower/old_keep

Client: antiquary Voss | Focus: a squire pinned beneath a speaking gargoyle | Main threat: memory curses | Lore turn: the safest route would abandon someone helpless

Eligibility: Rank D+; level >= 6; background: ruins. Reward: 260 gold, 25 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Frantic Posting | social | antiquary Voss begs the heir to recover a squire pinned beneath a speaking gargoyle; delay lowers the rescue reward. |
| 2 | Last Sighting | discovery | A child, track, or dropped token places the missing soul at the edge of the ruins scene. |
| 3 | False Trail | hazard | A tempting trail wastes supplies unless the heir passes luck or intelligence. |
| 4 | Quiet Call | social | The heir hears a weak answer, but memory curses answer from another direction. |
| 5 | Blocked Reach | hazard | Stone, thorns, tide, or locked iron blocks the path and demands a class-flavored solution. |
| 6 | The Captor's Reason | discovery | The mission turns when the heir learns the safest route would abandon someone helpless. |
| 7 | Breath and Panic | choice | The rescued target panics; charisma, faith, or a gentle item can prevent injury. |
| 8 | Carry or Clear | hazard | The heir chooses to carry the rescued target slowly or clear danger first. |
| 9 | Breakout | combat | The last obstacle attacks during escape; losing may kill the heir or the target. |
| 10 | Returned Alive | reward | antiquary Voss pays through tears, and the line gains rank XP for saving a squire pinned beneath a speaking gargoyle. |

### mis_saffron-fever-at-reedbank — Saffron Fever at Reedbank

Rank D | Difficulty: moderate | Min level: 6 | Setting: swamp | Tone: moderate | Arc: investigate | Scene: black_mire/reed_path

Client: a leechwife | Focus: a fever that turns prayers yellow | Main threat: reed witches | Lore turn: the client omits a blood debt owed by their grandparent

Eligibility: Rank D+; level >= 6; background: swamp. Reward: 267 gold, 25 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Thin Notice | social | The board notice says little; a leechwife fears the truth around a fever that turns prayers yellow more than the cost. |
| 2 | Interview One | social | The first witness lies badly, revealing pressure from reed witches. |
| 3 | Physical Clue | discovery | A mark, smell, or damaged object anchors the mystery in the swamp scene. |
| 4 | Contradiction | discovery | The heir finds evidence that makes the client's version impossible. |
| 5 | Street or Trail Pressure | hazard | Someone tries to scare the heir away with poison, ambush, or public shame. |
| 6 | Old Record | discovery | A ledger, gravestone, map, or hymn reveals the client omits a blood debt owed by their grandparent. |
| 7 | Accusation | social | The heir can accuse openly, bait a confession, or keep silent for more evidence. |
| 8 | Proof Under Fire | combat | The culprit or curse lashes out when proof is taken. |
| 9 | Judgment Call | choice | The heir chooses guild law, local mercy, or profitable blackmail. |
| 10 | Filed Truth | reward | The completed report grants pay, rank XP, and possible infamy shift. |

### mis_the-knife-behind-the-guild-seal — The Knife Behind the Guild Seal

Rank D | Difficulty: moderate | Min level: 6 | Setting: town | Tone: moderate | Arc: investigate | Scene: town_market/tavern_street

Client: guild clerk Ren | Focus: a forged guild writ ordering quiet murders | Main threat: debt spirits | Lore turn: payment is partly cursed unless purified before banking

Eligibility: Rank D+; level >= 6; background: town. Reward: 274 gold, 26 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Thin Notice | social | The board notice says little; guild clerk Ren fears the truth around a forged guild writ ordering quiet murders more than the cost. |
| 2 | Interview One | social | The first witness lies badly, revealing pressure from debt spirits. |
| 3 | Physical Clue | discovery | A mark, smell, or damaged object anchors the mystery in the town scene. |
| 4 | Contradiction | discovery | The heir finds evidence that makes the client's version impossible. |
| 5 | Street or Trail Pressure | hazard | Someone tries to scare the heir away with poison, ambush, or public shame. |
| 6 | Old Record | discovery | A ledger, gravestone, map, or hymn reveals payment is partly cursed unless purified before banking. |
| 7 | Accusation | social | The heir can accuse openly, bait a confession, or keep silent for more evidence. |
| 8 | Proof Under Fire | combat | The culprit or curse lashes out when proof is taken. |
| 9 | Judgment Call | choice | The heir chooses guild law, local mercy, or profitable blackmail. |
| 10 | Filed Truth | reward | The completed report grants pay, rank XP, and possible infamy shift. |

### mis_moonlit-charcoal-kiln — Moonlit Charcoal Kiln

Rank D | Difficulty: moderate | Min level: 6 | Setting: forest | Tone: moderate | Arc: exorcise | Scene: forest_briar/moonlit_wood

Client: warden Ilya | Focus: a kiln that burns without wood on moonless nights | Main threat: hungry trees | Lore turn: the final clue only appears after dusk

Eligibility: Rank D+; level >= 6; background: forest. Reward: 281 gold, 26 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Holy Writ | social | warden Ilya asks for a kiln that burns without wood on moonless nights to be quieted, burned, named, or forgiven. |
| 2 | Boundary Salt | discovery | The heir maps the haunting's boundary and where hungry trees gather. |
| 3 | Name the Dead | social | A living relative or old inscription gives the spirit a usable name. |
| 4 | Wrong Rite | hazard | A common rite worsens the haunting unless faith or intelligence catches the flaw. |
| 5 | Memory Scene | discovery | The ghost shows the heir a fragment proving the final clue only appears after dusk. |
| 6 | Offering Choice | choice | Gold, blood, apology, or relic ash may calm the spirit at different costs. |
| 7 | Possessed Object | combat | An object or corpse attacks while the rite is prepared. |
| 8 | Last Confession | social | The heir chooses whether to expose the truth to the living. |
| 9 | Banish or Bind | hazard | The final rite risks curse, death, or a bloodline-scoped scar. |
| 10 | Quiet Ground | reward | The dead settle; the guild pays and may add a blessing if mercy was shown. |

### mis_broken-milestone-bleeding-road — Broken Milestone, Bleeding Road

Rank D | Difficulty: moderate | Min level: 6 | Setting: road | Tone: moderate | Arc: seal | Scene: king_road/old_bridge

Client: messenger Priel | Focus: a milestone leaking blood into wagon ruts | Main threat: hungry bridges | Lore turn: a rival heir already failed here and left a warning mark

Eligibility: Rank D+; level >= 6; background: road. Secret: Requires completed Signpost Turned Backwards and lineage generation >= 2. Reward: 288 gold, 27 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Containment Order | social | messenger Priel asks the heir to seal a milestone leaking blood into wagon ruts before it spreads. |
| 2 | Measure the Leak | discovery | The heir maps how the curse, breach, or omen escapes into the road scene. |
| 3 | Gather Components | hazard | The seal needs salt, iron, ash, true names, or blood gathered under pressure. |
| 4 | False Seal | discovery | A prior seal failed because someone profited from weakness. |
| 5 | Interruption | combat | hungry bridges attack while the components are prepared. |
| 6 | The Cost Named | choice | The working demands gold, HP, morale, an item, or a future secret debt. |
| 7 | Lore Reversal | discovery | The heir learns a rival heir already failed here and left a warning mark, changing what must be sealed. |
| 8 | Circle Holds | hazard | A timed check determines whether the seal stabilizes or backlashes. |
| 9 | Last Nail | choice | The heir chooses a merciful seal, a harsh seal, or a profitable unstable seal. |
| 10 | Quiet for Now | reward | The guild pays for containment; an unstable choice seeds a future event. |

### mis_the-miners-bread-oven — The Miner's Bread-Oven

Rank D | Difficulty: moderate | Min level: 6 | Setting: cave | Tone: moderate | Arc: rescue | Scene: cave_mouth/deep_mine

Client: guild delver Kett | Focus: miners sealed behind a warm stone door | Main threat: mine-gas whispers | Lore turn: the safest route would abandon someone helpless

Eligibility: Rank D+; level >= 6; background: cave. Reward: 295 gold, 27 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Frantic Posting | social | guild delver Kett begs the heir to recover miners sealed behind a warm stone door; delay lowers the rescue reward. |
| 2 | Last Sighting | discovery | A child, track, or dropped token places the missing soul at the edge of the cave scene. |
| 3 | False Trail | hazard | A tempting trail wastes supplies unless the heir passes luck or intelligence. |
| 4 | Quiet Call | social | The heir hears a weak answer, but mine-gas whispers answer from another direction. |
| 5 | Blocked Reach | hazard | Stone, thorns, tide, or locked iron blocks the path and demands a class-flavored solution. |
| 6 | The Captor's Reason | discovery | The mission turns when the heir learns the safest route would abandon someone helpless. |
| 7 | Breath and Panic | choice | The rescued target panics; charisma, faith, or a gentle item can prevent injury. |
| 8 | Carry or Clear | hazard | The heir chooses to carry the rescued target slowly or clear danger first. |
| 9 | Breakout | combat | The last obstacle attacks during escape; losing may kill the heir or the target. |
| 10 | Returned Alive | reward | guild delver Kett pays through tears, and the line gains rank XP for saving miners sealed behind a warm stone door. |

### mis_three-bells-beneath-low-tide — Three Bells Beneath Low Tide

Rank D | Difficulty: moderate | Min level: 6 | Setting: coast | Tone: moderate | Arc: investigate | Scene: storm_coast/fishing_dock

Client: fisher Jossa | Focus: church bells heard from under the harbor | Main threat: salt revenants | Lore turn: the client omits a blood debt owed by their grandparent

Eligibility: Rank D+; level >= 6; background: coast. Reward: 302 gold, 28 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Thin Notice | social | The board notice says little; fisher Jossa fears the truth around church bells heard from under the harbor more than the cost. |
| 2 | Interview One | social | The first witness lies badly, revealing pressure from salt revenants. |
| 3 | Physical Clue | discovery | A mark, smell, or damaged object anchors the mystery in the coast scene. |
| 4 | Contradiction | discovery | The heir finds evidence that makes the client's version impossible. |
| 5 | Street or Trail Pressure | hazard | Someone tries to scare the heir away with poison, ambush, or public shame. |
| 6 | Old Record | discovery | A ledger, gravestone, map, or hymn reveals the client omits a blood debt owed by their grandparent. |
| 7 | Accusation | social | The heir can accuse openly, bait a confession, or keep silent for more evidence. |
| 8 | Proof Under Fire | combat | The culprit or curse lashes out when proof is taken. |
| 9 | Judgment Call | choice | The heir chooses guild law, local mercy, or profitable blackmail. |
| 10 | Filed Truth | reward | The completed report grants pay, rank XP, and possible infamy shift. |

## Rank C Contracts

### mis_the-barons-hollow-feast — The Baron's Hollow Feast

Rank C | Difficulty: moderate-dangerous | Min level: 10 | Setting: town | Tone: moderate | Arc: investigate | Scene: town_market/tavern_street

Client: sister Elowen | Focus: a banquet where no guest casts a reflection | Main threat: lying witnesses | Lore turn: a rival heir already failed here and left a warning mark

Eligibility: Rank C+; level >= 10; background: town. Reward: 309 gold, 28 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Thin Notice | social | The board notice says little; sister Elowen fears the truth around a banquet where no guest casts a reflection more than the cost. |
| 2 | Interview One | social | The first witness lies badly, revealing pressure from lying witnesses. |
| 3 | Physical Clue | discovery | A mark, smell, or damaged object anchors the mystery in the town scene. |
| 4 | Contradiction | discovery | The heir finds evidence that makes the client's version impossible. |
| 5 | Street or Trail Pressure | hazard | Someone tries to scare the heir away with poison, ambush, or public shame. |
| 6 | Old Record | discovery | A ledger, gravestone, map, or hymn reveals a rival heir already failed here and left a warning mark. |
| 7 | Accusation | social | The heir can accuse openly, bait a confession, or keep silent for more evidence. |
| 8 | Proof Under Fire | combat | The culprit or curse lashes out when proof is taken. |
| 9 | Judgment Call | choice | The heir chooses guild law, local mercy, or profitable blackmail. |
| 10 | Filed Truth | reward | The completed report grants pay, rank XP, and possible infamy shift. |

### mis_bones-in-the-orchard-wall — Bones in the Orchard Wall

Rank C | Difficulty: moderate-dangerous | Min level: 10 | Setting: forest | Tone: moderate | Arc: exorcise | Scene: forest_briar/moonlit_wood

Client: the queen's falconer | Focus: a bone-packed wall that ripens red apples | Main threat: thorn wolves | Lore turn: the safest route would abandon someone helpless

Eligibility: Rank C+; level >= 10; background: forest. Reward: 316 gold, 29 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Holy Writ | social | the queen's falconer asks for a bone-packed wall that ripens red apples to be quieted, burned, named, or forgiven. |
| 2 | Boundary Salt | discovery | The heir maps the haunting's boundary and where thorn wolves gather. |
| 3 | Name the Dead | social | A living relative or old inscription gives the spirit a usable name. |
| 4 | Wrong Rite | hazard | A common rite worsens the haunting unless faith or intelligence catches the flaw. |
| 5 | Memory Scene | discovery | The ghost shows the heir a fragment proving the safest route would abandon someone helpless. |
| 6 | Offering Choice | choice | Gold, blood, apology, or relic ash may calm the spirit at different costs. |
| 7 | Possessed Object | combat | An object or corpse attacks while the rite is prepared. |
| 8 | Last Confession | social | The heir chooses whether to expose the truth to the living. |
| 9 | Banish or Bind | hazard | The final rite risks curse, death, or a bloodline-scoped scar. |
| 10 | Quiet Ground | reward | The dead settle; the guild pays and may add a blessing if mercy was shown. |

### mis_lanterns-in-the-bat-cave — Lanterns in the Bat Cave

Rank C | Difficulty: moderate-dangerous | Min level: 10 | Setting: cave | Tone: moderate | Arc: delve | Scene: cave_mouth/deep_mine

Client: foreman Pell | Focus: blue lanterns leading below the mapped shafts | Main threat: blind things in the seams | Lore turn: the client omits a blood debt owed by their grandparent

Eligibility: Rank C+; level >= 10; background: cave. Reward: 323 gold, 29 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Key and Map | social | foreman Pell gives the heir a flawed map toward blue lanterns leading below the mapped shafts. |
| 2 | Threshold Test | hazard | The entrance demands rope, torch, prayer, or blood before opening safely. |
| 3 | First Chamber | discovery | The architecture reveals who built this place and why they feared blind things in the seams. |
| 4 | Resource Drain | hazard | Darkness, rot, hunger, or silence drains supplies and morale. |
| 5 | Old Body | discovery | A corpse from an earlier expedition reveals the client omits a blood debt owed by their grandparent. |
| 6 | Choice of Depths | choice | One route is short and trapped; another is long and haunted. |
| 7 | Guardian Room | combat | A guardian tests whether the heir belongs below. |
| 8 | Treasure With Teeth | hazard | The objective is trapped, aware, or bound to the site. |
| 9 | Escape Collapse | combat | Taking blue lanterns leading below the mapped shafts wakes the final defense and turns the return into a chase. |
| 10 | Surface Reckoning | reward | The guild pays, but the heir may carry a dungeon mark into later runs. |

### mis_the-snow-brides-procession — The Snow Bride's Procession

Rank C | Difficulty: moderate-dangerous | Min level: 10 | Setting: mountain | Tone: moderate | Arc: escort | Scene: snow_pass/cliff_shrine

Client: a frost-bitten courier | Focus: a veiled bride walking uphill in summer snow | Main threat: icebound vows | Lore turn: payment is partly cursed unless purified before banking

Eligibility: Rank C+; level >= 10; background: mountain. Reward: 330 gold, 30 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Departure Oath | social | a frost-bitten courier entrusts a veiled bride walking uphill in summer snow to the heir under guild witness. |
| 2 | Road Temper | social | The escorted party reveals a flaw, fear, or secret before danger appears. |
| 3 | First Delay | hazard | Weather, mud, gossip, or a closed gate threatens the schedule. |
| 4 | Watcher Sign | discovery | The heir spots icebound vows tracking the party. |
| 5 | Meal by Bad Light | social | A rest scene tests morale and lets the heir ask why the escort matters. |
| 6 | Ambush Geometry | combat | The route narrows into a tactical choice: protect the charge, flank, or flee. |
| 7 | The Hidden Cargo | discovery | The escort changes meaning when the heir learns payment is partly cursed unless purified before banking. |
| 8 | No Clean Path | choice | One path is safe but slow; the other is dangerous but may preserve the full reward. |
| 9 | Final Gate | hazard | The destination itself rejects entry until a vow, bribe, or skill check succeeds. |
| 10 | Witnessed Arrival | reward | The guild records successful escort and pays according to survival and honesty. |

### mis_smugglers-of-the-salted-dead — Smugglers of the Salted Dead

Rank C | Difficulty: moderate-dangerous | Min level: 10 | Setting: coast | Tone: moderate | Arc: sabotage | Scene: storm_coast/fishing_dock

Client: the lighthouse widow | Focus: coffins moved through the harbor as contraband | Main threat: storm hags | Lore turn: the final clue only appears after dusk

Eligibility: Rank C+; level >= 10; background: coast. Reward: 337 gold, 30 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Quiet Writ | social | the lighthouse widow wants coffins moved through the harbor as contraband ruined without open guild scandal. |
| 2 | Pattern Study | discovery | The heir watches guards, tides, bells, or patrols to find the weak hour. |
| 3 | Tool Choice | choice | Poison, false order, fire, lockwork, or prayer gives different risk profiles. |
| 4 | Inside Help | social | An insider helps only if paid, threatened, forgiven, or promised escape. |
| 5 | Unexpected Innocent | hazard | A bystander stands inside the blast radius of the plan. |
| 6 | Why It Exists | discovery | The heir learns the final clue only appears after dusk, complicating the job. |
| 7 | Silent Strike | hazard | The sabotage attempt demands dexterity, intelligence, class, or luck. |
| 8 | Alarm Breaks | combat | The alarm sounds anyway and storm hags respond. |
| 9 | Evidence Burn | choice | Destroy proof, preserve proof, or frame a rival. |
| 10 | No Applause | reward | The guild pays discreetly; infamy may rise even on perfect success. |

### mis_the-reed-witchs-dowry — The Reed Witch's Dowry

Rank C | Difficulty: moderate-dangerous | Min level: 10 | Setting: swamp | Tone: moderate | Arc: negotiate | Scene: black_mire/reed_path

Client: reed-cutter Faye | Focus: a dowry chest demanded by a fen witch | Main threat: reed witches | Lore turn: a rival heir already failed here and left a warning mark

Eligibility: Rank C+; level >= 10; background: swamp. Reward: 344 gold, 31 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Terms on the Board | social | reed-cutter Faye needs the heir to bargain over a dowry chest demanded by a fen witch, not simply draw steel. |
| 2 | Know the Other Side | discovery | The heir learns what reed witches actually want. |
| 3 | Token of Good Faith | choice | Bring a gift, hostage, oath, or insult; each changes the negotiation table. |
| 4 | Neutral Ground | hazard | The meeting place itself threatens both sides. |
| 5 | Opening Demand | social | The opposing party asks for more than the client admitted was possible. |
| 6 | Buried Clause | discovery | The old law or pact reveals a rival heir already failed here and left a warning mark. |
| 7 | Bad Actor | combat | Someone tries to ruin the talks with sudden violence. |
| 8 | Final Offer | choice | The heir can choose peace, profit, humiliation, or war. |
| 9 | Oath Binding | hazard | The agreement binds magically; breaking it later may trigger a secret event. |
| 10 | Signed Before Witness | reward | The guild pays for settlement, with infamy, morale, or bloodline effects based on terms. |

### mis_the-old-keeps-missing-stair — The Old Keep's Missing Stair

Rank C | Difficulty: moderate-dangerous | Min level: 10 | Setting: ruins | Tone: moderate | Arc: retrieve | Scene: fallen_tower/old_keep

Client: guild historian Emre | Focus: a staircase stolen from a ruined keep | Main threat: statue sentries | Lore turn: the safest route would abandon someone helpless

Eligibility: Rank C+; level >= 10; background: ruins. Reward: 351 gold, 31 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Written Claim | social | guild historian Emre claims a staircase stolen from a ruined keep must be recovered before rival hands reach it. |
| 2 | Owner's Mark | discovery | The heir identifies the object's mark and one unsettling sign of statue sentries nearby. |
| 3 | Price of Entry | hazard | A guard, lock, tide, or curse demands supplies, gold, or a stat check. |
| 4 | Competing Hand | social | A second claimant offers coin to walk away from the contract. |
| 5 | Container Trap | hazard | The object's case is trapped; rogues, mages, and clerics each see different warnings. |
| 6 | True Provenance | discovery | A hidden inscription reveals the safest route would abandon someone helpless. |
| 7 | Weight of the Thing | choice | Carrying a staircase stolen from a ruined keep burdens the heir: speed, stealth, or morale must be sacrificed. |
| 8 | The Pursuit | combat | statue sentries pursue the recovered object through the ruins scene. |
| 9 | Clean Hands | social | The heir decides whether to reveal the truth, hide it, or mark the client as suspect. |
| 10 | Sealed Receipt | reward | The guild issues pay and rank XP; the item may also unlock a later secret event. |

### mis_the-prisoner-with-no-name — The Prisoner with No Name

Rank C | Difficulty: moderate-dangerous | Min level: 10 | Setting: dungeon | Tone: moderate | Arc: rescue | Scene: dungeon_hall/iron_gate

Client: a prisoner's mother | Focus: a nameless prisoner erased from the gaol book | Main threat: gaoler shades | Lore turn: the client omits a blood debt owed by their grandparent

Eligibility: Rank C+; level >= 10; background: dungeon. Reward: 358 gold, 32 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Frantic Posting | social | a prisoner's mother begs the heir to recover a nameless prisoner erased from the gaol book; delay lowers the rescue reward. |
| 2 | Last Sighting | discovery | A child, track, or dropped token places the missing soul at the edge of the dungeon scene. |
| 3 | False Trail | hazard | A tempting trail wastes supplies unless the heir passes luck or intelligence. |
| 4 | Quiet Call | social | The heir hears a weak answer, but gaoler shades answer from another direction. |
| 5 | Blocked Reach | hazard | Stone, thorns, tide, or locked iron blocks the path and demands a class-flavored solution. |
| 6 | The Captor's Reason | discovery | The mission turns when the heir learns the client omits a blood debt owed by their grandparent. |
| 7 | Breath and Panic | choice | The rescued target panics; charisma, faith, or a gentle item can prevent injury. |
| 8 | Carry or Clear | hazard | The heir chooses to carry the rescued target slowly or clear danger first. |
| 9 | Breakout | combat | The last obstacle attacks during escape; losing may kill the heir or the target. |
| 10 | Returned Alive | reward | a prisoner's mother pays through tears, and the line gains rank XP for saving a nameless prisoner erased from the gaol book. |

### mis_the-road-that-collects-shoes — The Road That Collects Shoes

Rank C | Difficulty: moderate-dangerous | Min level: 10 | Setting: road | Tone: moderate | Arc: investigate | Scene: king_road/old_bridge

Client: carter Unn | Focus: a road lined with empty shoes facing west | Main threat: hungry bridges | Lore turn: payment is partly cursed unless purified before banking

Eligibility: Rank C+; level >= 10; background: road. Reward: 365 gold, 32 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Thin Notice | social | The board notice says little; carter Unn fears the truth around a road lined with empty shoes facing west more than the cost. |
| 2 | Interview One | social | The first witness lies badly, revealing pressure from hungry bridges. |
| 3 | Physical Clue | discovery | A mark, smell, or damaged object anchors the mystery in the road scene. |
| 4 | Contradiction | discovery | The heir finds evidence that makes the client's version impossible. |
| 5 | Street or Trail Pressure | hazard | Someone tries to scare the heir away with poison, ambush, or public shame. |
| 6 | Old Record | discovery | A ledger, gravestone, map, or hymn reveals payment is partly cursed unless purified before banking. |
| 7 | Accusation | social | The heir can accuse openly, bait a confession, or keep silent for more evidence. |
| 8 | Proof Under Fire | combat | The culprit or curse lashes out when proof is taken. |
| 9 | Judgment Call | choice | The heir chooses guild law, local mercy, or profitable blackmail. |
| 10 | Filed Truth | reward | The completed report grants pay, rank XP, and possible infamy shift. |

### mis_underchapel-of-the-ninth-bell — Underchapel of the Ninth Bell

Rank C | Difficulty: moderate-dangerous | Min level: 10 | Setting: crypt | Tone: moderate | Arc: delve | Scene: chapel_crypt/bone_vault

Client: a mourner in black gloves | Focus: the chapel vault below the ninth bell rope | Main threat: restless ancestors | Lore turn: the final clue only appears after dusk

Eligibility: Rank C+; level >= 10; background: crypt. Secret: Requires Crows in the Chapel Yard or Candle Smoke in Bracken Chapel. Reward: 372 gold, 33 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Key and Map | social | a mourner in black gloves gives the heir a flawed map toward the chapel vault below the ninth bell rope. |
| 2 | Threshold Test | hazard | The entrance demands rope, torch, prayer, or blood before opening safely. |
| 3 | First Chamber | discovery | The architecture reveals who built this place and why they feared restless ancestors. |
| 4 | Resource Drain | hazard | Darkness, rot, hunger, or silence drains supplies and morale. |
| 5 | Old Body | discovery | A corpse from an earlier expedition reveals the final clue only appears after dusk. |
| 6 | Choice of Depths | choice | One route is short and trapped; another is long and haunted. |
| 7 | Guardian Room | combat | A guardian tests whether the heir belongs below. |
| 8 | Treasure With Teeth | hazard | The objective is trapped, aware, or bound to the site. |
| 9 | Escape Collapse | combat | Taking the chapel vault below the ninth bell rope wakes the final defense and turns the return into a chase. |
| 10 | Surface Reckoning | reward | The guild pays, but the heir may carry a dungeon mark into later runs. |

### mis_the-laughing-quarry — The Laughing Quarry

Rank C | Difficulty: moderate-dangerous | Min level: 10 | Setting: mountain | Tone: moderate | Arc: hunt | Scene: snow_pass/cliff_shrine

Client: stonewright Hala | Focus: a quarry echo that laughs before rockfall | Main threat: goat demons | Lore turn: a rival heir already failed here and left a warning mark

Eligibility: Rank C+; level >= 10; background: mountain. Reward: 379 gold, 33 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Kill Writ | social | stonewright Hala posts a hunt for a quarry echo that laughs before rockfall; the writ warns that goat demons have learned human habits. |
| 2 | Track Bed | discovery | The heir finds tracks that do not match the creature's supposed shape. |
| 3 | Bait Decision | choice | Use bought bait, personal blood, or a risky decoy to draw the quarry. |
| 4 | Hunter Becomes Hunted | hazard | The quarry circles behind the heir, costing supplies or morale. |
| 5 | Victim Remnant | discovery | A survivor, bone, or torn charm reveals a rival heir already failed here and left a warning mark. |
| 6 | Lair Threshold | hazard | The lair terrain favors the quarry and demands a class or stat response. |
| 7 | First Clash | combat | The heir wounds the target but learns it has a second form or hidden ally. |
| 8 | Mercy Window | choice | A chance appears to spare, bind, or finish the target for different consequences. |
| 9 | Blood Price | combat | The final hunt resolves; failure can kill the heir outright. |
| 10 | Trophy and Doubt | reward | The trophy earns rank XP, but the chronicle notes whether the kill was just. |

### mis_ink-plague-in-the-clerkhouse — Ink Plague in the Clerkhouse

Rank C | Difficulty: moderate-dangerous | Min level: 10 | Setting: town | Tone: moderate | Arc: seal | Scene: town_market/tavern_street

Client: widow Mara | Focus: a plague spreading through signatures and seals | Main threat: debt spirits | Lore turn: the safest route would abandon someone helpless

Eligibility: Rank C+; level >= 10; background: town. Reward: 386 gold, 34 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Containment Order | social | widow Mara asks the heir to seal a plague spreading through signatures and seals before it spreads. |
| 2 | Measure the Leak | discovery | The heir maps how the curse, breach, or omen escapes into the town scene. |
| 3 | Gather Components | hazard | The seal needs salt, iron, ash, true names, or blood gathered under pressure. |
| 4 | False Seal | discovery | A prior seal failed because someone profited from weakness. |
| 5 | Interruption | combat | debt spirits attack while the components are prepared. |
| 6 | The Cost Named | choice | The working demands gold, HP, morale, an item, or a future secret debt. |
| 7 | Lore Reversal | discovery | The heir learns the safest route would abandon someone helpless, changing what must be sealed. |
| 8 | Circle Holds | hazard | A timed check determines whether the seal stabilizes or backlashes. |
| 9 | Last Nail | choice | The heir chooses a merciful seal, a harsh seal, or a profitable unstable seal. |
| 10 | Quiet for Now | reward | The guild pays for containment; an unstable choice seeds a future event. |

## Rank B Contracts

### mis_the-ash-wolf-of-crowfen — The Ash-Wolf of Crowfen

Rank B | Difficulty: dangerous | Min level: 15 | Setting: swamp | Tone: dangerous | Arc: hunt | Scene: black_mire/reed_path

Client: a leechwife | Focus: an ash-gray wolf walking on two legs | Main threat: bog lights | Lore turn: the final clue only appears after dusk

Eligibility: Rank B+; level >= 15; background: swamp. Reward: 393 gold, 34 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Kill Writ | social | a leechwife posts a hunt for an ash-gray wolf walking on two legs; the writ warns that bog lights have learned human habits. |
| 2 | Track Bed | discovery | The heir finds tracks that do not match the creature's supposed shape. |
| 3 | Bait Decision | choice | Use bought bait, personal blood, or a risky decoy to draw the quarry. |
| 4 | Hunter Becomes Hunted | hazard | The quarry circles behind the heir, costing supplies or morale. |
| 5 | Victim Remnant | discovery | A survivor, bone, or torn charm reveals the final clue only appears after dusk. |
| 6 | Lair Threshold | hazard | The lair terrain favors the quarry and demands a class or stat response. |
| 7 | First Clash | combat | The heir wounds the target but learns it has a second form or hidden ally. |
| 8 | Mercy Window | choice | A chance appears to spare, bind, or finish the target for different consequences. |
| 9 | Blood Price | combat | The final hunt resolves; failure can kill the heir outright. |
| 10 | Trophy and Doubt | reward | The trophy earns rank XP, but the chronicle notes whether the kill was just. |

### mis_trial-of-the-glass-abbey — Trial of the Glass Abbey

Rank B | Difficulty: dangerous | Min level: 15 | Setting: mountain | Tone: dangerous | Arc: pilgrimage | Scene: snow_pass/cliff_shrine

Client: stonewright Hala | Focus: a glass abbey seen only by the guilty | Main threat: thin-air phantoms | Lore turn: a rival heir already failed here and left a warning mark

Eligibility: Rank B+; level >= 15; background: mountain. Reward: 400 gold, 35 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Vow Accepted | social | stonewright Hala sends the heir toward a glass abbey seen only by the guilty under a vow witnessed by the guild. |
| 2 | First Hard Mile | hazard | The journey tests supplies, constitution, and the heir's willingness to turn back. |
| 3 | Fellow Traveler | social | A stranger shares food and a warning about thin-air phantoms. |
| 4 | Trial of Humility | choice | The heir must surrender comfort, coin, pride, or a secret to continue. |
| 5 | Sacred Refusal | hazard | The holy place refuses an unprepared heir with weather, silence, or pain. |
| 6 | Vision of the Line | discovery | A vision reveals a rival heir already failed here and left a warning mark and names a dead heir in the family chronicle. |
| 7 | Unclean Challenge | combat | A profane guardian blocks the last ascent or descent. |
| 8 | Prayer or Defiance | choice | The heir chooses obedience, bargaining, or defiance before the shrine. |
| 9 | Return Changed | hazard | Coming back is harder because the vow now has weight. |
| 10 | Witnessed Blessing | reward | The guild pays little, but the lineage may gain a rare blessing or scar. |

### mis_the-sunken-scriptorium — The Sunken Scriptorium

Rank B | Difficulty: dangerous | Min level: 15 | Setting: ruins | Tone: dangerous | Arc: delve | Scene: fallen_tower/old_keep

Client: antiquary Voss | Focus: a library drowned under an old royal road | Main threat: relic thieves | Lore turn: the safest route would abandon someone helpless

Eligibility: Rank B+; level >= 15; background: ruins. Reward: 407 gold, 35 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Key and Map | social | antiquary Voss gives the heir a flawed map toward a library drowned under an old royal road. |
| 2 | Threshold Test | hazard | The entrance demands rope, torch, prayer, or blood before opening safely. |
| 3 | First Chamber | discovery | The architecture reveals who built this place and why they feared relic thieves. |
| 4 | Resource Drain | hazard | Darkness, rot, hunger, or silence drains supplies and morale. |
| 5 | Old Body | discovery | A corpse from an earlier expedition reveals the safest route would abandon someone helpless. |
| 6 | Choice of Depths | choice | One route is short and trapped; another is long and haunted. |
| 7 | Guardian Room | combat | A guardian tests whether the heir belongs below. |
| 8 | Treasure With Teeth | hazard | The objective is trapped, aware, or bound to the site. |
| 9 | Escape Collapse | combat | Taking a library drowned under an old royal road wakes the final defense and turns the return into a chase. |
| 10 | Surface Reckoning | reward | The guild pays, but the heir may carry a dungeon mark into later runs. |

### mis_the-chain-saints-cell — The Chain Saint's Cell

Rank B | Difficulty: dangerous | Min level: 15 | Setting: dungeon | Tone: dangerous | Arc: exorcise | Scene: dungeon_hall/iron_gate

Client: guild examiner Vos | Focus: a saint chained beneath the gaol chapel | Main threat: living chains | Lore turn: the client omits a blood debt owed by their grandparent

Eligibility: Rank B+; level >= 15; background: dungeon. Reward: 414 gold, 36 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Holy Writ | social | guild examiner Vos asks for a saint chained beneath the gaol chapel to be quieted, burned, named, or forgiven. |
| 2 | Boundary Salt | discovery | The heir maps the haunting's boundary and where living chains gather. |
| 3 | Name the Dead | social | A living relative or old inscription gives the spirit a usable name. |
| 4 | Wrong Rite | hazard | A common rite worsens the haunting unless faith or intelligence catches the flaw. |
| 5 | Memory Scene | discovery | The ghost shows the heir a fragment proving the client omits a blood debt owed by their grandparent. |
| 6 | Offering Choice | choice | Gold, blood, apology, or relic ash may calm the spirit at different costs. |
| 7 | Possessed Object | combat | An object or corpse attacks while the rite is prepared. |
| 8 | Last Confession | social | The heir chooses whether to expose the truth to the living. |
| 9 | Banish or Bind | hazard | The final rite risks curse, death, or a bloodline-scoped scar. |
| 10 | Quiet Ground | reward | The dead settle; the guild pays and may add a blessing if mercy was shown. |

### mis_the-eel-queens-tribute — The Eel Queen's Tribute

Rank B | Difficulty: dangerous | Min level: 15 | Setting: coast | Tone: dangerous | Arc: negotiate | Scene: storm_coast/fishing_dock

Client: the lighthouse widow | Focus: tribute demanded by the eel queen at neap tide | Main threat: salt revenants | Lore turn: payment is partly cursed unless purified before banking

Eligibility: Rank B+; level >= 15; background: coast. Reward: 421 gold, 36 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Terms on the Board | social | the lighthouse widow needs the heir to bargain over tribute demanded by the eel queen at neap tide, not simply draw steel. |
| 2 | Know the Other Side | discovery | The heir learns what salt revenants actually want. |
| 3 | Token of Good Faith | choice | Bring a gift, hostage, oath, or insult; each changes the negotiation table. |
| 4 | Neutral Ground | hazard | The meeting place itself threatens both sides. |
| 5 | Opening Demand | social | The opposing party asks for more than the client admitted was possible. |
| 6 | Buried Clause | discovery | The old law or pact reveals payment is partly cursed unless purified before banking. |
| 7 | Bad Actor | combat | Someone tries to ruin the talks with sudden violence. |
| 8 | Final Offer | choice | The heir can choose peace, profit, humiliation, or war. |
| 9 | Oath Binding | hazard | The agreement binds magically; breaking it later may trigger a secret event. |
| 10 | Signed Before Witness | reward | The guild pays for settlement, with infamy, morale, or bloodline effects based on terms. |

### mis_a-crown-in-the-charcoal-wood — A Crown in the Charcoal Wood

Rank B | Difficulty: dangerous | Min level: 15 | Setting: forest | Tone: dangerous | Arc: retrieve | Scene: forest_briar/moonlit_wood

Client: warden Ilya | Focus: a rusted crown grown through an ancient oak | Main threat: thorn wolves | Lore turn: the final clue only appears after dusk

Eligibility: Rank B+; level >= 15; background: forest. Reward: 428 gold, 37 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Written Claim | social | warden Ilya claims a rusted crown grown through an ancient oak must be recovered before rival hands reach it. |
| 2 | Owner's Mark | discovery | The heir identifies the object's mark and one unsettling sign of thorn wolves nearby. |
| 3 | Price of Entry | hazard | A guard, lock, tide, or curse demands supplies, gold, or a stat check. |
| 4 | Competing Hand | social | A second claimant offers coin to walk away from the contract. |
| 5 | Container Trap | hazard | The object's case is trapped; rogues, mages, and clerics each see different warnings. |
| 6 | True Provenance | discovery | A hidden inscription reveals the final clue only appears after dusk. |
| 7 | Weight of the Thing | choice | Carrying a rusted crown grown through an ancient oak burdens the heir: speed, stealth, or morale must be sacrificed. |
| 8 | The Pursuit | combat | thorn wolves pursue the recovered object through the forest scene. |
| 9 | Clean Hands | social | The heir decides whether to reveal the truth, hide it, or mark the client as suspect. |
| 10 | Sealed Receipt | reward | The guild issues pay and rank XP; the item may also unlock a later secret event. |

### mis_the-hollow-dukes-hunt — The Hollow Duke's Hunt

Rank B | Difficulty: dangerous | Min level: 15 | Setting: road | Tone: dangerous | Arc: defend | Scene: king_road/old_bridge

Client: messenger Priel | Focus: a spectral noble hunting common travelers | Main threat: false pilgrims | Lore turn: a rival heir already failed here and left a warning mark

Eligibility: Rank B+; level >= 15; background: road. Reward: 435 gold, 37 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Alarm Bell | social | messenger Priel hires the heir to hold a spectral noble hunting common travelers until dawn or relief. |
| 2 | Survey Defenses | discovery | The heir identifies weak doors, frightened locals, and where false pilgrims will enter. |
| 3 | Limited Hands | choice | Assign workers, spend supplies, or take a dangerous solo position. |
| 4 | First Probe | combat | A small attack tests the defenses and exposes the real strategy. |
| 5 | Panic in the Ranks | social | Morale threatens collapse unless the heir inspires, threatens, or pays the defenders. |
| 6 | Hidden Breach | hazard | A tunnel, mirror, window, or sewer creates a second front. |
| 7 | Revealed Motive | discovery | The siege makes sense when the heir learns a rival heir already failed here and left a warning mark. |
| 8 | Last Reserve | choice | Spend the emergency reserve now or save it for the final wave. |
| 9 | Dawn Assault | combat | The heaviest attack comes just before safety; failure may kill civilians and the heir. |
| 10 | Count the Living | reward | Reward scales with survivors, property saved, and whether the heir kept faith. |

### mis_red-rain-over-the-market — Red Rain over the Market

Rank B | Difficulty: dangerous | Min level: 15 | Setting: town | Tone: dangerous | Arc: seal | Scene: town_market/tavern_street

Client: guild clerk Ren | Focus: rain that stains debts onto skin | Main threat: well-water omens | Lore turn: the safest route would abandon someone helpless

Eligibility: Rank B+; level >= 15; background: town. Reward: 442 gold, 38 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Containment Order | social | guild clerk Ren asks the heir to seal rain that stains debts onto skin before it spreads. |
| 2 | Measure the Leak | discovery | The heir maps how the curse, breach, or omen escapes into the town scene. |
| 3 | Gather Components | hazard | The seal needs salt, iron, ash, true names, or blood gathered under pressure. |
| 4 | False Seal | discovery | A prior seal failed because someone profited from weakness. |
| 5 | Interruption | combat | well-water omens attack while the components are prepared. |
| 6 | The Cost Named | choice | The working demands gold, HP, morale, an item, or a future secret debt. |
| 7 | Lore Reversal | discovery | The heir learns the safest route would abandon someone helpless, changing what must be sealed. |
| 8 | Circle Holds | hazard | A timed check determines whether the seal stabilizes or backlashes. |
| 9 | Last Nail | choice | The heir chooses a merciful seal, a harsh seal, or a profitable unstable seal. |
| 10 | Quiet for Now | reward | The guild pays for containment; an unstable choice seeds a future event. |

### mis_the-mine-that-remembers-names — The Mine That Remembers Names

Rank B | Difficulty: dangerous | Min level: 15 | Setting: cave | Tone: dangerous | Arc: rescue | Scene: cave_mouth/deep_mine

Client: foreman Pell | Focus: lost miners called deeper by their mothers' voices | Main threat: mine-gas whispers | Lore turn: the client omits a blood debt owed by their grandparent

Eligibility: Rank B+; level >= 15; background: cave. Reward: 449 gold, 38 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Frantic Posting | social | foreman Pell begs the heir to recover lost miners called deeper by their mothers' voices; delay lowers the rescue reward. |
| 2 | Last Sighting | discovery | A child, track, or dropped token places the missing soul at the edge of the cave scene. |
| 3 | False Trail | hazard | A tempting trail wastes supplies unless the heir passes luck or intelligence. |
| 4 | Quiet Call | social | The heir hears a weak answer, but mine-gas whispers answer from another direction. |
| 5 | Blocked Reach | hazard | Stone, thorns, tide, or locked iron blocks the path and demands a class-flavored solution. |
| 6 | The Captor's Reason | discovery | The mission turns when the heir learns the client omits a blood debt owed by their grandparent. |
| 7 | Breath and Panic | choice | The rescued target panics; charisma, faith, or a gentle item can prevent injury. |
| 8 | Carry or Clear | hazard | The heir chooses to carry the rescued target slowly or clear danger first. |
| 9 | Breakout | combat | The last obstacle attacks during escape; losing may kill the heir or the target. |
| 10 | Returned Alive | reward | foreman Pell pays through tears, and the line gains rank XP for saving lost miners called deeper by their mothers' voices. |

### mis_tomb-of-the-unmarried-king — Tomb of the Unmarried King

Rank B | Difficulty: dangerous | Min level: 15 | Setting: crypt | Tone: dangerous | Arc: delve | Scene: chapel_crypt/bone_vault

Client: a mourner in black gloves | Focus: a king's tomb missing every queenly name | Main threat: curse plaques | Lore turn: payment is partly cursed unless purified before banking

Eligibility: Rank B+; level >= 15; background: crypt. Secret: Requires infamy <= 3 or a Cleric heir. Reward: 456 gold, 39 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Key and Map | social | a mourner in black gloves gives the heir a flawed map toward a king's tomb missing every queenly name. |
| 2 | Threshold Test | hazard | The entrance demands rope, torch, prayer, or blood before opening safely. |
| 3 | First Chamber | discovery | The architecture reveals who built this place and why they feared curse plaques. |
| 4 | Resource Drain | hazard | Darkness, rot, hunger, or silence drains supplies and morale. |
| 5 | Old Body | discovery | A corpse from an earlier expedition reveals payment is partly cursed unless purified before banking. |
| 6 | Choice of Depths | choice | One route is short and trapped; another is long and haunted. |
| 7 | Guardian Room | combat | A guardian tests whether the heir belongs below. |
| 8 | Treasure With Teeth | hazard | The objective is trapped, aware, or bound to the site. |
| 9 | Escape Collapse | combat | Taking a king's tomb missing every queenly name wakes the final defense and turns the return into a chase. |
| 10 | Surface Reckoning | reward | The guild pays, but the heir may carry a dungeon mark into later runs. |

### mis_the-bridge-masons-pact — The Bridge Mason's Pact

Rank B | Difficulty: dangerous | Min level: 15 | Setting: road | Tone: dangerous | Arc: negotiate | Scene: king_road/old_bridge

Client: a masked tax scribe | Focus: a bridge demon owed seven unpaid promises | Main threat: bandit tolls | Lore turn: the final clue only appears after dusk

Eligibility: Rank B+; level >= 15; background: road. Reward: 463 gold, 39 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Terms on the Board | social | a masked tax scribe needs the heir to bargain over a bridge demon owed seven unpaid promises, not simply draw steel. |
| 2 | Know the Other Side | discovery | The heir learns what bandit tolls actually want. |
| 3 | Token of Good Faith | choice | Bring a gift, hostage, oath, or insult; each changes the negotiation table. |
| 4 | Neutral Ground | hazard | The meeting place itself threatens both sides. |
| 5 | Opening Demand | social | The opposing party asks for more than the client admitted was possible. |
| 6 | Buried Clause | discovery | The old law or pact reveals the final clue only appears after dusk. |
| 7 | Bad Actor | combat | Someone tries to ruin the talks with sudden violence. |
| 8 | Final Offer | choice | The heir can choose peace, profit, humiliation, or war. |
| 9 | Oath Binding | hazard | The agreement binds magically; breaking it later may trigger a secret event. |
| 10 | Signed Before Witness | reward | The guild pays for settlement, with infamy, morale, or bloodline effects based on terms. |

### mis_the-raven-tax — The Raven Tax

Rank B | Difficulty: dangerous | Min level: 15 | Setting: forest | Tone: dangerous | Arc: sabotage | Scene: forest_briar/moonlit_wood

Client: warden Ilya | Focus: ravens collecting teeth as forest tithe | Main threat: hungry trees | Lore turn: a rival heir already failed here and left a warning mark

Eligibility: Rank B+; level >= 15; background: forest. Reward: 470 gold, 40 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Quiet Writ | social | warden Ilya wants ravens collecting teeth as forest tithe ruined without open guild scandal. |
| 2 | Pattern Study | discovery | The heir watches guards, tides, bells, or patrols to find the weak hour. |
| 3 | Tool Choice | choice | Poison, false order, fire, lockwork, or prayer gives different risk profiles. |
| 4 | Inside Help | social | An insider helps only if paid, threatened, forgiven, or promised escape. |
| 5 | Unexpected Innocent | hazard | A bystander stands inside the blast radius of the plan. |
| 6 | Why It Exists | discovery | The heir learns a rival heir already failed here and left a warning mark, complicating the job. |
| 7 | Silent Strike | hazard | The sabotage attempt demands dexterity, intelligence, class, or luck. |
| 8 | Alarm Breaks | combat | The alarm sounds anyway and hungry trees respond. |
| 9 | Evidence Burn | choice | Destroy proof, preserve proof, or frame a rival. |
| 10 | No Applause | reward | The guild pays discreetly; infamy may rise even on perfect success. |

## Rank A Contracts

### mis_cathedral-of-the-white-root — Cathedral of the White Root

Rank A | Difficulty: very dangerous | Min level: 22 | Setting: forest | Tone: dangerous | Arc: delve | Scene: forest_briar/moonlit_wood

Client: old poacher Venn | Focus: a root-cathedral growing beneath royal hunting land | Main threat: hungry trees | Lore turn: payment is partly cursed unless purified before banking

Eligibility: Rank A+; level >= 22; background: forest. Reward: 477 gold, 40 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Key and Map | social | old poacher Venn gives the heir a flawed map toward a root-cathedral growing beneath royal hunting land. |
| 2 | Threshold Test | hazard | The entrance demands rope, torch, prayer, or blood before opening safely. |
| 3 | First Chamber | discovery | The architecture reveals who built this place and why they feared hungry trees. |
| 4 | Resource Drain | hazard | Darkness, rot, hunger, or silence drains supplies and morale. |
| 5 | Old Body | discovery | A corpse from an earlier expedition reveals payment is partly cursed unless purified before banking. |
| 6 | Choice of Depths | choice | One route is short and trapped; another is long and haunted. |
| 7 | Guardian Room | combat | A guardian tests whether the heir belongs below. |
| 8 | Treasure With Teeth | hazard | The objective is trapped, aware, or bound to the site. |
| 9 | Escape Collapse | combat | Taking a root-cathedral growing beneath royal hunting land wakes the final defense and turns the return into a chase. |
| 10 | Surface Reckoning | reward | The guild pays, but the heir may carry a dungeon mark into later runs. |

### mis_the-iron-moon-below — The Iron Moon Below

Rank A | Difficulty: very dangerous | Min level: 22 | Setting: cave | Tone: dangerous | Arc: delve | Scene: cave_mouth/deep_mine

Client: guild delver Kett | Focus: a moon-shaped ore heart pulsing under the mountain | Main threat: old dwarven locks | Lore turn: the final clue only appears after dusk

Eligibility: Rank A+; level >= 22; background: cave. Reward: 484 gold, 41 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Key and Map | social | guild delver Kett gives the heir a flawed map toward a moon-shaped ore heart pulsing under the mountain. |
| 2 | Threshold Test | hazard | The entrance demands rope, torch, prayer, or blood before opening safely. |
| 3 | First Chamber | discovery | The architecture reveals who built this place and why they feared old dwarven locks. |
| 4 | Resource Drain | hazard | Darkness, rot, hunger, or silence drains supplies and morale. |
| 5 | Old Body | discovery | A corpse from an earlier expedition reveals the final clue only appears after dusk. |
| 6 | Choice of Depths | choice | One route is short and trapped; another is long and haunted. |
| 7 | Guardian Room | combat | A guardian tests whether the heir belongs below. |
| 8 | Treasure With Teeth | hazard | The objective is trapped, aware, or bound to the site. |
| 9 | Escape Collapse | combat | Taking a moon-shaped ore heart pulsing under the mountain wakes the final defense and turns the return into a chase. |
| 10 | Surface Reckoning | reward | The guild pays, but the heir may carry a dungeon mark into later runs. |

### mis_stormwake-lighthouse — Stormwake Lighthouse

Rank A | Difficulty: very dangerous | Min level: 22 | Setting: coast | Tone: dangerous | Arc: defend | Scene: storm_coast/fishing_dock

Client: fisher Jossa | Focus: a lighthouse beacon that summons shipwrecks | Main threat: storm hags | Lore turn: a rival heir already failed here and left a warning mark

Eligibility: Rank A+; level >= 22; background: coast. Reward: 491 gold, 41 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Alarm Bell | social | fisher Jossa hires the heir to hold a lighthouse beacon that summons shipwrecks until dawn or relief. |
| 2 | Survey Defenses | discovery | The heir identifies weak doors, frightened locals, and where storm hags will enter. |
| 3 | Limited Hands | choice | Assign workers, spend supplies, or take a dangerous solo position. |
| 4 | First Probe | combat | A small attack tests the defenses and exposes the real strategy. |
| 5 | Panic in the Ranks | social | Morale threatens collapse unless the heir inspires, threatens, or pays the defenders. |
| 6 | Hidden Breach | hazard | A tunnel, mirror, window, or sewer creates a second front. |
| 7 | Revealed Motive | discovery | The siege makes sense when the heir learns a rival heir already failed here and left a warning mark. |
| 8 | Last Reserve | choice | Spend the emergency reserve now or save it for the final wave. |
| 9 | Dawn Assault | combat | The heaviest attack comes just before safety; failure may kill civilians and the heir. |
| 10 | Count the Living | reward | Reward scales with survivors, property saved, and whether the heir kept faith. |

### mis_the-emperors-broken-road — The Emperor's Broken Road

Rank A | Difficulty: very dangerous | Min level: 22 | Setting: road | Tone: dangerous | Arc: escort | Scene: king_road/old_bridge

Client: messenger Priel | Focus: an imperial courier bearing a sealed abdication | Main threat: night riders | Lore turn: the safest route would abandon someone helpless

Eligibility: Rank A+; level >= 22; background: road. Reward: 498 gold, 42 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Departure Oath | social | messenger Priel entrusts an imperial courier bearing a sealed abdication to the heir under guild witness. |
| 2 | Road Temper | social | The escorted party reveals a flaw, fear, or secret before danger appears. |
| 3 | First Delay | hazard | Weather, mud, gossip, or a closed gate threatens the schedule. |
| 4 | Watcher Sign | discovery | The heir spots night riders tracking the party. |
| 5 | Meal by Bad Light | social | A rest scene tests morale and lets the heir ask why the escort matters. |
| 6 | Ambush Geometry | combat | The route narrows into a tactical choice: protect the charge, flank, or flee. |
| 7 | The Hidden Cargo | discovery | The escort changes meaning when the heir learns the safest route would abandon someone helpless. |
| 8 | No Clean Path | choice | One path is safe but slow; the other is dangerous but may preserve the full reward. |
| 9 | Final Gate | hazard | The destination itself rejects entry until a vow, bribe, or skill check succeeds. |
| 10 | Witnessed Arrival | reward | The guild records successful escort and pays according to survival and honesty. |

### mis_the-seven-faced-marshal — The Seven-Faced Marshal

Rank A | Difficulty: very dangerous | Min level: 22 | Setting: town | Tone: dangerous | Arc: investigate | Scene: town_market/tavern_street

Client: guild clerk Ren | Focus: a marshal wearing a different face each morning | Main threat: debt spirits | Lore turn: the client omits a blood debt owed by their grandparent

Eligibility: Rank A+; level >= 22; background: town. Reward: 505 gold, 42 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Thin Notice | social | The board notice says little; guild clerk Ren fears the truth around a marshal wearing a different face each morning more than the cost. |
| 2 | Interview One | social | The first witness lies badly, revealing pressure from debt spirits. |
| 3 | Physical Clue | discovery | A mark, smell, or damaged object anchors the mystery in the town scene. |
| 4 | Contradiction | discovery | The heir finds evidence that makes the client's version impossible. |
| 5 | Street or Trail Pressure | hazard | Someone tries to scare the heir away with poison, ambush, or public shame. |
| 6 | Old Record | discovery | A ledger, gravestone, map, or hymn reveals the client omits a blood debt owed by their grandparent. |
| 7 | Accusation | social | The heir can accuse openly, bait a confession, or keep silent for more evidence. |
| 8 | Proof Under Fire | combat | The culprit or curse lashes out when proof is taken. |
| 9 | Judgment Call | choice | The heir chooses guild law, local mercy, or profitable blackmail. |
| 10 | Filed Truth | reward | The completed report grants pay, rank XP, and possible infamy shift. |

### mis_the-ogre-nun-of-winterpass — The Ogre Nun of Winterpass

Rank A | Difficulty: very dangerous | Min level: 22 | Setting: mountain | Tone: dangerous | Arc: negotiate | Scene: snow_pass/cliff_shrine

Client: goatherd Rusk | Focus: an ogre nun guarding the only pass | Main threat: thin-air phantoms | Lore turn: payment is partly cursed unless purified before banking

Eligibility: Rank A+; level >= 22; background: mountain. Reward: 512 gold, 43 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Terms on the Board | social | goatherd Rusk needs the heir to bargain over an ogre nun guarding the only pass, not simply draw steel. |
| 2 | Know the Other Side | discovery | The heir learns what thin-air phantoms actually want. |
| 3 | Token of Good Faith | choice | Bring a gift, hostage, oath, or insult; each changes the negotiation table. |
| 4 | Neutral Ground | hazard | The meeting place itself threatens both sides. |
| 5 | Opening Demand | social | The opposing party asks for more than the client admitted was possible. |
| 6 | Buried Clause | discovery | The old law or pact reveals payment is partly cursed unless purified before banking. |
| 7 | Bad Actor | combat | Someone tries to ruin the talks with sudden violence. |
| 8 | Final Offer | choice | The heir can choose peace, profit, humiliation, or war. |
| 9 | Oath Binding | hazard | The agreement binds magically; breaking it later may trigger a secret event. |
| 10 | Signed Before Witness | reward | The guild pays for settlement, with infamy, morale, or bloodline effects based on terms. |

### mis_the-leech-palace — The Leech Palace

Rank A | Difficulty: very dangerous | Min level: 22 | Setting: swamp | Tone: dangerous | Arc: delve | Scene: black_mire/reed_path

Client: a leechwife | Focus: a palace roofed with living leeches | Main threat: black-water serpents | Lore turn: the final clue only appears after dusk

Eligibility: Rank A+; level >= 22; background: swamp. Reward: 519 gold, 43 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Key and Map | social | a leechwife gives the heir a flawed map toward a palace roofed with living leeches. |
| 2 | Threshold Test | hazard | The entrance demands rope, torch, prayer, or blood before opening safely. |
| 3 | First Chamber | discovery | The architecture reveals who built this place and why they feared black-water serpents. |
| 4 | Resource Drain | hazard | Darkness, rot, hunger, or silence drains supplies and morale. |
| 5 | Old Body | discovery | A corpse from an earlier expedition reveals the final clue only appears after dusk. |
| 6 | Choice of Depths | choice | One route is short and trapped; another is long and haunted. |
| 7 | Guardian Room | combat | A guardian tests whether the heir belongs below. |
| 8 | Treasure With Teeth | hazard | The objective is trapped, aware, or bound to the site. |
| 9 | Escape Collapse | combat | Taking a palace roofed with living leeches wakes the final defense and turns the return into a chase. |
| 10 | Surface Reckoning | reward | The guild pays, but the heir may carry a dungeon mark into later runs. |

### mis_vault-of-borrowed-years — Vault of Borrowed Years

Rank A | Difficulty: very dangerous | Min level: 22 | Setting: dungeon | Tone: dangerous | Arc: retrieve | Scene: dungeon_hall/iron_gate

Client: a prisoner's mother | Focus: an hourglass that steals age from prisoners | Main threat: living chains | Lore turn: a rival heir already failed here and left a warning mark

Eligibility: Rank A+; level >= 22; background: dungeon. Reward: 526 gold, 44 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Written Claim | social | a prisoner's mother claims an hourglass that steals age from prisoners must be recovered before rival hands reach it. |
| 2 | Owner's Mark | discovery | The heir identifies the object's mark and one unsettling sign of living chains nearby. |
| 3 | Price of Entry | hazard | A guard, lock, tide, or curse demands supplies, gold, or a stat check. |
| 4 | Competing Hand | social | A second claimant offers coin to walk away from the contract. |
| 5 | Container Trap | hazard | The object's case is trapped; rogues, mages, and clerics each see different warnings. |
| 6 | True Provenance | discovery | A hidden inscription reveals a rival heir already failed here and left a warning mark. |
| 7 | Weight of the Thing | choice | Carrying an hourglass that steals age from prisoners burdens the heir: speed, stealth, or morale must be sacrificed. |
| 8 | The Pursuit | combat | living chains pursue the recovered object through the dungeon scene. |
| 9 | Clean Hands | social | The heir decides whether to reveal the truth, hide it, or mark the client as suspect. |
| 10 | Sealed Receipt | reward | The guild issues pay and rank XP; the item may also unlock a later secret event. |

### mis_the-lion-gate-without-a-wall — The Lion Gate Without a Wall

Rank A | Difficulty: very dangerous | Min level: 22 | Setting: ruins | Tone: dangerous | Arc: seal | Scene: fallen_tower/old_keep

Client: antiquary Voss | Focus: a gate opening to wars that never happened | Main threat: sunken archives | Lore turn: the safest route would abandon someone helpless

Eligibility: Rank A+; level >= 22; background: ruins. Reward: 533 gold, 44 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Containment Order | social | antiquary Voss asks the heir to seal a gate opening to wars that never happened before it spreads. |
| 2 | Measure the Leak | discovery | The heir maps how the curse, breach, or omen escapes into the ruins scene. |
| 3 | Gather Components | hazard | The seal needs salt, iron, ash, true names, or blood gathered under pressure. |
| 4 | False Seal | discovery | A prior seal failed because someone profited from weakness. |
| 5 | Interruption | combat | sunken archives attack while the components are prepared. |
| 6 | The Cost Named | choice | The working demands gold, HP, morale, an item, or a future secret debt. |
| 7 | Lore Reversal | discovery | The heir learns the safest route would abandon someone helpless, changing what must be sealed. |
| 8 | Circle Holds | hazard | A timed check determines whether the seal stabilizes or backlashes. |
| 9 | Last Nail | choice | The heir chooses a merciful seal, a harsh seal, or a profitable unstable seal. |
| 10 | Quiet for Now | reward | The guild pays for containment; an unstable choice seeds a future event. |

### mis_reliquary-of-the-hungry-choir — Reliquary of the Hungry Choir

Rank A | Difficulty: very dangerous | Min level: 22 | Setting: crypt | Tone: dangerous | Arc: exorcise | Scene: chapel_crypt/bone_vault

Client: a mourner in black gloves | Focus: a choir of skulls demanding new lungs | Main threat: bone choirs | Lore turn: the client omits a blood debt owed by their grandparent

Eligibility: Rank A+; level >= 22; background: crypt. Reward: 540 gold, 45 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Holy Writ | social | a mourner in black gloves asks for a choir of skulls demanding new lungs to be quieted, burned, named, or forgiven. |
| 2 | Boundary Salt | discovery | The heir maps the haunting's boundary and where bone choirs gather. |
| 3 | Name the Dead | social | A living relative or old inscription gives the spirit a usable name. |
| 4 | Wrong Rite | hazard | A common rite worsens the haunting unless faith or intelligence catches the flaw. |
| 5 | Memory Scene | discovery | The ghost shows the heir a fragment proving the client omits a blood debt owed by their grandparent. |
| 6 | Offering Choice | choice | Gold, blood, apology, or relic ash may calm the spirit at different costs. |
| 7 | Possessed Object | combat | An object or corpse attacks while the rite is prepared. |
| 8 | Last Confession | social | The heir chooses whether to expose the truth to the living. |
| 9 | Banish or Bind | hazard | The final rite risks curse, death, or a bloodline-scoped scar. |
| 10 | Quiet Ground | reward | The dead settle; the guild pays and may add a blessing if mercy was shown. |

### mis_the-vulture-parliament — The Vulture Parliament

Rank A | Difficulty: very dangerous | Min level: 22 | Setting: mountain | Tone: dangerous | Arc: negotiate | Scene: snow_pass/cliff_shrine

Client: stonewright Hala | Focus: vultures judging a murdered prince | Main threat: thin-air phantoms | Lore turn: payment is partly cursed unless purified before banking

Eligibility: Rank A+; level >= 22; background: mountain. Reward: 547 gold, 45 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Terms on the Board | social | stonewright Hala needs the heir to bargain over vultures judging a murdered prince, not simply draw steel. |
| 2 | Know the Other Side | discovery | The heir learns what thin-air phantoms actually want. |
| 3 | Token of Good Faith | choice | Bring a gift, hostage, oath, or insult; each changes the negotiation table. |
| 4 | Neutral Ground | hazard | The meeting place itself threatens both sides. |
| 5 | Opening Demand | social | The opposing party asks for more than the client admitted was possible. |
| 6 | Buried Clause | discovery | The old law or pact reveals payment is partly cursed unless purified before banking. |
| 7 | Bad Actor | combat | Someone tries to ruin the talks with sudden violence. |
| 8 | Final Offer | choice | The heir can choose peace, profit, humiliation, or war. |
| 9 | Oath Binding | hazard | The agreement binds magically; breaking it later may trigger a secret event. |
| 10 | Signed Before Witness | reward | The guild pays for settlement, with infamy, morale, or bloodline effects based on terms. |

### mis_the-guildmasters-black-warrant — The Guildmaster's Black Warrant

Rank A | Difficulty: very dangerous | Min level: 22 | Setting: town | Tone: dangerous | Arc: sabotage | Scene: town_market/tavern_street

Client: widow Mara | Focus: a warrant signed in extinct ink | Main threat: well-water omens | Lore turn: the final clue only appears after dusk

Eligibility: Rank A+; level >= 22; background: town. Reward: 554 gold, 46 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Quiet Writ | social | widow Mara wants a warrant signed in extinct ink ruined without open guild scandal. |
| 2 | Pattern Study | discovery | The heir watches guards, tides, bells, or patrols to find the weak hour. |
| 3 | Tool Choice | choice | Poison, false order, fire, lockwork, or prayer gives different risk profiles. |
| 4 | Inside Help | social | An insider helps only if paid, threatened, forgiven, or promised escape. |
| 5 | Unexpected Innocent | hazard | A bystander stands inside the blast radius of the plan. |
| 6 | Why It Exists | discovery | The heir learns the final clue only appears after dusk, complicating the job. |
| 7 | Silent Strike | hazard | The sabotage attempt demands dexterity, intelligence, class, or luck. |
| 8 | Alarm Breaks | combat | The alarm sounds anyway and well-water omens respond. |
| 9 | Evidence Burn | choice | Destroy proof, preserve proof, or frame a rival. |
| 10 | No Applause | reward | The guild pays discreetly; infamy may rise even on perfect success. |

## Rank S Contracts

### mis_the-starving-bell-tower — The Starving Bell-Tower

Rank S | Difficulty: lethal | Min level: 30 | Setting: town | Tone: lethal | Arc: seal | Scene: town_market/tavern_street

Client: sister Elowen | Focus: a bell-tower eating the hours of the town | Main threat: well-water omens | Lore turn: the client omits a blood debt owed by their grandparent

Eligibility: Rank S+; level >= 30; background: town. Reward: 561 gold, 46 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Containment Order | social | sister Elowen asks the heir to seal a bell-tower eating the hours of the town before it spreads. |
| 2 | Measure the Leak | discovery | The heir maps how the curse, breach, or omen escapes into the town scene. |
| 3 | Gather Components | hazard | The seal needs salt, iron, ash, true names, or blood gathered under pressure. |
| 4 | False Seal | discovery | A prior seal failed because someone profited from weakness. |
| 5 | Interruption | combat | well-water omens attack while the components are prepared. |
| 6 | The Cost Named | choice | The working demands gold, HP, morale, an item, or a future secret debt. |
| 7 | Lore Reversal | discovery | The heir learns the client omits a blood debt owed by their grandparent, changing what must be sealed. |
| 8 | Circle Holds | hazard | A timed check determines whether the seal stabilizes or backlashes. |
| 9 | Last Nail | choice | The heir chooses a merciful seal, a harsh seal, or a profitable unstable seal. |
| 10 | Quiet for Now | reward | The guild pays for containment; an unstable choice seeds a future event. |

### mis_wyrm-eggs-in-the-old-mine — Wyrm-Eggs in the Old Mine

Rank S | Difficulty: lethal | Min level: 30 | Setting: cave | Tone: lethal | Arc: hunt | Scene: cave_mouth/deep_mine

Client: guild delver Kett | Focus: wyrm-eggs warming in a forbidden vein | Main threat: mine-gas whispers | Lore turn: payment is partly cursed unless purified before banking

Eligibility: Rank S+; level >= 30; background: cave. Reward: 568 gold, 47 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Kill Writ | social | guild delver Kett posts a hunt for wyrm-eggs warming in a forbidden vein; the writ warns that mine-gas whispers have learned human habits. |
| 2 | Track Bed | discovery | The heir finds tracks that do not match the creature's supposed shape. |
| 3 | Bait Decision | choice | Use bought bait, personal blood, or a risky decoy to draw the quarry. |
| 4 | Hunter Becomes Hunted | hazard | The quarry circles behind the heir, costing supplies or morale. |
| 5 | Victim Remnant | discovery | A survivor, bone, or torn charm reveals payment is partly cursed unless purified before banking. |
| 6 | Lair Threshold | hazard | The lair terrain favors the quarry and demands a class or stat response. |
| 7 | First Clash | combat | The heir wounds the target but learns it has a second form or hidden ally. |
| 8 | Mercy Window | choice | A chance appears to spare, bind, or finish the target for different consequences. |
| 9 | Blood Price | combat | The final hunt resolves; failure can kill the heir outright. |
| 10 | Trophy and Doubt | reward | The trophy earns rank XP, but the chronicle notes whether the kill was just. |

### mis_the-forest-that-walks-north — The Forest That Walks North

Rank S | Difficulty: lethal | Min level: 30 | Setting: forest | Tone: lethal | Arc: defend | Scene: forest_briar/moonlit_wood

Client: warden Ilya | Focus: an entire forest uprooting toward the capital | Main threat: poacher snares | Lore turn: the final clue only appears after dusk

Eligibility: Rank S+; level >= 30; background: forest. Reward: 575 gold, 47 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Alarm Bell | social | warden Ilya hires the heir to hold an entire forest uprooting toward the capital until dawn or relief. |
| 2 | Survey Defenses | discovery | The heir identifies weak doors, frightened locals, and where poacher snares will enter. |
| 3 | Limited Hands | choice | Assign workers, spend supplies, or take a dangerous solo position. |
| 4 | First Probe | combat | A small attack tests the defenses and exposes the real strategy. |
| 5 | Panic in the Ranks | social | Morale threatens collapse unless the heir inspires, threatens, or pays the defenders. |
| 6 | Hidden Breach | hazard | A tunnel, mirror, window, or sewer creates a second front. |
| 7 | Revealed Motive | discovery | The siege makes sense when the heir learns the final clue only appears after dusk. |
| 8 | Last Reserve | choice | Spend the emergency reserve now or save it for the final wave. |
| 9 | Dawn Assault | combat | The heaviest attack comes just before safety; failure may kill civilians and the heir. |
| 10 | Count the Living | reward | Reward scales with survivors, property saved, and whether the heir kept faith. |

### mis_pilgrimage-to-the-knife-peak — Pilgrimage to the Knife Peak

Rank S | Difficulty: lethal | Min level: 30 | Setting: mountain | Tone: lethal | Arc: pilgrimage | Scene: snow_pass/cliff_shrine

Client: a frost-bitten courier | Focus: a peak that cuts oaths from the tongue | Main threat: white harpies | Lore turn: a rival heir already failed here and left a warning mark

Eligibility: Rank S+; level >= 30; background: mountain. Reward: 582 gold, 48 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Vow Accepted | social | a frost-bitten courier sends the heir toward a peak that cuts oaths from the tongue under a vow witnessed by the guild. |
| 2 | First Hard Mile | hazard | The journey tests supplies, constitution, and the heir's willingness to turn back. |
| 3 | Fellow Traveler | social | A stranger shares food and a warning about white harpies. |
| 4 | Trial of Humility | choice | The heir must surrender comfort, coin, pride, or a secret to continue. |
| 5 | Sacred Refusal | hazard | The holy place refuses an unprepared heir with weather, silence, or pain. |
| 6 | Vision of the Line | discovery | A vision reveals a rival heir already failed here and left a warning mark and names a dead heir in the family chronicle. |
| 7 | Unclean Challenge | combat | A profane guardian blocks the last ascent or descent. |
| 8 | Prayer or Defiance | choice | The heir chooses obedience, bargaining, or defiance before the shrine. |
| 9 | Return Changed | hazard | Coming back is harder because the vow now has weight. |
| 10 | Witnessed Blessing | reward | The guild pays little, but the lineage may gain a rare blessing or scar. |

### mis_the-drowned-armadas-admiral — The Drowned Armada's Admiral

Rank S | Difficulty: lethal | Min level: 30 | Setting: coast | Tone: lethal | Arc: negotiate | Scene: storm_coast/fishing_dock

Client: the lighthouse widow | Focus: an admiral commanding ships under the tide | Main threat: reef lights | Lore turn: the safest route would abandon someone helpless

Eligibility: Rank S+; level >= 30; background: coast. Reward: 589 gold, 48 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Terms on the Board | social | the lighthouse widow needs the heir to bargain over an admiral commanding ships under the tide, not simply draw steel. |
| 2 | Know the Other Side | discovery | The heir learns what reef lights actually want. |
| 3 | Token of Good Faith | choice | Bring a gift, hostage, oath, or insult; each changes the negotiation table. |
| 4 | Neutral Ground | hazard | The meeting place itself threatens both sides. |
| 5 | Opening Demand | social | The opposing party asks for more than the client admitted was possible. |
| 6 | Buried Clause | discovery | The old law or pact reveals the safest route would abandon someone helpless. |
| 7 | Bad Actor | combat | Someone tries to ruin the talks with sudden violence. |
| 8 | Final Offer | choice | The heir can choose peace, profit, humiliation, or war. |
| 9 | Oath Binding | hazard | The agreement binds magically; breaking it later may trigger a secret event. |
| 10 | Signed Before Witness | reward | The guild pays for settlement, with infamy, morale, or bloodline effects based on terms. |

### mis_the-black-fen-coronation — The Black Fen Coronation

Rank S | Difficulty: lethal | Min level: 30 | Setting: swamp | Tone: lethal | Arc: sabotage | Scene: black_mire/reed_path

Client: reed-cutter Faye | Focus: a bog coronation meant to crown a corpse | Main threat: black-water serpents | Lore turn: the client omits a blood debt owed by their grandparent

Eligibility: Rank S+; level >= 30; background: swamp. Reward: 596 gold, 49 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Quiet Writ | social | reed-cutter Faye wants a bog coronation meant to crown a corpse ruined without open guild scandal. |
| 2 | Pattern Study | discovery | The heir watches guards, tides, bells, or patrols to find the weak hour. |
| 3 | Tool Choice | choice | Poison, false order, fire, lockwork, or prayer gives different risk profiles. |
| 4 | Inside Help | social | An insider helps only if paid, threatened, forgiven, or promised escape. |
| 5 | Unexpected Innocent | hazard | A bystander stands inside the blast radius of the plan. |
| 6 | Why It Exists | discovery | The heir learns the client omits a blood debt owed by their grandparent, complicating the job. |
| 7 | Silent Strike | hazard | The sabotage attempt demands dexterity, intelligence, class, or luck. |
| 8 | Alarm Breaks | combat | The alarm sounds anyway and black-water serpents respond. |
| 9 | Evidence Burn | choice | Destroy proof, preserve proof, or frame a rival. |
| 10 | No Applause | reward | The guild pays discreetly; infamy may rise even on perfect success. |

### mis_the-road-of-one-thousand-graves — The Road of One Thousand Graves

Rank S | Difficulty: lethal | Min level: 30 | Setting: road | Tone: lethal | Arc: escort | Scene: king_road/old_bridge

Client: messenger Priel | Focus: a funeral train pursued by its own dead | Main threat: broken milestones | Lore turn: payment is partly cursed unless purified before banking

Eligibility: Rank S+; level >= 30; background: road. Reward: 603 gold, 49 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Departure Oath | social | messenger Priel entrusts a funeral train pursued by its own dead to the heir under guild witness. |
| 2 | Road Temper | social | The escorted party reveals a flaw, fear, or secret before danger appears. |
| 3 | First Delay | hazard | Weather, mud, gossip, or a closed gate threatens the schedule. |
| 4 | Watcher Sign | discovery | The heir spots broken milestones tracking the party. |
| 5 | Meal by Bad Light | social | A rest scene tests morale and lets the heir ask why the escort matters. |
| 6 | Ambush Geometry | combat | The route narrows into a tactical choice: protect the charge, flank, or flee. |
| 7 | The Hidden Cargo | discovery | The escort changes meaning when the heir learns payment is partly cursed unless purified before banking. |
| 8 | No Clean Path | choice | One path is safe but slow; the other is dangerous but may preserve the full reward. |
| 9 | Final Gate | hazard | The destination itself rejects entry until a vow, bribe, or skill check succeeds. |
| 10 | Witnessed Arrival | reward | The guild records successful escort and pays according to survival and honesty. |

### mis_dungeon-of-the-unmade-heir — Dungeon of the Unmade Heir

Rank S | Difficulty: lethal | Min level: 30 | Setting: dungeon | Tone: lethal | Arc: delve | Scene: dungeon_hall/iron_gate

Client: a prisoner's mother | Focus: a cell complex built for heirs not yet born | Main threat: rune traps | Lore turn: the final clue only appears after dusk

Eligibility: Rank S+; level >= 30; background: dungeon. Secret: Requires lineage generation >= 5. Reward: 610 gold, 50 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Key and Map | social | a prisoner's mother gives the heir a flawed map toward a cell complex built for heirs not yet born. |
| 2 | Threshold Test | hazard | The entrance demands rope, torch, prayer, or blood before opening safely. |
| 3 | First Chamber | discovery | The architecture reveals who built this place and why they feared rune traps. |
| 4 | Resource Drain | hazard | Darkness, rot, hunger, or silence drains supplies and morale. |
| 5 | Old Body | discovery | A corpse from an earlier expedition reveals the final clue only appears after dusk. |
| 6 | Choice of Depths | choice | One route is short and trapped; another is long and haunted. |
| 7 | Guardian Room | combat | A guardian tests whether the heir belongs below. |
| 8 | Treasure With Teeth | hazard | The objective is trapped, aware, or bound to the site. |
| 9 | Escape Collapse | combat | Taking a cell complex built for heirs not yet born wakes the final defense and turns the return into a chase. |
| 10 | Surface Reckoning | reward | The guild pays, but the heir may carry a dungeon mark into later runs. |

### mis_the-sunless-senate — The Sunless Senate

Rank S | Difficulty: lethal | Min level: 30 | Setting: ruins | Tone: lethal | Arc: investigate | Scene: fallen_tower/old_keep

Client: antiquary Voss | Focus: dead senators voting beneath the old forum | Main threat: statue sentries | Lore turn: a rival heir already failed here and left a warning mark

Eligibility: Rank S+; level >= 30; background: ruins. Reward: 617 gold, 50 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Thin Notice | social | The board notice says little; antiquary Voss fears the truth around dead senators voting beneath the old forum more than the cost. |
| 2 | Interview One | social | The first witness lies badly, revealing pressure from statue sentries. |
| 3 | Physical Clue | discovery | A mark, smell, or damaged object anchors the mystery in the ruins scene. |
| 4 | Contradiction | discovery | The heir finds evidence that makes the client's version impossible. |
| 5 | Street or Trail Pressure | hazard | Someone tries to scare the heir away with poison, ambush, or public shame. |
| 6 | Old Record | discovery | A ledger, gravestone, map, or hymn reveals a rival heir already failed here and left a warning mark. |
| 7 | Accusation | social | The heir can accuse openly, bait a confession, or keep silent for more evidence. |
| 8 | Proof Under Fire | combat | The culprit or curse lashes out when proof is taken. |
| 9 | Judgment Call | choice | The heir chooses guild law, local mercy, or profitable blackmail. |
| 10 | Filed Truth | reward | The completed report grants pay, rank XP, and possible infamy shift. |

### mis_ossuary-engine-of-saint-vare — Ossuary Engine of Saint Vare

Rank S | Difficulty: lethal | Min level: 30 | Setting: crypt | Tone: lethal | Arc: seal | Scene: chapel_crypt/bone_vault

Client: a mourner in black gloves | Focus: a bone engine grinding saintly relics into curses | Main threat: grave-moths | Lore turn: the safest route would abandon someone helpless

Eligibility: Rank S+; level >= 30; background: crypt. Secret: Requires Reliquary of the Hungry Choir completed. Reward: 624 gold, 51 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Containment Order | social | a mourner in black gloves asks the heir to seal a bone engine grinding saintly relics into curses before it spreads. |
| 2 | Measure the Leak | discovery | The heir maps how the curse, breach, or omen escapes into the crypt scene. |
| 3 | Gather Components | hazard | The seal needs salt, iron, ash, true names, or blood gathered under pressure. |
| 4 | False Seal | discovery | A prior seal failed because someone profited from weakness. |
| 5 | Interruption | combat | grave-moths attack while the components are prepared. |
| 6 | The Cost Named | choice | The working demands gold, HP, morale, an item, or a future secret debt. |
| 7 | Lore Reversal | discovery | The heir learns the safest route would abandon someone helpless, changing what must be sealed. |
| 8 | Circle Holds | hazard | A timed check determines whether the seal stabilizes or backlashes. |
| 9 | Last Nail | choice | The heir chooses a merciful seal, a harsh seal, or a profitable unstable seal. |
| 10 | Quiet for Now | reward | The guild pays for containment; an unstable choice seeds a future event. |

### mis_the-thorn-crown-awakens — The Thorn Crown Awakens

Rank S | Difficulty: lethal | Min level: 30 | Setting: forest | Tone: lethal | Arc: retrieve | Scene: forest_briar/moonlit_wood

Client: the queen's falconer | Focus: the living crown that made kings kneel | Main threat: fae tax collectors | Lore turn: the client omits a blood debt owed by their grandparent

Eligibility: Rank S+; level >= 30; background: forest. Reward: 631 gold, 51 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Written Claim | social | the queen's falconer claims the living crown that made kings kneel must be recovered before rival hands reach it. |
| 2 | Owner's Mark | discovery | The heir identifies the object's mark and one unsettling sign of fae tax collectors nearby. |
| 3 | Price of Entry | hazard | A guard, lock, tide, or curse demands supplies, gold, or a stat check. |
| 4 | Competing Hand | social | A second claimant offers coin to walk away from the contract. |
| 5 | Container Trap | hazard | The object's case is trapped; rogues, mages, and clerics each see different warnings. |
| 6 | True Provenance | discovery | A hidden inscription reveals the client omits a blood debt owed by their grandparent. |
| 7 | Weight of the Thing | choice | Carrying the living crown that made kings kneel burdens the heir: speed, stealth, or morale must be sacrificed. |
| 8 | The Pursuit | combat | fae tax collectors pursue the recovered object through the forest scene. |
| 9 | Clean Hands | social | The heir decides whether to reveal the truth, hide it, or mark the client as suspect. |
| 10 | Sealed Receipt | reward | The guild issues pay and rank XP; the item may also unlock a later secret event. |

### mis_the-mirror-siege — The Mirror Siege

Rank S | Difficulty: lethal | Min level: 30 | Setting: town | Tone: lethal | Arc: defend | Scene: town_market/tavern_street

Client: widow Mara | Focus: reflections laying siege from every pane of glass | Main threat: knife-gang watchers | Lore turn: payment is partly cursed unless purified before banking

Eligibility: Rank S+; level >= 30; background: town. Reward: 638 gold, 52 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Alarm Bell | social | widow Mara hires the heir to hold reflections laying siege from every pane of glass until dawn or relief. |
| 2 | Survey Defenses | discovery | The heir identifies weak doors, frightened locals, and where knife-gang watchers will enter. |
| 3 | Limited Hands | choice | Assign workers, spend supplies, or take a dangerous solo position. |
| 4 | First Probe | combat | A small attack tests the defenses and exposes the real strategy. |
| 5 | Panic in the Ranks | social | Morale threatens collapse unless the heir inspires, threatens, or pays the defenders. |
| 6 | Hidden Breach | hazard | A tunnel, mirror, window, or sewer creates a second front. |
| 7 | Revealed Motive | discovery | The siege makes sense when the heir learns payment is partly cursed unless purified before banking. |
| 8 | Last Reserve | choice | Spend the emergency reserve now or save it for the final wave. |
| 9 | Dawn Assault | combat | The heaviest attack comes just before safety; failure may kill civilians and the heir. |
| 10 | Count the Living | reward | Reward scales with survivors, property saved, and whether the heir kept faith. |

## Rank SS Contracts

### mis_the-mountain-that-knelt — The Mountain That Knelt

Rank SS | Difficulty: mythic lethal | Min level: 40 | Setting: mountain | Tone: lethal | Arc: seal | Scene: snow_pass/cliff_shrine

Client: a frost-bitten courier | Focus: a mountain bowing toward a buried tyrant | Main threat: avalanche drums | Lore turn: the safest route would abandon someone helpless

Eligibility: Rank SS+; level >= 40; background: mountain. Reward: 645 gold, 52 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Containment Order | social | a frost-bitten courier asks the heir to seal a mountain bowing toward a buried tyrant before it spreads. |
| 2 | Measure the Leak | discovery | The heir maps how the curse, breach, or omen escapes into the mountain scene. |
| 3 | Gather Components | hazard | The seal needs salt, iron, ash, true names, or blood gathered under pressure. |
| 4 | False Seal | discovery | A prior seal failed because someone profited from weakness. |
| 5 | Interruption | combat | avalanche drums attack while the components are prepared. |
| 6 | The Cost Named | choice | The working demands gold, HP, morale, an item, or a future secret debt. |
| 7 | Lore Reversal | discovery | The heir learns the safest route would abandon someone helpless, changing what must be sealed. |
| 8 | Circle Holds | hazard | A timed check determines whether the seal stabilizes or backlashes. |
| 9 | Last Nail | choice | The heir chooses a merciful seal, a harsh seal, or a profitable unstable seal. |
| 10 | Quiet for Now | reward | The guild pays for containment; an unstable choice seeds a future event. |

### mis_library-of-last-breaths — Library of Last Breaths

Rank SS | Difficulty: mythic lethal | Min level: 40 | Setting: ruins | Tone: lethal | Arc: retrieve | Scene: fallen_tower/old_keep

Client: a knight's last squire | Focus: books written from the final exhale of heroes | Main threat: sunken archives | Lore turn: the client omits a blood debt owed by their grandparent

Eligibility: Rank SS+; level >= 40; background: ruins. Reward: 652 gold, 53 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Written Claim | social | a knight's last squire claims books written from the final exhale of heroes must be recovered before rival hands reach it. |
| 2 | Owner's Mark | discovery | The heir identifies the object's mark and one unsettling sign of sunken archives nearby. |
| 3 | Price of Entry | hazard | A guard, lock, tide, or curse demands supplies, gold, or a stat check. |
| 4 | Competing Hand | social | A second claimant offers coin to walk away from the contract. |
| 5 | Container Trap | hazard | The object's case is trapped; rogues, mages, and clerics each see different warnings. |
| 6 | True Provenance | discovery | A hidden inscription reveals the client omits a blood debt owed by their grandparent. |
| 7 | Weight of the Thing | choice | Carrying books written from the final exhale of heroes burdens the heir: speed, stealth, or morale must be sacrificed. |
| 8 | The Pursuit | combat | sunken archives pursue the recovered object through the ruins scene. |
| 9 | Clean Hands | social | The heir decides whether to reveal the truth, hide it, or mark the client as suspect. |
| 10 | Sealed Receipt | reward | The guild issues pay and rank XP; the item may also unlock a later secret event. |

### mis_the-leviathans-court — The Leviathan's Court

Rank SS | Difficulty: mythic lethal | Min level: 40 | Setting: coast | Tone: lethal | Arc: negotiate | Scene: storm_coast/fishing_dock

Client: fisher Jossa | Focus: a leviathan judging coastal bloodlines | Main threat: drowned crews | Lore turn: payment is partly cursed unless purified before banking

Eligibility: Rank SS+; level >= 40; background: coast. Reward: 659 gold, 53 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Terms on the Board | social | fisher Jossa needs the heir to bargain over a leviathan judging coastal bloodlines, not simply draw steel. |
| 2 | Know the Other Side | discovery | The heir learns what drowned crews actually want. |
| 3 | Token of Good Faith | choice | Bring a gift, hostage, oath, or insult; each changes the negotiation table. |
| 4 | Neutral Ground | hazard | The meeting place itself threatens both sides. |
| 5 | Opening Demand | social | The opposing party asks for more than the client admitted was possible. |
| 6 | Buried Clause | discovery | The old law or pact reveals payment is partly cursed unless purified before banking. |
| 7 | Bad Actor | combat | Someone tries to ruin the talks with sudden violence. |
| 8 | Final Offer | choice | The heir can choose peace, profit, humiliation, or war. |
| 9 | Oath Binding | hazard | The agreement binds magically; breaking it later may trigger a secret event. |
| 10 | Signed Before Witness | reward | The guild pays for settlement, with infamy, morale, or bloodline effects based on terms. |

### mis_the-ninth-dungeon-door — The Ninth Dungeon Door

Rank SS | Difficulty: mythic lethal | Min level: 40 | Setting: dungeon | Tone: lethal | Arc: delve | Scene: dungeon_hall/iron_gate

Client: guild examiner Vos | Focus: the door no prisoner remembers entering | Main threat: gaoler shades | Lore turn: the final clue only appears after dusk

Eligibility: Rank SS+; level >= 40; background: dungeon. Reward: 666 gold, 54 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Key and Map | social | guild examiner Vos gives the heir a flawed map toward the door no prisoner remembers entering. |
| 2 | Threshold Test | hazard | The entrance demands rope, torch, prayer, or blood before opening safely. |
| 3 | First Chamber | discovery | The architecture reveals who built this place and why they feared gaoler shades. |
| 4 | Resource Drain | hazard | Darkness, rot, hunger, or silence drains supplies and morale. |
| 5 | Old Body | discovery | A corpse from an earlier expedition reveals the final clue only appears after dusk. |
| 6 | Choice of Depths | choice | One route is short and trapped; another is long and haunted. |
| 7 | Guardian Room | combat | A guardian tests whether the heir belongs below. |
| 8 | Treasure With Teeth | hazard | The objective is trapped, aware, or bound to the site. |
| 9 | Escape Collapse | combat | Taking the door no prisoner remembers entering wakes the final defense and turns the return into a chase. |
| 10 | Surface Reckoning | reward | The guild pays, but the heir may carry a dungeon mark into later runs. |

### mis_the-cursed-orchard-of-first-graves — The Cursed Orchard of First Graves

Rank SS | Difficulty: mythic lethal | Min level: 40 | Setting: forest | Tone: lethal | Arc: exorcise | Scene: forest_briar/moonlit_wood

Client: the queen's falconer | Focus: an orchard planted over the first heirs | Main threat: fae tax collectors | Lore turn: a rival heir already failed here and left a warning mark

Eligibility: Rank SS+; level >= 40; background: forest. Reward: 673 gold, 54 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Holy Writ | social | the queen's falconer asks for an orchard planted over the first heirs to be quieted, burned, named, or forgiven. |
| 2 | Boundary Salt | discovery | The heir maps the haunting's boundary and where fae tax collectors gather. |
| 3 | Name the Dead | social | A living relative or old inscription gives the spirit a usable name. |
| 4 | Wrong Rite | hazard | A common rite worsens the haunting unless faith or intelligence catches the flaw. |
| 5 | Memory Scene | discovery | The ghost shows the heir a fragment proving a rival heir already failed here and left a warning mark. |
| 6 | Offering Choice | choice | Gold, blood, apology, or relic ash may calm the spirit at different costs. |
| 7 | Possessed Object | combat | An object or corpse attacks while the rite is prepared. |
| 8 | Last Confession | social | The heir chooses whether to expose the truth to the living. |
| 9 | Banish or Bind | hazard | The final rite risks curse, death, or a bloodline-scoped scar. |
| 10 | Quiet Ground | reward | The dead settle; the guild pays and may add a blessing if mercy was shown. |

### mis_city-beneath-the-market-well — City Beneath the Market Well

Rank SS | Difficulty: mythic lethal | Min level: 40 | Setting: town | Tone: lethal | Arc: delve | Scene: town_market/tavern_street

Client: widow Mara | Focus: a buried city reached through the town well | Main threat: knife-gang watchers | Lore turn: the safest route would abandon someone helpless

Eligibility: Rank SS+; level >= 40; background: town. Reward: 680 gold, 55 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Key and Map | social | widow Mara gives the heir a flawed map toward a buried city reached through the town well. |
| 2 | Threshold Test | hazard | The entrance demands rope, torch, prayer, or blood before opening safely. |
| 3 | First Chamber | discovery | The architecture reveals who built this place and why they feared knife-gang watchers. |
| 4 | Resource Drain | hazard | Darkness, rot, hunger, or silence drains supplies and morale. |
| 5 | Old Body | discovery | A corpse from an earlier expedition reveals the safest route would abandon someone helpless. |
| 6 | Choice of Depths | choice | One route is short and trapped; another is long and haunted. |
| 7 | Guardian Room | combat | A guardian tests whether the heir belongs below. |
| 8 | Treasure With Teeth | hazard | The objective is trapped, aware, or bound to the site. |
| 9 | Escape Collapse | combat | Taking a buried city reached through the town well wakes the final defense and turns the return into a chase. |
| 10 | Surface Reckoning | reward | The guild pays, but the heir may carry a dungeon mark into later runs. |

### mis_the-mire-that-married-death — The Mire That Married Death

Rank SS | Difficulty: mythic lethal | Min level: 40 | Setting: swamp | Tone: lethal | Arc: seal | Scene: black_mire/reed_path

Client: a leechwife | Focus: a mire wearing a wedding veil of bones | Main threat: reed witches | Lore turn: the client omits a blood debt owed by their grandparent

Eligibility: Rank SS+; level >= 40; background: swamp. Reward: 687 gold, 55 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Containment Order | social | a leechwife asks the heir to seal a mire wearing a wedding veil of bones before it spreads. |
| 2 | Measure the Leak | discovery | The heir maps how the curse, breach, or omen escapes into the swamp scene. |
| 3 | Gather Components | hazard | The seal needs salt, iron, ash, true names, or blood gathered under pressure. |
| 4 | False Seal | discovery | A prior seal failed because someone profited from weakness. |
| 5 | Interruption | combat | reed witches attack while the components are prepared. |
| 6 | The Cost Named | choice | The working demands gold, HP, morale, an item, or a future secret debt. |
| 7 | Lore Reversal | discovery | The heir learns the client omits a blood debt owed by their grandparent, changing what must be sealed. |
| 8 | Circle Holds | hazard | A timed check determines whether the seal stabilizes or backlashes. |
| 9 | Last Nail | choice | The heir chooses a merciful seal, a harsh seal, or a profitable unstable seal. |
| 10 | Quiet for Now | reward | The guild pays for containment; an unstable choice seeds a future event. |

### mis_the-funeral-road-reversed — The Funeral Road Reversed

Rank SS | Difficulty: mythic lethal | Min level: 40 | Setting: road | Tone: lethal | Arc: investigate | Scene: king_road/old_bridge

Client: a masked tax scribe | Focus: a road returning the dead before they die | Main threat: bandit tolls | Lore turn: payment is partly cursed unless purified before banking

Eligibility: Rank SS+; level >= 40; background: road. Reward: 694 gold, 56 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Thin Notice | social | The board notice says little; a masked tax scribe fears the truth around a road returning the dead before they die more than the cost. |
| 2 | Interview One | social | The first witness lies badly, revealing pressure from bandit tolls. |
| 3 | Physical Clue | discovery | A mark, smell, or damaged object anchors the mystery in the road scene. |
| 4 | Contradiction | discovery | The heir finds evidence that makes the client's version impossible. |
| 5 | Street or Trail Pressure | hazard | Someone tries to scare the heir away with poison, ambush, or public shame. |
| 6 | Old Record | discovery | A ledger, gravestone, map, or hymn reveals payment is partly cursed unless purified before banking. |
| 7 | Accusation | social | The heir can accuse openly, bait a confession, or keep silent for more evidence. |
| 8 | Proof Under Fire | combat | The culprit or curse lashes out when proof is taken. |
| 9 | Judgment Call | choice | The heir chooses guild law, local mercy, or profitable blackmail. |
| 10 | Filed Truth | reward | The completed report grants pay, rank XP, and possible infamy shift. |

### mis_the-king-in-the-coal-seam — The King in the Coal Seam

Rank SS | Difficulty: mythic lethal | Min level: 40 | Setting: cave | Tone: lethal | Arc: rescue | Scene: cave_mouth/deep_mine

Client: foreman Pell | Focus: a sleeping king entombed as coal | Main threat: blind things in the seams | Lore turn: the final clue only appears after dusk

Eligibility: Rank SS+; level >= 40; background: cave. Reward: 701 gold, 56 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Frantic Posting | social | foreman Pell begs the heir to recover a sleeping king entombed as coal; delay lowers the rescue reward. |
| 2 | Last Sighting | discovery | A child, track, or dropped token places the missing soul at the edge of the cave scene. |
| 3 | False Trail | hazard | A tempting trail wastes supplies unless the heir passes luck or intelligence. |
| 4 | Quiet Call | social | The heir hears a weak answer, but blind things in the seams answer from another direction. |
| 5 | Blocked Reach | hazard | Stone, thorns, tide, or locked iron blocks the path and demands a class-flavored solution. |
| 6 | The Captor's Reason | discovery | The mission turns when the heir learns the final clue only appears after dusk. |
| 7 | Breath and Panic | choice | The rescued target panics; charisma, faith, or a gentle item can prevent injury. |
| 8 | Carry or Clear | hazard | The heir chooses to carry the rescued target slowly or clear danger first. |
| 9 | Breakout | combat | The last obstacle attacks during escape; losing may kill the heir or the target. |
| 10 | Returned Alive | reward | foreman Pell pays through tears, and the line gains rank XP for saving a sleeping king entombed as coal. |

### mis_the-crypt-of-borrowed-blood — The Crypt of Borrowed Blood

Rank SS | Difficulty: mythic lethal | Min level: 40 | Setting: crypt | Tone: lethal | Arc: retrieve | Scene: chapel_crypt/bone_vault

Client: a mourner in black gloves | Focus: vials of blood stolen from unborn children | Main threat: sealed family sins | Lore turn: a rival heir already failed here and left a warning mark

Eligibility: Rank SS+; level >= 40; background: crypt. Secret: Requires at least 10 dead heirs in the lineage chronicle. Reward: 708 gold, 57 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Written Claim | social | a mourner in black gloves claims vials of blood stolen from unborn children must be recovered before rival hands reach it. |
| 2 | Owner's Mark | discovery | The heir identifies the object's mark and one unsettling sign of sealed family sins nearby. |
| 3 | Price of Entry | hazard | A guard, lock, tide, or curse demands supplies, gold, or a stat check. |
| 4 | Competing Hand | social | A second claimant offers coin to walk away from the contract. |
| 5 | Container Trap | hazard | The object's case is trapped; rogues, mages, and clerics each see different warnings. |
| 6 | True Provenance | discovery | A hidden inscription reveals a rival heir already failed here and left a warning mark. |
| 7 | Weight of the Thing | choice | Carrying vials of blood stolen from unborn children burdens the heir: speed, stealth, or morale must be sacrificed. |
| 8 | The Pursuit | combat | sealed family sins pursue the recovered object through the crypt scene. |
| 9 | Clean Hands | social | The heir decides whether to reveal the truth, hide it, or mark the client as suspect. |
| 10 | Sealed Receipt | reward | The guild issues pay and rank XP; the item may also unlock a later secret event. |

### mis_the-parliament-of-broken-statues — The Parliament of Broken Statues

Rank SS | Difficulty: mythic lethal | Min level: 40 | Setting: ruins | Tone: lethal | Arc: negotiate | Scene: fallen_tower/old_keep

Client: a knight's last squire | Focus: statues convening to judge the living crown | Main threat: memory curses | Lore turn: the safest route would abandon someone helpless

Eligibility: Rank SS+; level >= 40; background: ruins. Reward: 715 gold, 57 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Terms on the Board | social | a knight's last squire needs the heir to bargain over statues convening to judge the living crown, not simply draw steel. |
| 2 | Know the Other Side | discovery | The heir learns what memory curses actually want. |
| 3 | Token of Good Faith | choice | Bring a gift, hostage, oath, or insult; each changes the negotiation table. |
| 4 | Neutral Ground | hazard | The meeting place itself threatens both sides. |
| 5 | Opening Demand | social | The opposing party asks for more than the client admitted was possible. |
| 6 | Buried Clause | discovery | The old law or pact reveals the safest route would abandon someone helpless. |
| 7 | Bad Actor | combat | Someone tries to ruin the talks with sudden violence. |
| 8 | Final Offer | choice | The heir can choose peace, profit, humiliation, or war. |
| 9 | Oath Binding | hazard | The agreement binds magically; breaking it later may trigger a secret event. |
| 10 | Signed Before Witness | reward | The guild pays for settlement, with infamy, morale, or bloodline effects based on terms. |

### mis_the-glaciers-confession — The Glacier's Confession

Rank SS | Difficulty: mythic lethal | Min level: 40 | Setting: mountain | Tone: lethal | Arc: pilgrimage | Scene: snow_pass/cliff_shrine

Client: goatherd Rusk | Focus: a glacier exposing sins frozen in blue ice | Main threat: goat demons | Lore turn: the client omits a blood debt owed by their grandparent

Eligibility: Rank SS+; level >= 40; background: mountain. Reward: 722 gold, 58 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Vow Accepted | social | goatherd Rusk sends the heir toward a glacier exposing sins frozen in blue ice under a vow witnessed by the guild. |
| 2 | First Hard Mile | hazard | The journey tests supplies, constitution, and the heir's willingness to turn back. |
| 3 | Fellow Traveler | social | A stranger shares food and a warning about goat demons. |
| 4 | Trial of Humility | choice | The heir must surrender comfort, coin, pride, or a secret to continue. |
| 5 | Sacred Refusal | hazard | The holy place refuses an unprepared heir with weather, silence, or pain. |
| 6 | Vision of the Line | discovery | A vision reveals the client omits a blood debt owed by their grandparent and names a dead heir in the family chronicle. |
| 7 | Unclean Challenge | combat | A profane guardian blocks the last ascent or descent. |
| 8 | Prayer or Defiance | choice | The heir chooses obedience, bargaining, or defiance before the shrine. |
| 9 | Return Changed | hazard | Coming back is harder because the vow now has weight. |
| 10 | Witnessed Blessing | reward | The guild pays little, but the lineage may gain a rare blessing or scar. |

## Rank SSS Contracts

### mis_the-bloodlines-first-debt — The Bloodline's First Debt

Rank SSS | Difficulty: bloodline-defining | Min level: 55 | Setting: town | Tone: lethal | Arc: investigate | Scene: town_market/tavern_street

Client: sister Elowen | Focus: the original contract signed by the family founder | Main threat: lying witnesses | Lore turn: a rival heir already failed here and left a warning mark

Eligibility: Rank SSS+; level >= 55; background: town. Reward: 729 gold, 58 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Thin Notice | social | The board notice says little; sister Elowen fears the truth around the original contract signed by the family founder more than the cost. |
| 2 | Interview One | social | The first witness lies badly, revealing pressure from lying witnesses. |
| 3 | Physical Clue | discovery | A mark, smell, or damaged object anchors the mystery in the town scene. |
| 4 | Contradiction | discovery | The heir finds evidence that makes the client's version impossible. |
| 5 | Street or Trail Pressure | hazard | Someone tries to scare the heir away with poison, ambush, or public shame. |
| 6 | Old Record | discovery | A ledger, gravestone, map, or hymn reveals a rival heir already failed here and left a warning mark. |
| 7 | Accusation | social | The heir can accuse openly, bait a confession, or keep silent for more evidence. |
| 8 | Proof Under Fire | combat | The culprit or curse lashes out when proof is taken. |
| 9 | Judgment Call | choice | The heir chooses guild law, local mercy, or profitable blackmail. |
| 10 | Filed Truth | reward | The completed report grants pay, rank XP, and possible infamy shift. |

### mis_the-heir-who-refused-death — The Heir Who Refused Death

Rank SSS | Difficulty: bloodline-defining | Min level: 55 | Setting: crypt | Tone: lethal | Arc: exorcise | Scene: chapel_crypt/bone_vault

Client: a bell-ringer | Focus: a dead ancestor refusing the inheritance law | Main threat: bone choirs | Lore turn: the safest route would abandon someone helpless

Eligibility: Rank SSS+; level >= 55; background: crypt. Reward: 736 gold, 59 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Holy Writ | social | a bell-ringer asks for a dead ancestor refusing the inheritance law to be quieted, burned, named, or forgiven. |
| 2 | Boundary Salt | discovery | The heir maps the haunting's boundary and where bone choirs gather. |
| 3 | Name the Dead | social | A living relative or old inscription gives the spirit a usable name. |
| 4 | Wrong Rite | hazard | A common rite worsens the haunting unless faith or intelligence catches the flaw. |
| 5 | Memory Scene | discovery | The ghost shows the heir a fragment proving the safest route would abandon someone helpless. |
| 6 | Offering Choice | choice | Gold, blood, apology, or relic ash may calm the spirit at different costs. |
| 7 | Possessed Object | combat | An object or corpse attacks while the rite is prepared. |
| 8 | Last Confession | social | The heir chooses whether to expose the truth to the living. |
| 9 | Banish or Bind | hazard | The final rite risks curse, death, or a bloodline-scoped scar. |
| 10 | Quiet Ground | reward | The dead settle; the guild pays and may add a blessing if mercy was shown. |

### mis_the-crown-beneath-all-roots — The Crown Beneath All Roots

Rank SSS | Difficulty: bloodline-defining | Min level: 55 | Setting: forest | Tone: lethal | Arc: retrieve | Scene: forest_briar/moonlit_wood

Client: warden Ilya | Focus: the root-crown binding every forest oath | Main threat: hungry trees | Lore turn: the client omits a blood debt owed by their grandparent

Eligibility: Rank SSS+; level >= 55; background: forest. Reward: 743 gold, 59 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Written Claim | social | warden Ilya claims the root-crown binding every forest oath must be recovered before rival hands reach it. |
| 2 | Owner's Mark | discovery | The heir identifies the object's mark and one unsettling sign of hungry trees nearby. |
| 3 | Price of Entry | hazard | A guard, lock, tide, or curse demands supplies, gold, or a stat check. |
| 4 | Competing Hand | social | A second claimant offers coin to walk away from the contract. |
| 5 | Container Trap | hazard | The object's case is trapped; rogues, mages, and clerics each see different warnings. |
| 6 | True Provenance | discovery | A hidden inscription reveals the client omits a blood debt owed by their grandparent. |
| 7 | Weight of the Thing | choice | Carrying the root-crown binding every forest oath burdens the heir: speed, stealth, or morale must be sacrificed. |
| 8 | The Pursuit | combat | hungry trees pursue the recovered object through the forest scene. |
| 9 | Clean Hands | social | The heir decides whether to reveal the truth, hide it, or mark the client as suspect. |
| 10 | Sealed Receipt | reward | The guild issues pay and rank XP; the item may also unlock a later secret event. |

### mis_the-world-wound-under-irondeep — The World-Wound Under Irondeep

Rank SSS | Difficulty: bloodline-defining | Min level: 55 | Setting: cave | Tone: lethal | Arc: seal | Scene: cave_mouth/deep_mine

Client: candle priest Orrin | Focus: a wound in the world beneath the deepest mine | Main threat: old dwarven locks | Lore turn: payment is partly cursed unless purified before banking

Eligibility: Rank SSS+; level >= 55; background: cave. Reward: 750 gold, 60 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Containment Order | social | candle priest Orrin asks the heir to seal a wound in the world beneath the deepest mine before it spreads. |
| 2 | Measure the Leak | discovery | The heir maps how the curse, breach, or omen escapes into the cave scene. |
| 3 | Gather Components | hazard | The seal needs salt, iron, ash, true names, or blood gathered under pressure. |
| 4 | False Seal | discovery | A prior seal failed because someone profited from weakness. |
| 5 | Interruption | combat | old dwarven locks attack while the components are prepared. |
| 6 | The Cost Named | choice | The working demands gold, HP, morale, an item, or a future secret debt. |
| 7 | Lore Reversal | discovery | The heir learns payment is partly cursed unless purified before banking, changing what must be sealed. |
| 8 | Circle Holds | hazard | A timed check determines whether the seal stabilizes or backlashes. |
| 9 | Last Nail | choice | The heir chooses a merciful seal, a harsh seal, or a profitable unstable seal. |
| 10 | Quiet for Now | reward | The guild pays for containment; an unstable choice seeds a future event. |

### mis_the-last-road-to-no-dawn — The Last Road to No Dawn

Rank SSS | Difficulty: bloodline-defining | Min level: 55 | Setting: road | Tone: lethal | Arc: escort | Scene: king_road/old_bridge

Client: a masked tax scribe | Focus: a road where dawn has never arrived | Main threat: broken milestones | Lore turn: the final clue only appears after dusk

Eligibility: Rank SSS+; level >= 55; background: road. Reward: 757 gold, 60 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Departure Oath | social | a masked tax scribe entrusts a road where dawn has never arrived to the heir under guild witness. |
| 2 | Road Temper | social | The escorted party reveals a flaw, fear, or secret before danger appears. |
| 3 | First Delay | hazard | Weather, mud, gossip, or a closed gate threatens the schedule. |
| 4 | Watcher Sign | discovery | The heir spots broken milestones tracking the party. |
| 5 | Meal by Bad Light | social | A rest scene tests morale and lets the heir ask why the escort matters. |
| 6 | Ambush Geometry | combat | The route narrows into a tactical choice: protect the charge, flank, or flee. |
| 7 | The Hidden Cargo | discovery | The escort changes meaning when the heir learns the final clue only appears after dusk. |
| 8 | No Clean Path | choice | One path is safe but slow; the other is dangerous but may preserve the full reward. |
| 9 | Final Gate | hazard | The destination itself rejects entry until a vow, bribe, or skill check succeeds. |
| 10 | Witnessed Arrival | reward | The guild records successful escort and pays according to survival and honesty. |

### mis_the-palace-of-salt-and-teeth — The Palace of Salt and Teeth

Rank SSS | Difficulty: bloodline-defining | Min level: 55 | Setting: coast | Tone: lethal | Arc: delve | Scene: storm_coast/fishing_dock

Client: fisher Jossa | Focus: a tidal palace built inside a leviathan skull | Main threat: salt revenants | Lore turn: a rival heir already failed here and left a warning mark

Eligibility: Rank SSS+; level >= 55; background: coast. Reward: 764 gold, 61 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Key and Map | social | fisher Jossa gives the heir a flawed map toward a tidal palace built inside a leviathan skull. |
| 2 | Threshold Test | hazard | The entrance demands rope, torch, prayer, or blood before opening safely. |
| 3 | First Chamber | discovery | The architecture reveals who built this place and why they feared salt revenants. |
| 4 | Resource Drain | hazard | Darkness, rot, hunger, or silence drains supplies and morale. |
| 5 | Old Body | discovery | A corpse from an earlier expedition reveals a rival heir already failed here and left a warning mark. |
| 6 | Choice of Depths | choice | One route is short and trapped; another is long and haunted. |
| 7 | Guardian Room | combat | A guardian tests whether the heir belongs below. |
| 8 | Treasure With Teeth | hazard | The objective is trapped, aware, or bound to the site. |
| 9 | Escape Collapse | combat | Taking a tidal palace built inside a leviathan skull wakes the final defense and turns the return into a chase. |
| 10 | Surface Reckoning | reward | The guild pays, but the heir may carry a dungeon mark into later runs. |

### mis_the-mountains-hidden-name — The Mountain's Hidden Name

Rank SSS | Difficulty: bloodline-defining | Min level: 55 | Setting: mountain | Tone: lethal | Arc: pilgrimage | Scene: snow_pass/cliff_shrine

Client: a frost-bitten courier | Focus: the true name carved under the highest peak | Main threat: white harpies | Lore turn: the safest route would abandon someone helpless

Eligibility: Rank SSS+; level >= 55; background: mountain. Reward: 771 gold, 61 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Vow Accepted | social | a frost-bitten courier sends the heir toward the true name carved under the highest peak under a vow witnessed by the guild. |
| 2 | First Hard Mile | hazard | The journey tests supplies, constitution, and the heir's willingness to turn back. |
| 3 | Fellow Traveler | social | A stranger shares food and a warning about white harpies. |
| 4 | Trial of Humility | choice | The heir must surrender comfort, coin, pride, or a secret to continue. |
| 5 | Sacred Refusal | hazard | The holy place refuses an unprepared heir with weather, silence, or pain. |
| 6 | Vision of the Line | discovery | A vision reveals the safest route would abandon someone helpless and names a dead heir in the family chronicle. |
| 7 | Unclean Challenge | combat | A profane guardian blocks the last ascent or descent. |
| 8 | Prayer or Defiance | choice | The heir chooses obedience, bargaining, or defiance before the shrine. |
| 9 | Return Changed | hazard | Coming back is harder because the vow now has weight. |
| 10 | Witnessed Blessing | reward | The guild pays little, but the lineage may gain a rare blessing or scar. |

### mis_the-dungeon-that-dreams-heirs — The Dungeon That Dreams Heirs

Rank SSS | Difficulty: bloodline-defining | Min level: 55 | Setting: dungeon | Tone: lethal | Arc: sabotage | Scene: dungeon_hall/iron_gate

Client: a prisoner's mother | Focus: a dungeon dreaming replacements for living heirs | Main threat: gaoler shades | Lore turn: the client omits a blood debt owed by their grandparent

Eligibility: Rank SSS+; level >= 55; background: dungeon. Reward: 778 gold, 62 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Quiet Writ | social | a prisoner's mother wants a dungeon dreaming replacements for living heirs ruined without open guild scandal. |
| 2 | Pattern Study | discovery | The heir watches guards, tides, bells, or patrols to find the weak hour. |
| 3 | Tool Choice | choice | Poison, false order, fire, lockwork, or prayer gives different risk profiles. |
| 4 | Inside Help | social | An insider helps only if paid, threatened, forgiven, or promised escape. |
| 5 | Unexpected Innocent | hazard | A bystander stands inside the blast radius of the plan. |
| 6 | Why It Exists | discovery | The heir learns the client omits a blood debt owed by their grandparent, complicating the job. |
| 7 | Silent Strike | hazard | The sabotage attempt demands dexterity, intelligence, class, or luck. |
| 8 | Alarm Breaks | combat | The alarm sounds anyway and gaoler shades respond. |
| 9 | Evidence Burn | choice | Destroy proof, preserve proof, or frame a rival. |
| 10 | No Applause | reward | The guild pays discreetly; infamy may rise even on perfect success. |

### mis_the-ruin-of-tomorrows-capital — The Ruin of Tomorrow's Capital

Rank SSS | Difficulty: bloodline-defining | Min level: 55 | Setting: ruins | Tone: lethal | Arc: investigate | Scene: fallen_tower/old_keep

Client: antiquary Voss | Focus: ruins of a capital not yet built | Main threat: relic thieves | Lore turn: payment is partly cursed unless purified before banking

Eligibility: Rank SSS+; level >= 55; background: ruins. Reward: 785 gold, 62 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Thin Notice | social | The board notice says little; antiquary Voss fears the truth around ruins of a capital not yet built more than the cost. |
| 2 | Interview One | social | The first witness lies badly, revealing pressure from relic thieves. |
| 3 | Physical Clue | discovery | A mark, smell, or damaged object anchors the mystery in the ruins scene. |
| 4 | Contradiction | discovery | The heir finds evidence that makes the client's version impossible. |
| 5 | Street or Trail Pressure | hazard | Someone tries to scare the heir away with poison, ambush, or public shame. |
| 6 | Old Record | discovery | A ledger, gravestone, map, or hymn reveals payment is partly cursed unless purified before banking. |
| 7 | Accusation | social | The heir can accuse openly, bait a confession, or keep silent for more evidence. |
| 8 | Proof Under Fire | combat | The culprit or curse lashes out when proof is taken. |
| 9 | Judgment Call | choice | The heir chooses guild law, local mercy, or profitable blackmail. |
| 10 | Filed Truth | reward | The completed report grants pay, rank XP, and possible infamy shift. |

### mis_the-swamp-where-gods-are-buried — The Swamp Where Gods Are Buried

Rank SSS | Difficulty: bloodline-defining | Min level: 55 | Setting: swamp | Tone: lethal | Arc: seal | Scene: black_mire/reed_path

Client: a leechwife | Focus: a burial swamp for forgotten gods | Main threat: mud-ghouls | Lore turn: the final clue only appears after dusk

Eligibility: Rank SSS+; level >= 55; background: swamp. Reward: 792 gold, 63 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Containment Order | social | a leechwife asks the heir to seal a burial swamp for forgotten gods before it spreads. |
| 2 | Measure the Leak | discovery | The heir maps how the curse, breach, or omen escapes into the swamp scene. |
| 3 | Gather Components | hazard | The seal needs salt, iron, ash, true names, or blood gathered under pressure. |
| 4 | False Seal | discovery | A prior seal failed because someone profited from weakness. |
| 5 | Interruption | combat | mud-ghouls attack while the components are prepared. |
| 6 | The Cost Named | choice | The working demands gold, HP, morale, an item, or a future secret debt. |
| 7 | Lore Reversal | discovery | The heir learns the final clue only appears after dusk, changing what must be sealed. |
| 8 | Circle Holds | hazard | A timed check determines whether the seal stabilizes or backlashes. |
| 9 | Last Nail | choice | The heir chooses a merciful seal, a harsh seal, or a profitable unstable seal. |
| 10 | Quiet for Now | reward | The guild pays for containment; an unstable choice seeds a future event. |

### mis_the-black-chronicle-page — The Black Chronicle Page

Rank SSS | Difficulty: bloodline-defining | Min level: 55 | Setting: crypt | Tone: lethal | Arc: retrieve | Scene: chapel_crypt/bone_vault

Client: a bell-ringer | Focus: a page torn from the lineage chronicle | Main threat: curse plaques | Lore turn: a rival heir already failed here and left a warning mark

Eligibility: Rank SSS+; level >= 55; background: crypt. Reward: 799 gold, 63 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Written Claim | social | a bell-ringer claims a page torn from the lineage chronicle must be recovered before rival hands reach it. |
| 2 | Owner's Mark | discovery | The heir identifies the object's mark and one unsettling sign of curse plaques nearby. |
| 3 | Price of Entry | hazard | A guard, lock, tide, or curse demands supplies, gold, or a stat check. |
| 4 | Competing Hand | social | A second claimant offers coin to walk away from the contract. |
| 5 | Container Trap | hazard | The object's case is trapped; rogues, mages, and clerics each see different warnings. |
| 6 | True Provenance | discovery | A hidden inscription reveals a rival heir already failed here and left a warning mark. |
| 7 | Weight of the Thing | choice | Carrying a page torn from the lineage chronicle burdens the heir: speed, stealth, or morale must be sacrificed. |
| 8 | The Pursuit | combat | curse plaques pursue the recovered object through the crypt scene. |
| 9 | Clean Hands | social | The heir decides whether to reveal the truth, hide it, or mark the client as suspect. |
| 10 | Sealed Receipt | reward | The guild issues pay and rank XP; the item may also unlock a later secret event. |

### mis_the-average-ending — The Average Ending

Rank SSS | Difficulty: bloodline-defining | Min level: 55 | Setting: town | Tone: lethal | Arc: defend | Scene: town_market/tavern_street

Client: widow Mara | Focus: the quiet town where the curse tries to end the family | Main threat: debt spirits | Lore turn: the safest route would abandon someone helpless

Eligibility: Rank SSS+; level >= 55; background: town. Secret: Requires all SSS contracts except this one completed once across the lineage. Reward: 806 gold, 64 rank XP, setting-tagged loot chance.

| # | Fixed event | Beat type | Lore / server-facing prose |
| --- | --- | --- | --- |
| 1 | Alarm Bell | social | widow Mara hires the heir to hold the quiet town where the curse tries to end the family until dawn or relief. |
| 2 | Survey Defenses | discovery | The heir identifies weak doors, frightened locals, and where debt spirits will enter. |
| 3 | Limited Hands | choice | Assign workers, spend supplies, or take a dangerous solo position. |
| 4 | First Probe | combat | A small attack tests the defenses and exposes the real strategy. |
| 5 | Panic in the Ranks | social | Morale threatens collapse unless the heir inspires, threatens, or pays the defenders. |
| 6 | Hidden Breach | hazard | A tunnel, mirror, window, or sewer creates a second front. |
| 7 | Revealed Motive | discovery | The siege makes sense when the heir learns the safest route would abandon someone helpless. |
| 8 | Last Reserve | choice | Spend the emergency reserve now or save it for the final wave. |
| 9 | Dawn Assault | combat | The heaviest attack comes just before safety; failure may kill civilians and the heir. |
| 10 | Count the Living | reward | Reward scales with survivors, property saved, and whether the heir kept faith. |

# Implementation Notes

Fixed events should be deterministic for a mission instance; random interludes can be rolled between fixed beats 2-8.

Use server authority for eligibility, death checks, rewards, bankable flags, and mission advancement.

Secret events should have opaque client labels until unlocked; never reveal prerequisite strings directly to the player.

For tavern-board rerolls, select by rank first, then minLevel, then setting availability, then exclude completed one-time missions when needed.

Recommended event object fields: id, displayName, type, settingTags, tone, rankBand, minLevel, prerequisites, scene, prompt, choices, outcomes, deathRisk, rewardTags.

Recommended mission object fields: id, displayName, rank, minLevel, setting, tone, scene, prerequisites, fixedEvents[], interludeRules, rewardTable, failureTable, secretUnlocks.
