import { Swords, Zap, Shield } from "lucide-react";
import { getHeirCombatProfile } from "@/lib/combatProfile";
import type { Heir } from "@bloodline/shared/types";

interface CombatProfilePanelProps {
  heir: Heir;
}

export function CombatProfilePanel({ heir }: CombatProfilePanelProps) {
  const profile = getHeirCombatProfile(heir);

  if (!profile) {
    return (
      <div className="card p-6">
        <p className="text-sm text-muted-foreground">Combat profile unavailable for this class.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold flex items-center gap-2">
            <Swords className="w-5 h-5 text-primary" />
            Main Ability
          </h2>
          <span className="text-xs text-muted-foreground">Speed {profile.speed}</span>
        </div>

        <div className="p-4 rounded-md bg-secondary/50 border border-border/50">
          <p className="font-semibold text-primary">{profile.mainAbility.name}</p>
          <p className="text-sm text-muted-foreground mt-1">{profile.mainAbility.damageSummary}</p>
          {profile.mainAbility.modifierLines.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm">
              {profile.mainAbility.modifierLines.map((line) => (
                <li key={line} className="text-foreground/90">
                  • {line}
                </li>
              ))}
            </ul>
          )}
          {profile.mainAbility.modifierLines.length === 0 && (
            <p className="text-xs text-muted-foreground mt-3">
              Skill tree nodes can permanently modify this ability.
            </p>
          )}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-gold" />
          Active Abilities
        </h2>

        {profile.activeAbilities.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No automatic abilities unlocked yet. Claim active skills in the Skill Tree.
          </p>
        ) : (
          <div className="space-y-3">
            {profile.activeAbilities.map((ability) => (
              <div key={ability.id} className="p-4 rounded-md bg-secondary/50">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{ability.name}</p>
                  {ability.cooldownText && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {ability.cooldownText}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{ability.description}</p>
                <p className="text-xs text-primary/90 mt-2">{ability.triggerText}</p>
              </div>
            ))}
          </div>
        )}

        {profile.passiveNotes.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-muted-foreground" />
              Combat Passives
            </h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {profile.passiveNotes.map((note) => (
                <li key={note}>• {note}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
