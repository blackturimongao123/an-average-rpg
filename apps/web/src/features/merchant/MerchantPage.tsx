import { useEffect, useState } from "react";
import { useGameStore } from "@/stores/gameStore";
import { useAuthStore } from "@/stores/authStore";
import { BusyActivityBlock, useIsHeirBusyOnJob } from "@/components/game/BusyActivityBlock";
import { getPlayerMerchantBoard, purchasePlayerMerchantItem } from "@/firebase/merchantBoard";
import { getFirebaseErrorMessage } from "@/lib/firebaseErrors";
import { getItemById } from "@/lib/items";
import { ItemIcon } from "@/components/game/ItemIcon";
import {
  formatMerchantCountdown,
  getMerchantRerollCountdownMs,
} from "@/lib/merchant";
import { formatGold, getRarityColor } from "@/lib/utils";
import type { MerchantBoard } from "@bloodline/shared/types";
import { Clock, Coins, ShoppingBag, Store } from "lucide-react";

export function MerchantPage() {
  const { user } = useAuthStore();
  const { lineage, heir, setLineage, setHeir } = useGameStore();
  const busyOnJob = useIsHeirBusyOnJob();
  const [board, setBoard] = useState<MerchantBoard | null>(lineage?.merchantBoard ?? null);
  const [countdownMs, setCountdownMs] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !lineage || !heir) return;

    const { board: freshBoard } = getPlayerMerchantBoard(lineage);
    setBoard(freshBoard);
    setLineage({ ...lineage, merchantBoard: freshBoard });
  }, [user, lineage?.id, heir?.id]);

  useEffect(() => {
    if (!board) return;
    const tick = () => setCountdownMs(getMerchantRerollCountdownMs(board.nextRerollAtMs));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [board?.nextRerollAtMs]);

  if (!lineage || !heir) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No active heir</p>
      </div>
    );
  }

  function handleBuy(slotIndex: number) {
    if (!user || !lineage || !heir) return;
    setError(null);
    try {
      if (!board) throw new Error("Merchant board is not ready");
      const result = purchasePlayerMerchantItem(lineage, heir, board, slotIndex);
      setHeir({
        ...heir,
        gold: result.heirGoldAfter,
        inventory: result.inventory,
      });
      setBoard(result.merchantBoard as MerchantBoard);
      setLineage({ ...lineage, merchantBoard: result.merchantBoard as MerchantBoard });
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Store className="w-8 h-8 text-primary" />
        <div>
          <h1 className="font-display text-2xl font-bold">Traveling Merchant</h1>
          <p className="text-muted-foreground">Rare gear rotates every eight hours</p>
        </div>
      </div>

      {busyOnJob && <BusyActivityBlock activityName="merchant" />}

      <div className="card p-4 mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Coins className="w-4 h-4 text-gold" />
          <span>
            Carried gold: <span className="gold-text font-medium">{formatGold(heir.gold)}</span>
          </span>
        </div>
        {board && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Next restock in {formatMerchantCountdown(countdownMs)}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="card p-4 mb-6 border-red-500/30 bg-red-500/10 text-red-300 text-sm">
          {error}
        </div>
      )}

      {!board || board.slots.every((slot) => slot.status === "empty") ? (
        <div className="card p-8 text-center text-muted-foreground">
          <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>The merchant&apos;s shelves are bare. Check back after the next restock.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {board.slots.map((slot) => {
            if (slot.status !== "available" || !slot.itemId || slot.price === null) {
              return (
                <div key={slot.slotIndex} className="card p-5 opacity-50">
                  <p className="text-sm text-muted-foreground">Sold out</p>
                </div>
              );
            }

            const item = getItemById(slot.itemId);
            const canAfford = heir.gold >= slot.price;
            const disabled = busyOnJob || !canAfford;

            return (
              <div key={slot.slotIndex} className="card p-5 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-secondary/60 border border-border">
                    <ItemIcon itemId={slot.itemId} item={item} size={32} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`font-semibold ${getRarityColor(item?.rarity ?? "common")}`}>
                      {item?.name ?? slot.itemId}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize mt-1">
                      {item?.rarity ?? "unknown"} • {item?.itemType ?? "item"}
                    </p>
                  </div>
                </div>
                {item?.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                )}
                <div className="mt-auto flex items-center justify-between">
                  <span className="gold-text font-medium">{slot.price} gold</span>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => void handleBuy(slot.slotIndex)}
                    className="btn-primary text-sm px-3 py-1.5 disabled:opacity-50"
                  >
                    {canAfford ? "Buy" : "Too poor"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
