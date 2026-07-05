import type { ItemData } from "@bloodline/shared/types";
import { getItemById } from "@/lib/items";

/** Per-item overrides — Iconify names: https://iconify.design */
const ITEM_ID_ICONS: Record<string, string> = {
  health_potion: "game-icons:heart-bottle",
  mana_crystal: "game-icons:crystal-ball",
  holy_symbol: "game-icons:holy-symbol",
  holy_tome: "game-icons:book-cover",
  thieves_tools: "game-icons:lockpicks",
  trail_compass: "game-icons:compass",
  lucky_coin: "game-icons:two-coins",
  mystery_artifact: "game-icons:rune-stone",
  thieves_badge: "game-icons:medal",
  cursed_amulet: "game-icons:cursed-star",
  goblin_kings_crown: "game-icons:crown",
  crown_of_the_last_king: "game-icons:crown",
  family_heirloom_sword: "game-icons:relic-blade",
  voidheart_blade: "game-icons:energy-sword",
  veterans_blade: "game-icons:broadsword",
  duelist_sword: "game-icons:stiletto",
  dragon_scale_armor: "game-icons:scale-mail",
};

const WEAPON_CATEGORY_ICONS: Record<string, string> = {
  sword: "game-icons:broadsword",
  greatsword: "game-icons:two-handed-sword",
  dagger: "game-icons:plain-dagger",
  bow: "game-icons:pocket-bow",
  staff: "game-icons:wizard-staff",
  mace: "game-icons:flanged-mace",
  shield: "game-icons:round-shield",
  tome: "game-icons:book-cover",
  axe: "game-icons:war-axe",
  spear: "game-icons:spear-hook",
  hammer: "game-icons:hammer-drop",
  crossbow: "game-icons:crossbow",
  scythe: "game-icons:scythe",
  katana: "game-icons:katana",
};

const ITEM_TYPE_ICONS: Record<ItemData["itemType"], string> = {
  weapon: "game-icons:sword-brandish",
  armor: "game-icons:breastplate",
  accessory: "game-icons:gem-necklace",
  consumable: "game-icons:potion-ball",
  material: "game-icons:ore",
  quest: "game-icons:scroll-unfurled",
};

export type EquipSlotIconKey = "main" | "secondary" | "armor" | "accessory";

export type ItemIconFallback =
  | "weapon"
  | "shield"
  | "armor"
  | "accessory"
  | "consumable"
  | "material"
  | "quest"
  | "bag";

const EQUIP_SLOT_ICONS: Record<EquipSlotIconKey, string> = {
  main: "game-icons:sword-brandish",
  secondary: "game-icons:round-shield",
  armor: "game-icons:breastplate",
  accessory: "game-icons:gem-necklace",
};

function armorIconForItem(item: ItemData): string {
  const id = item.id;
  if (id.includes("robe")) return "game-icons:robe";
  if (id.includes("cloth")) return "game-icons:robe";
  if (id.includes("leather")) return "game-icons:leather-armor";
  if (id.includes("chain") || id.includes("mail")) return "game-icons:chain-mail";
  if (id.includes("scale") || id.includes("dragon")) return "game-icons:scale-mail";
  return ITEM_TYPE_ICONS.armor;
}

function accessoryIconForItem(item: ItemData): string {
  const id = item.id;
  if (item.isCursed || id.includes("cursed")) return "game-icons:cursed-star";
  if (item.rarity === "unique") return "game-icons:holy-grail";
  if (item.isHeirloom) return "game-icons:relic-blade";
  if (id.includes("ring")) return "game-icons:ring";
  if (id.includes("amulet") || id.includes("necklace")) return "game-icons:gem-necklace";
  if (id.includes("crown")) return "game-icons:crown";
  if (id.includes("coin")) return "game-icons:two-coins";
  if (id.includes("compass")) return "game-icons:compass";
  if (id.includes("crystal")) return "game-icons:crystal-ball";
  if (id.includes("symbol") || id.includes("holy")) return "game-icons:holy-symbol";
  if (id.includes("tools") || id.includes("lockpick")) return "game-icons:lockpicks";
  if (id.includes("badge") || id.includes("medal")) return "game-icons:medal";
  if (id.includes("artifact") || id.includes("relic") || id.includes("rune")) return "game-icons:rune-stone";
  return ITEM_TYPE_ICONS.accessory;
}

function consumableIconForItem(item: ItemData): string {
  const id = item.id;
  if (id.includes("health") || id.includes("heal")) return "game-icons:heart-bottle";
  if (id.includes("mana")) return "game-icons:magic-potion";
  if (id.includes("poison")) return "game-icons:poison-bottle";
  return ITEM_TYPE_ICONS.consumable;
}

/** Convert Iconify id to bundled public asset URL. */
export function iconifyToLocalUrl(iconifyId: string): string {
  const [prefix, name] = iconifyId.split(":");
  return `${import.meta.env.BASE_URL}item-icons/${prefix}-${name}.svg`;
}

export function getEquipSlotFallback(slot: EquipSlotIconKey): ItemIconFallback {
  switch (slot) {
    case "main":
      return "weapon";
    case "secondary":
      return "shield";
    case "armor":
      return "armor";
    case "accessory":
      return "accessory";
  }
}

export function getItemIconFallback(
  item: ItemData | undefined,
  itemId?: string,
  slot?: EquipSlotIconKey
): ItemIconFallback {
  if (slot) return getEquipSlotFallback(slot);
  if (!item) return "bag";

  switch (item.itemType) {
    case "weapon":
      return item.weaponCategory === "shield" ? "shield" : "weapon";
    case "armor":
      return "armor";
    case "accessory":
      return "accessory";
    case "consumable":
      return "consumable";
    case "material":
      return "material";
    case "quest":
      return "quest";
    default:
      return "bag";
  }
}

/** Resolve an Iconify icon id for game item data (bundled SVG in public/item-icons). */
export function getItemIconName(item: ItemData | undefined, itemId?: string): string {
  if (!item) {
    if (itemId && ITEM_ID_ICONS[itemId]) return ITEM_ID_ICONS[itemId];
    return "game-icons:backpack";
  }

  if (ITEM_ID_ICONS[item.id]) return ITEM_ID_ICONS[item.id];

  if (item.itemType === "weapon" && item.weaponCategory) {
    const categoryIcon = WEAPON_CATEGORY_ICONS[item.weaponCategory];
    if (categoryIcon) return categoryIcon;
  }

  if (item.itemType === "armor") return armorIconForItem(item);
  if (item.itemType === "accessory") return accessoryIconForItem(item);
  if (item.itemType === "consumable") return consumableIconForItem(item);

  return ITEM_TYPE_ICONS[item.itemType] ?? "game-icons:backpack";
}

export function getItemIconNameById(itemId: string): string {
  return getItemIconName(getItemById(itemId), itemId);
}

export function getEquipSlotIconName(slot: EquipSlotIconKey): string {
  return EQUIP_SLOT_ICONS[slot];
}
