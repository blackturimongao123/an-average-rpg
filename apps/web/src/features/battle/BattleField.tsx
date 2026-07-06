import type { BattleCombatant } from "@bloodline/shared/types";
import { BattleUnitCard } from "./BattleUnitCard";

interface BattleFieldProps {
  allies: BattleCombatant[];
  enemies: BattleCombatant[];
  hpById: Record<string, number>;
  activeActorId: string | null;
  registerUnitRef: (id: string, el: HTMLElement | null) => void;
  fieldRef?: React.RefObject<HTMLDivElement | null>;
}

export function BattleField({
  allies,
  enemies,
  hpById,
  activeActorId,
  registerUnitRef,
  fieldRef,
}: BattleFieldProps) {
  return (
    <div ref={fieldRef} className="battle-field">
      <div className="battle-side-col allies">
        {allies.map((combatant) => (
          <BattleUnitCard
            key={combatant.id}
            combatant={combatant}
            currentHp={hpById[combatant.id] ?? combatant.startHp}
            isActive={activeActorId === combatant.id}
            registerRef={registerUnitRef}
          />
        ))}
      </div>
      <div className="battle-center-gap" aria-hidden />
      <div className="battle-side-col enemies">
        {enemies.map((combatant) => (
          <BattleUnitCard
            key={combatant.id}
            combatant={combatant}
            currentHp={hpById[combatant.id] ?? combatant.startHp}
            isActive={activeActorId === combatant.id}
            registerRef={registerUnitRef}
          />
        ))}
      </div>
    </div>
  );
}
