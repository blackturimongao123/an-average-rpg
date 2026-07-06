import type { BattleCombatant } from "@bloodline/shared/types";
import { BattleUnitCard } from "./BattleUnitCard";

interface BattleFieldProps {
  allies: BattleCombatant[];
  enemies: BattleCombatant[];
  hpById: Record<string, number>;
  gaugeById: Record<string, number>;
  gaugeThreshold: number;
  activeActorId: string | null;
  registerUnitRef: (id: string, el: HTMLElement | null) => void;
  fieldRef?: React.Ref<HTMLDivElement>;
}

export function BattleField({
  allies,
  enemies,
  hpById,
  gaugeById,
  gaugeThreshold,
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
            currentGauge={gaugeById[combatant.id] ?? 0}
            gaugeThreshold={gaugeThreshold}
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
            currentGauge={gaugeById[combatant.id] ?? 0}
            gaugeThreshold={gaugeThreshold}
            isActive={activeActorId === combatant.id}
            registerRef={registerUnitRef}
          />
        ))}
      </div>
    </div>
  );
}
