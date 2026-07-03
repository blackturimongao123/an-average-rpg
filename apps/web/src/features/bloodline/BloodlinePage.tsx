import { useGameStore } from "@/stores/gameStore";
import { GitBranch, Skull, Crown, Heart, Star, Shield } from "lucide-react";

export function BloodlinePage() {
  const { lineage, heir } = useGameStore();

  if (!lineage) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No bloodline found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <GitBranch className="w-8 h-8 text-gold" />
        <div>
          <h1 className="font-display text-2xl font-bold">House {lineage.familyName}</h1>
          <p className="text-muted-foreground">Your bloodline's legacy</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="card p-6 text-center">
          <Crown className="w-10 h-10 text-gold mx-auto mb-3" />
          <p className="text-3xl font-bold font-display">{lineage.generation}</p>
          <p className="text-sm text-muted-foreground">Current Generation</p>
        </div>

        <div className="card p-6 text-center">
          <Skull className="w-10 h-10 text-blood mx-auto mb-3" />
          <p className="text-3xl font-bold font-display">{lineage.publicSummary?.deadHeirs || lineage.generation - 1}</p>
          <p className="text-sm text-muted-foreground">Fallen Heirs</p>
        </div>

        <div className="card p-6 text-center">
          <Shield className="w-10 h-10 text-primary mx-auto mb-3" />
          <p className="text-3xl font-bold font-display">{lineage.publicSummary?.highestGeneration || lineage.generation}</p>
          <p className="text-sm text-muted-foreground">Highest Generation</p>
        </div>
      </div>

      {heir && (
        <div className="card p-6 mb-8">
          <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-green-400" />
            Current Heir
          </h2>
          
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-2xl font-display text-primary">
                {heir.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-display text-xl font-semibold">{heir.name}</h3>
              <p className="text-muted-foreground capitalize">
                Level {heir.level} {heir.classId} • {heir.raceId}
              </p>
              
              <div className="grid grid-cols-4 gap-2 mt-4">
                {Object.entries(heir.stats).slice(0, 4).map(([stat, value]) => (
                  <div key={stat} className="text-center p-2 bg-secondary/50 rounded">
                    <p className="text-xs text-muted-foreground capitalize">{stat}</p>
                    <p className="font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card p-6">
        <h2 className="font-display text-lg font-semibold mb-4">Family Tree</h2>
        
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
          
          {Array.from({ length: Math.min(lineage.generation, 5) }).map((_, i) => {
            const gen = lineage.generation - i;
            const isCurrentHeir = i === 0 && heir;
            
            return (
              <div key={gen} className="relative flex items-center gap-4 mb-6 last:mb-0">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 ${
                  isCurrentHeir ? "bg-primary/20 border-2 border-primary" : "bg-secondary border border-border"
                }`}>
                  {isCurrentHeir ? (
                    <Heart className="w-5 h-5 text-green-400" />
                  ) : (
                    <Skull className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-semibold">
                    {isCurrentHeir ? heir.name : `Heir of Generation ${gen}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Generation {gen}
                    {isCurrentHeir && ` • ${heir.classId}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {lineage.generation > 5 && (
          <p className="text-sm text-muted-foreground text-center mt-4">
            ...and {lineage.generation - 5} more generations
          </p>
        )}
      </div>

      <div className="card p-6 mt-6">
        <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-gold" />
          Active Bloodline Effects
        </h2>
        
        {heir?.effectIds && heir.effectIds.length > 0 ? (
          <div className="space-y-2">
            {heir.effectIds.map((effectId) => (
              <div key={effectId} className="p-3 bg-secondary/50 rounded-md">
                <p className="font-medium capitalize">{effectId.replace(/_/g, " ")}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">
            No active bloodline effects
          </p>
        )}
      </div>
    </div>
  );
}
