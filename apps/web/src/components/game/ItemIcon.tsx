import { Icon } from "@iconify/react";
import type { ItemData } from "@bloodline/shared/types";
import { getItemById } from "@/lib/items";
import {
  getEquipSlotIconName,
  getItemIconName,
  type EquipSlotIconKey,
} from "@/lib/itemIcons";

interface ItemIconProps {
  itemId?: string;
  item?: ItemData;
  size?: number;
  className?: string;
  title?: string;
}

/** Renders a game item icon via the Iconify on-demand API. */
export function ItemIcon({ itemId, item, size = 20, className = "", title }: ItemIconProps) {
  const data = item ?? (itemId ? getItemById(itemId) : undefined);
  const icon = getItemIconName(data, itemId ?? data?.id);
  const label = title ?? data?.name ?? itemId ?? "Item";

  return (
    <span title={label} className="inline-flex">
      <Icon
        icon={icon}
        width={size}
        height={size}
        className={`shrink-0 ${className}`}
        aria-hidden
      />
    </span>
  );
}

interface EquipSlotIconProps {
  slot: EquipSlotIconKey;
  size?: number;
  className?: string;
}

export function EquipSlotIcon({ slot, size = 16, className = "" }: EquipSlotIconProps) {
  return (
    <Icon
      icon={getEquipSlotIconName(slot)}
      width={size}
      height={size}
      className={`shrink-0 opacity-70 ${className}`}
      aria-hidden
    />
  );
}
