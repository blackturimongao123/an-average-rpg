# An Average RPG — Purpose & Core Loop

A design reference for writing adventures, missions, and events.  
Use this before authoring content so every beat feels like **your heir’s story**, not filler from a template.

---

## What this game is for

**An Average RPG** is a browser idle roguelite about a **cursed bloodline**, not a single hero.

The player’s job is not to “win once.” It is to **keep the family alive long enough** that each generation’s sacrifices matter: banked gold, bloodline skills, rank, relics, grudges, blessings, and scars that outlive any one heir.

**Death is progression.** A fallen heir is a chapter in the chronicle, not a failed save. The emotional contract with the player:

> *You will lose people you built. The line remembers. The next heir inherits the weight — and the chance to do better.*

---

## One-sentence pitch

Control one living heir at a time; when they die, the **lineage** keeps the legacy; create the next generation and push the family forward through risk, debt, and rare triumph.

---

## Core loop

```
Account
  └── Lineage (family name, bank, bloodline skills, rank, generation count)
        └── One living Heir at a time
              └── Play: Jobs · Tavern · Missions · Skills · Bank · (Dungeons later)
                    └── Heir dies → Inheritance resolves
                          └── Create next heir (generation +1) → repeat
```

### Session rhythm (typical play)

1. **Check the heir** — stats, gear, effects, what’s blocking them (job shift, active mission).
2. **Earn or risk** — job shift for steady income; mission board contract for ranked adventure; tavern / field for opportunistic events.
3. **Invest long-term** — bank gold and bankable items; spend bloodline skill points; advance subclass path.
4. **Face consequence** — bad choices, combat, curses, or bad luck can kill the heir.
5. **Inherit and continue** — ~10% of carried gold to bank; heirlooms survive; rank and bank persist; new heir at `/create-heir`.

The loop is **idle-friendly** (real-time job shifts, hourly mission board rerolls) but **choice-driven** inside each activity.

---

## Player identity (three layers)

| Layer | What it is | Persists? |
|-------|------------|-----------|
| **Account** | Login, username | Yes |
| **Lineage** | Family name, bank, bloodline skills, adventurer rank, generation, fallen heirs summary | Yes |
| **Heir** | The one character you control right now — level, XP, gear, heir effects | Until death |

At any moment there is **at most one living heir**. The lineage is the real protagonist; heirs are **chapters**.

---

## What persists vs what dies with the heir

| Stays on the lineage / bank | Lost or reset with the heir |
|-----------------------------|-----------------------------|
| Bank gold & banked items | Most carried gold (~90% lost) |
| Bloodline skills & bloodline-scoped effects | Level, XP, non-heirloom gear |
| Adventurer rank & rank XP | Heir-scoped buffs, curses, missions in progress |
| Generation count, family history | Active job shift (ends on death rules) |
| Completed mission IDs (per heir record) | Inventory not banked / not heirloom |

**Design rule:** long power belongs on the **lineage** or **bank**; short-term drama and danger belong on the **heir**.

---

## Death & inheritance (why risk feels real)

When an heir dies:

- **Gold:** roughly 10% of carried gold moves to `lineage.bankGold`; the rest is gone.
- **Items:** heirlooms stay on the line; soulbound and normal loot are lost; banked items remain in the bank.
- **Effects:** `bloodline` effects stay; `generations` effects tick; `heir` effects vanish.
- **Unique skills** (global one-holders) return to the world when the holder dies.
- The lineage’s **dead heir count** and **generation** advance; a new heir must be created to play again.

Players should feel: *I didn’t waste a life if the bank, rank, or bloodline grew — but this life’s story is over.*

---

## Core activities (MVP)

| Activity | Role in the loop |
|----------|------------------|
| **Character** | Who am I this life — class, stats, equipment |
| **Tavern** | Branching story events; gold, XP, items, effects, or **death** |
| **Mission board** | Multi-step **contracts** (10+ fixed beats + optional detours); rank XP and pay |
| **Field encounters** | One-off weighted events while exploring (tavern tab) |
| **Jobs** | Real-time shifts — salary, job XP, promotions; **blocks** other locations while active |
| **Bank** | Deposit gold / bankable items for **next generations** |
| **Skills** | Per-heir, subclass, and **bloodline** trees with locks and costs |
| **Bloodline** | Chronicle — generations, fallen heirs, family-wide progression |
| **Dungeons** | *Planned later* — gated by keys / special quests, not level alone |

**Server authority:** combat outcomes, rewards, death, bank, skills, and mission advancement run in **Cloud Functions**. The client presents choices and replays results.

---

## Mission adventures (guild contracts)

The mission board rolls **hourly slots** from a large pool of contracts (F → SSS), filtered by **adventurer rank** and **heir level**.

Each contract is a **personalized expedition**, not a single combat:

