import { useState } from "react";
import {
  Backpack,
  FlaskConical,
  Package,
  Scroll,
  Shield,
  Sparkles,
  Sword,
} from "lucide-react";
import type { ItemData } from "@bloodline/shared/types";
import { getItemById } from "@/lib/items";
import {
  getEquipSlotIconName,
  getEquipSlotFallback,
  getItemIconFallback,
  getItemIconName,
  iconifyToLocalUrl,
  type EquipSlotIconKey,
  type ItemIconFallback,
} from "@/lib/itemIcons";

function LucideItemFallback({
  kind,
  size,
  className = "",
}: {
  kind: ItemIconFallback;
  size: number;
  className?: string;
}) {
  const props = {
    size,
    className: `shrink-0 ${className}`,
    "aria-hidden": true as const,
  };

  switch (kind) {
    case "weapon":
      return <Sword {...props} />;
    case "shield":
    case "armor":
      return <Shield {...props} />;
    case "accessory":
      return <Sparkles {...props} />;
    case "consumable":
      return <FlaskConical {...props} />;
    case "material":
      return <Package {...props} />;
    case "quest":
      return <Scroll {...props} />;
    default:
      return <Backpack {...props} />;
  }
}

function BundledItemIcon({
  iconifyId,
  fallback,
  size,
  className,
  label,
}: {
  iconifyId: string;
  fallback: ItemIconFallback;
  size: number;
  className?: string;
  label: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <LucideItemFallback kind={fallback} size={size} className={className} />;
  }

  return (
    <img
      src={iconifyToLocalUrl(iconifyId)}
      width={size}
      height={size}
      alt=""
      aria-hidden
      title={label}
      className={`shrink-0 object-contain ${className}`}
      onError={() => setFailed(true)}
    />
  );
}

interface ItemIconProps {
  itemId?: string;
  item?: ItemData;
  size?: number;
  className?: string;
  title?: string;
}

/** Renders a bundled item SVG with Lucide fallback if the asset fails to load. */
export function ItemIcon({ itemId, item, size = 20, className = "", title }: ItemIconProps) {
  const data = item ?? (itemId ? getItemById(itemId) : undefined);
  const iconifyId = getItemIconName(data, itemId ?? data?.id);
  const label = title ?? data?.name ?? itemId ?? "Item";
  const fallback = getItemIconFallback(data, itemId);

  return (
    <span title={label} className="inline-flex">
      <BundledItemIcon
        iconifyId={iconifyId}
        fallback={fallback}
        size={size}
        className={className}
        label={label}
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
  const iconifyId = getEquipSlotIconName(slot);
  const fallback = getEquipSlotFallback(slot);

  return (
    <BundledItemIcon
      iconifyId={iconifyId}
      fallback={fallback}
      size={size}
      className={`opacity-70 ${className}`}
      label={slot}
    />
  );
}
