import { useState } from "react";
import { useGameStore } from "@/stores/gameStore";
import { saveGoldTransfer } from "@/firebase/bankClient";
import { PiggyBank, Coins, ArrowDownToLine, ArrowUpFromLine, Package } from "lucide-react";

export function BankPage() {
  const { lineage, heir, updateHeirGold, updateBankGold } = useGameStore();
  const [goldAmount, setGoldAmount] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleDeposit = () => {
    if (!lineage || !heir) return;
    const amount = parseInt(goldAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessage({ type: "error", text: "Enter a valid amount" });
      return;
    }
    if (amount > heir.gold) {
      setMessage({ type: "error", text: "Insufficient gold" });
      return;
    }

    setMessage(null);
    const heirGold = heir.gold - amount;
    const bankGold = lineage.bankGold + amount;
    updateHeirGold(heirGold);
    updateBankGold(bankGold);
    saveGoldTransfer(lineage.id, heir.id, heirGold, bankGold);
    setGoldAmount("");
    setMessage({ type: "success", text: `Deposited ${amount} gold` });
  };

  const handleWithdraw = () => {
    if (!lineage || !heir) return;
    const amount = parseInt(goldAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessage({ type: "error", text: "Enter a valid amount" });
      return;
    }
    if (amount > lineage.bankGold) {
      setMessage({ type: "error", text: "Insufficient gold in bank" });
      return;
    }

    setMessage(null);
    const heirGold = heir.gold + amount;
    const bankGold = lineage.bankGold - amount;
    updateHeirGold(heirGold);
    updateBankGold(bankGold);
    saveGoldTransfer(lineage.id, heir.id, heirGold, bankGold);
    setGoldAmount("");
    setMessage({ type: "success", text: `Withdrew ${amount} gold` });
  };

  if (!heir || !lineage) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Create an heir to access the bank</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <PiggyBank className="w-8 h-8 text-gold" />
        <div>
          <h1 className="font-display text-2xl font-bold">Family Bank</h1>
          <p className="text-muted-foreground">Store wealth for future generations</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <div className="card p-6">
          <h2 className="font-display text-lg font-semibold mb-4">Your Gold</h2>
          <div className="flex items-center gap-2 text-3xl font-bold gold-text">
            <Coins className="w-8 h-8" />
            {heir.gold}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Carried by {heir.name}
          </p>
        </div>

        <div className="card p-6">
          <h2 className="font-display text-lg font-semibold mb-4">Bank Vault</h2>
          <div className="flex items-center gap-2 text-3xl font-bold gold-text">
            <PiggyBank className="w-8 h-8" />
            {lineage.bankGold}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Safe across generations
          </p>
        </div>
      </div>

      <div className="card p-6 mb-8">
        <h2 className="font-display text-lg font-semibold mb-4">Transfer Gold</h2>
        
        {message && (
          <div className={`p-3 rounded-md mb-4 ${
            message.type === "success" ? "bg-green-900/20 text-green-400" : "bg-destructive/20 text-destructive"
          }`}>
            {message.text}
          </div>
        )}

        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="label block mb-1.5">Amount</label>
            <input
              type="number"
              value={goldAmount}
              onChange={(e) => setGoldAmount(e.target.value)}
              className="input"
              placeholder="0"
              min="1"
            />
          </div>
          <button
            onClick={handleDeposit}
            className="btn-primary flex items-center gap-2"
          >
            <ArrowDownToLine className="w-4 h-4" />
            Deposit
          </button>
          <button
            onClick={handleWithdraw}
            className="btn-secondary flex items-center gap-2"
          >
            <ArrowUpFromLine className="w-4 h-4" />
            Withdraw
          </button>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold">Bank Vault Items</h2>
          <span className="text-sm text-muted-foreground">
            0 / {lineage.bankSlots} slots
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: lineage.bankSlots }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-md border border-dashed border-border flex items-center justify-center"
            >
              <Package className="w-6 h-6 text-muted-foreground/30" />
            </div>
          ))}
        </div>

        <p className="text-sm text-muted-foreground mt-4 text-center">
          Items stored in the bank survive death and pass to your next heir
        </p>
      </div>
    </div>
  );
}
