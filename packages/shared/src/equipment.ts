import type { Equipment } from "./types";

/** Normalize legacy single-weapon equipment docs to dual-slot shape. */
export function migrateEquipment(raw: Record<string, unknown> | Equipment | null | undefined): Equipment {
  if (!raw) {
    return { mainWeapon: null, secondaryWeapon: null, armor: null, accessory: null };
  }

  const legacyWeapon =
    (raw as Equipment).mainWeapon ??
    (raw as { weapon?: string | null }).weapon ??
    null;

  return {
    mainWeapon: legacyWeapon,
    secondaryWeapon: (raw as Equipment).secondaryWeapon ?? null,
    armor: (raw as Equipment).armor ?? null,
    accessory: (raw as Equipment).accessory ?? null,
  };
}
