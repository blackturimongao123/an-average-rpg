import { useState } from "react";
import { Shield, Sword, Sparkles, Link2 } from "lucide-react";
import { migrateEquipment } from "@bloodline/shared/equipment";
import type { Equipment, Heir } from "@bloodline/shared/types";
import { useGameStore } from "@/stores/gameStore";
import { equipItem, unequipItem } from "@/firebase/functions";
import { getItemName, isTwoHandedItem } from "@/lib/items";
import { getRarityColor } from "@/lib/utils";
import { getItemById } from "@/lib/items";
import { ItemChip } from "./ItemChip";

type SlotKey = "main" | "secondary" | "armor" | "accessory";

function slotLabel(slot: SlotKey): string {
  switch (slot) {
    case "main":
      return "Main Weapon";
    case "secondary":
      return "Secondary";
    case "armor":
      return "Armor";
    case "accessory":
      return "Accessory";
  }
}

function getEquippedId(equipment: Equipment, slot: SlotKey): string | null {
  switch (slot) {
    case "main":
      return equipment.mainWeapon;
    case "secondary":
      return equipment.secondaryWeapon;
    case "armor":
      return equipment.armor;
    case "accessory":
      return equipment.accessory;
  }
}

export function EquipmentPanel({ heir }: { heir: Heir }) {
  const { lineage, setHeir } = useGameStore();
  const [activeSlot, setActiveSlot] = useState<SlotKey | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const equipment = migrateEquipment(heir.equipment as Equipment & { weapon?: string | null });
  const twoHandMain = isTwoHandedItem(equipment.mainWeapon);

  async function handleEquip(itemId: string) {
    if (!lineage || !activeSlot) return;
    setBusy(true);
    setError(null);
    try {
      const result = await equipItem({
        lineageId: lineage.id,
        heirId: heir.id,
        itemId,
        slot: activeSlot,
      });
      setHeir({
        ...heir,
        equipment: result.data.equipment,
        inventory: result.data.inventory,
      });
      setActiveSlot(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to equip item");
    } finally {
      setBusy(false);
    }
  }

  async function handleUnequip(slot: SlotKey) {
    if (!lineage) return;
    setBusy(true);
    setError(null);
    try {
      const result = await unequipItem({
        lineageId: lineage.id,
        heirId: heir.id,
        slot,
      });
      setHeir({
        ...heir,
        equipment: result.data.equipment,
        inventory: result.data.inventory,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unequip item");
    } finally {
      setBusy(false);
    }
  }

  function renderSlot(slot: SlotKey, className = "") {
    const itemId = getEquippedId(equipment, slot);
    const item = itemId ? getItemById(itemId) : undefined;
    const lockedSecondary = slot === "secondary" && twoHandMain;

    return (
      <button
        type="button"
        disabled={busy || lockedSecondary}
        onClick={() => {
          if (itemId && !activeSlot) {
            void handleUnequip(slot);
            return;
          }
          setActiveSlot(activeSlot === slot ? null : slot);
        }}
        className={`p-3 rounded-md border border-border bg-secondary/40 text-left transition-colors hover:bg-secondary/70 disabled:opacity-60 ${className}`}
      >
        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
          {slot === "main" || slot === "secondary" ? (
            <Sword className="w-3 h-3" />
          ) : slot === "armor" ? (
            <Shield className="w-3 h-3" />
          ) : (
            <Sparkles className="w-3 h-3" />
          )}
          {slotLabel(slot)}
          {lockedSecondary && <Link2 className="w-3 h-3 text-gold" aria-label="Two-handed" />}
        </p>
        <p className={`font-medium text-sm ${item ? getRarityColor(item.rarity) : "text-muted-foreground"}`}>
          {lockedSecondary ? getItemName(equipment.mainWeapon) : getItemName(itemId)}
        </p>
        {twoHandMain && slot === "main" && (
          <p className="text-[10px] text-gold mt-1">Two-Handed</p>
        )}
      </button>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3 items-center">
        <div />
        {renderSlot("armor")}
        <div />

        {renderSlot("accessory")}
        <div className="flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
            <span className="text-3xl font-display text-primary">{heir.name.charAt(0)}</span>
          </div>
        </div>
        <div className="hidden md:block" />

        <div className="col-span-3 grid grid-cols-2 gap-3">
          {renderSlot("main")}
          {renderSlot("secondary")}
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {activeSlot && (
        <div className="rounded-md border border-border p-3 bg-secondary/20">
          <p className="text-sm text-muted-foreground mb-2">
            Equip to {slotLabel(activeSlot)} (click item)
          </p>
          <div className="flex flex-wrap gap-2">
            {heir.inventory.length === 0 ? (
              <p className="text-sm text-muted-foreground">No items in inventory</p>
            ) : (
              heir.inventory.map((itemId, index) => (
                <ItemChip
                  key={`${itemId}-${index}`}
                  itemId={itemId}
                  onClick={() => void handleEquip(itemId)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
