import { forwardRef } from "react";
import type { BattleCombatant } from "@bloodline/shared/types";
import { ClassProfileIcon } from "@/lib/classIcons";
import { Skull } from "lucide-react";

interface BattleUnitCardProps {
  combatant: BattleCombatant;
  currentHp: number;
  isActive: boolean;
  registerRef: (id: string, el: HTMLElement | null) => void;
}

export const BattleUnitCard = forwardRef<HTMLDivElement, BattleUnitCardProps>(
  function BattleUnitCard({ combatant, currentHp, isActive, registerRef }) {
    const hpPct = Math.max(0, Math.min(100, (currentHp / combatant.maxHp) * 100));
    const isDead = currentHp <= 0;

    return (
      <div
        ref={(el) => registerRef(combatant.id, el)}
        className={`battle-unit ${isActive ? "is-active" : ""} ${isDead ? "is-dead" : ""}`}
        data-side={combatant.side}
        data-unit-id={combatant.id}
      >
        <div className="battle-unit-portrait">
          {combatant.side === "ally" && combatant.classId ? (
            <ClassProfileIcon
              classId={combatant.classId}
              size={68}
              className="w-full h-full"
            />
          ) : combatant.portraitSrc ? (
            <img src={combatant.portraitSrc} alt={combatant.name} />
          ) : (
            <Skull className="w-8 h-8 text-red-400/80" />
          )}
        </div>
        <p className="battle-unit-name">{combatant.name}</p>
        <div className="battle-hp-bar">
          <span
            className={`battle-hp-fill ${combatant.side === "enemy" ? "enemy" : ""}`}
            style={{ width: `${hpPct}%` }}
          />
        </div>
        <p className="battle-hp-text">
          {Math.max(0, currentHp)}/{combatant.maxHp}
        </p>
      </div>
    );
  }
);