1. **Fixed steps (10+)** — the contract’s story spine: briefing → complications → crisis → payout. These are the **lore** of the job (e.g. find the widow’s cat in town, return it, get paid).
2. **Random interludes** — optional detours between fixed beats, filtered by **setting** (town, forest, cave, mountain, dungeon, coast, wilderness) and **tone** (mild / moderate / dangerous).
3. **Secret interludes** — hidden beats when conditions match: prior choices, level, rank, **completed other contracts**, low morale, etc.

During a run the heir tracks **supplies, morale, and HP%** — a small survival runway on top of narrative choices.

**Tone by setting example:** a “save the cat in town” contract is **mild**, town background, social/discovery beats — not a generic combat grind.

---

## Adventurer rank

Rank (F → SSS) gates **which contracts can appear** and signals player prestige on the lineage. Rank XP comes mainly from **completing missions**. Higher rank should unlock harder stories and payoffs, not just bigger numbers.

---

## Classes, stats & build identity

- **Classes:** Warrior, Rogue, Mage, Priest, Ranger (and subclasses over time).
- **Stats:** strength, dexterity, intelligence, constitution, luck, charisma, faith, **infamy** (gates some content).
- **Items:** weapons, armor, consumables — with **bankable**, **soulbound**, and **heirloom** flags.

Events can acknowledge **class**, **stats**, or **infamy** in requirements or outcomes so the same scene plays differently for different heirs.

---

## Tone & voice

Dark fantasy **family saga**: debts, blessings, curses, petty cruelty, small mercies, royal indifference, relics passed or lost between generations.

Write like a **chronicle**, not an MMO quest log.

- Good: *“The widow wrings her hands at the guild board. Misty never strays far — something spooked her before dusk.”*
- Bad: *“Quest objective: find cat. Go to market.”*

---

## What “personalized adventure” means here

Every event — fixed mission step, random detour, secret beat, tavern branch, or field encounter — should feel like it belongs to **this heir, this contract, this place**, not a shared script.

### Do

- **Anchor in place** — smells, light, who owns the problem, what happens if you fail tonight.
- **Name the stake** — who hired you, what they fear, what they won’t say aloud.
- **Use specific objects** — a locket, a flour-sack trail, a guild seal, not “the item.”
- **Let choices imply character** — bribe, scout, or confront should sound like decisions, not menu labels.
- **Match setting and tone** — town jobs stay human-scale; dungeon jobs feel lethal and claustrophobic.
- **Reward attention** — secret events pay off earlier choices or completed contracts (`completedMissionIds`).
- **Allow consequence** — not every branch is safe; death and loss are part of the fantasy.

### Avoid

- Repeated template phrasing (*“Stage N of contract”*, *“You press on”*, *“The client pays”* with no detail).
- Combat where the story doesn’t need it (especially **mild** town drama).
- Interludes that could happen in any biome without rewriting a line.
- Empty choice subtitles (*“Continue the expedition”*) with no risk/reward hint.

### Fixed vs random vs secret (authoring mindset)

| Type | Writer’s job |
|------|----------------|
| **Fixed (10+ steps)** | Tell **one complete story** for this contract ID — beginning, middle, end, payout. |
| **Random** | One vivid scene that **fits the setting** and can interrupt many contracts without breaking their plot. |
| **Secret** | A reward for attentive or experienced players — *only* when conditions make it feel discovered, not rolled. |

---

## Content files (for implementers)

| Content | File |
|---------|------|
| Mission contracts | `game-data/missions.json` (import: `node scripts/import-mission-bible.mjs`) |
| Shared mission detours | `game-data/mission-interludes.json` (200 bible interludes) |
| **Canonical authoring source** | `docs/an_average_rpg_event_mission_bible.md` |
| Field encounters (tavern) | `game-data/events.json` |
| Tavern story events | `game-data/events.json` (and related) |
| Technical adventure rules | `.cursor/rules/adventure-campaigns.mdc` |

**Important:** Mission and interlude content is authored in `docs/an_average_rpg_event_mission_bible.md` and imported via `scripts/import-mission-bible.mjs`. Legacy generators (`generate-missions.mjs`, `generate-mission-interludes.mjs`) are deprecated.

---

## Ready for your event list

When you send missions, interludes, or tavern events, each entry should ideally specify:

- **ID** (stable slug) and **display name**
- **Setting** (town, forest, cave, mountain, dungeon, coast, wilderness)
- **Tone** (mild / moderate / dangerous)
- **Rank band** (F–SSS) and any **level / prerequisite**
- **Fixed steps** (10+ for full contracts) — title + prose + beat type (social, discovery, hazard, combat if any)
- **Random / secret** (if any) — when they fire and what condition unlocks them
- **Scene** — which background fits (see `apps/web/public/scenes/`)

We will wire your list into `game-data/` so the board and UI treat it as canonical — not generic generator output.

---

## Summary

| Question | Answer |
|----------|--------|
| What is the game? | Idle roguelite **bloodline** saga in dark fantasy |
| Who is the hero? | The **family line**; each heir is one life |
| What is the core loop? | Play heir → die → inherit → next generation |
| What should events feel like? | **Personal chronicles** tied to place, stake, and consequence |
| What comes next? | Your **event list** replaces generic scripts with authored adventures |
