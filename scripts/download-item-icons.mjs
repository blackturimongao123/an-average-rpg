/**
 * Downloads Iconify SVGs into apps/web/public/item-icons/.
 * Run: pnpm icons:download-item
 * API: https://api.iconify.design/{prefix}/{name}.svg
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../apps/web/public/item-icons");

/** Icons referenced by apps/web/src/lib/itemIcons.ts today */
const CORE_ITEM_ICONS = [
  "game-icons:potion-ball",
  "game-icons:crystal-ball",
  "game-icons:holy-symbol",
  "game-icons:book-cover",
  "game-icons:lockpicks",
  "game-icons:compass",
  "game-icons:two-coins",
  "game-icons:unlit-bomb",
  "game-icons:medal",
  "game-icons:necklace",
  "game-icons:crown",
  "game-icons:gladius",
  "game-icons:energy-sword",
  "game-icons:broadsword",
  "game-icons:stiletto",
  "game-icons:scale-mail",
  "game-icons:two-handed-sword",
  "game-icons:plain-dagger",
  "game-icons:pocket-bow",
  "game-icons:wizard-staff",
  "game-icons:flanged-mace",
  "game-icons:round-shield",
  "game-icons:sword-brandish",
  "game-icons:breastplate",
  "game-icons:gem-necklace",
  "game-icons:ore",
  "game-icons:scroll-unfurled",
  "game-icons:robe",
  "game-icons:leather-armor",
  "game-icons:chain-mail",
  "game-icons:ring",
  "game-icons:backpack",
];

/** Extra RPG icons for future items, UI, loot, dungeons, etc. */
const EXTRA_RPG_ICONS = [
  "game-icons:war-axe",
  "game-icons:battle-axe",
  "game-icons:axe-swing",
  "game-icons:spear-hook",
  "game-icons:trident",
  "game-icons:hammer-drop",
  "game-icons:arrowhead",
  "game-icons:quiver",
  "game-icons:heart-bottle",
  "game-icons:drink-me",
  "game-icons:gold-bar",
  "game-icons:coins",
  "game-icons:treasure-map",
  "game-icons:chest",
  "game-icons:locked-chest",
  "game-icons:open-chest",
  "game-icons:key",
  "game-icons:skeleton-key",
  "game-icons:crossed-swords",
  "game-icons:gem-pendant",
  "game-icons:boots",
  "game-icons:helmet",
  "game-icons:anvil",
  "game-icons:fireball",
  "game-icons:lightning-arc",
  "game-icons:meat",
  "game-icons:bread",
  "game-icons:castle",
  "game-icons:holy-grail",
  "game-icons:evil-eyes",
  "game-icons:rune-stone",
  "game-icons:poison-bottle",
  "game-icons:bow-arrow",
  "game-icons:crossbow",
  "game-icons:katana",
  "game-icons:scythe",
  "game-icons:torch",
  "game-icons:campfire",
  "game-icons:hourglass",
  "game-icons:dice-six-faces-five",
  "game-icons:relic-blade",
  "game-icons:healing",
  "game-icons:magic-potion",
  "game-icons:gold-stack",
  "game-icons:dragon-head",
  "game-icons:dungeon-gate",
  "game-icons:shield-reflect",
  "game-icons:sword-clash",
  "game-icons:sword-array",
  "game-icons:armor-vest",
  "game-icons:bowman",
  "game-icons:wizard-face",
  "game-icons:scroll-quill",
  "game-icons:book-aura",
  "game-icons:crystal-shine",
  "game-icons:gem-chain",
  "game-icons:cursed-star",
  "game-icons:death-skull",
  "game-icons:bone-knife",
];

export const ICONIFY_ICONS = [...new Set([...CORE_ITEM_ICONS, ...EXTRA_RPG_ICONS])];

export function iconifyToFileName(iconifyId) {
  const [prefix, name] = iconifyId.split(":");
  if (!prefix || !name) throw new Error(`Invalid icon id: ${iconifyId}`);
  return `${prefix}-${name}.svg`;
}

async function downloadIcon(iconifyId) {
  const [prefix, name] = iconifyId.split(":");
  const url = `https://api.iconify.design/${prefix}/${name}.svg`;
  const fileName = iconifyToFileName(iconifyId);
  const outPath = path.join(OUT_DIR, fileName);

  const response = await fetch(url);
  if (!response.ok) {
    return { fileName, ok: false, status: response.status };
  }

  const svg = await response.text();
  await writeFile(outPath, svg, "utf8");
  return { fileName, ok: true };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  let ok = 0;
  let failed = 0;

  for (const iconId of ICONIFY_ICONS) {
    const result = await downloadIcon(iconId);
    if (result.ok) {
      console.log(`✓ ${result.fileName}`);
      ok += 1;
    } else {
      console.warn(`✗ ${iconifyToFileName(iconId)} (${result.status})`);
      failed += 1;
    }
  }

  console.log(`\nDownloaded ${ok} icons to ${OUT_DIR}`);
  if (failed > 0) {
    console.warn(`${failed} icon(s) failed — remove or replace them in the script.`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
