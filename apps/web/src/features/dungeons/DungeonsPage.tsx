import { useGameStore } from "@/stores/gameStore";
import { Castle, KeyRound, ScrollText } from "lucide-react";

export function DungeonsPage() {
  const heir = useGameStore((s) => s.heir);

  if (!heir) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Create an heir to explore dungeons</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Castle className="w-8 h-8 text-gold" />
        <div>
          <h1 className="font-display text-2xl font-bold">Dungeons</h1>
          <p className="text-muted-foreground">Deep expeditions — unlocked by keys and special quests</p>
        </div>
      </div>

      <div className="card p-8 text-center space-y-4">
        <p className="font-display text-xl font-semibold text-gold">Will come later</p>
        <p className="text-muted-foreground max-w-md mx-auto">
          Dungeons are endgame-style content. They will not be level-gated — you will need dungeon keys,
          bloodline quests, or other special conditions to enter each one.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary">
            <KeyRound className="w-4 h-4 text-gold" />
            Dungeon keys
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary">
            <ScrollText className="w-4 h-4 text-gold" />
            Special quests
          </span>
        </div>
      </div>
    </div>
  );
}
