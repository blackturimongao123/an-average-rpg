import { migrateEquipment } from "@bloodline/shared/equipment";
import { buildCombatProfile, type CombatData, type CombatItemDef } from "@bloodline/shared/combat";
import type { Heir } from "@bloodline/shared/types";

import combatDataJson from "@game-data/combat.json";
import itemsData from "@game-data/items.json";

const combatData = combatDataJson as CombatData;

const combatItems: CombatItemDef[] = (itemsData.items as Array<Record<string, unknown>>).map(
  (item) => ({
    id: item.id as string,
    weaponDamage: item.weaponDamage as number | undefined,
    stats: item.stats as CombatItemDef["stats"],
    armorValue: item.armorValue as number | undefined,
  })
);

export function getHeirCombatProfile(heir: Heir) {
  const equipment = migrateEquipment(heir.equipment);

  return buildCombatProfile(
    {
      id: heir.id,
      classId: heir.classId,
      level: heir.level,
      stats: heir.stats,
      skillIds: heir.skillIds,
      equipment: {
        mainWeapon: equipment.mainWeapon,
        armor: equipment.armor,
      },
    },
    combatItems,
    combatData
  );
}

export { combatData };
