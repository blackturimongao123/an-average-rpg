import { getRarityColor } from "@/lib/utils";
import { getItemById } from "@/lib/items";

export function ItemChip({
  itemId,
  onClick,
  selected,
}: {
  itemId: string;
  onClick?: () => void;
  selected?: boolean;
}) {
  const item = getItemById(itemId);
  const rarity = item?.rarity ?? "common";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
        selected ? "border-primary bg-primary/10" : "border-border bg-secondary/50 hover:bg-secondary"
      } ${onClick ? "cursor-pointer" : "cursor-default"}`}
    >
      <span className={getRarityColor(rarity)}>{item?.name ?? itemId}</span>
    </button>
  );
}
