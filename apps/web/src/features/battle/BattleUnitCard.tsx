import { forwardRef } from "react";
import type { BattleCombatant } from "@bloodline/shared/types";
import { ClassProfileIcon } from "@/lib/classIcons";
import { Skull } from "lucide-react";

interface BattleUnitCardProps {
  combatant: BattleCombatant;
  currentHp: number;
  currentGauge: number;
  gaugeThreshold: number;
  isActive: boolean;
  registerRef: (id: string, el: HTMLElement | null) => void;
}

export const BattleUnitCard = forwardRef<HTMLDivElement, BattleUnitCardProps>(
  function BattleUnitCard({
    combatant,
    currentHp,
    currentGauge,
    gaugeThreshold,
    isActive,
    registerRef,
  }) {
    const hpPct = Math.max(0, Math.min(100, (currentHp / combatant.maxHp) * 100));
    const gaugePct = Math.max(
      0,
      Math.min(100, (currentGauge / gaugeThreshold) * 100)
    );
    const isDead = currentHp <= 0;
    const isGaugeReady = !isDead && currentGauge >= gaugeThreshold;

    return (
      <div
        ref={(el) => registerRef(combatant.id, el)}
        className={`battle-unit ${isActive ? "is-active is-charging" : ""} ${isDead ? "is-dead" : ""} ${isGaugeReady ? "is-gauge-ready" : ""}`}
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
        <div className="battle-gauge-bar" title="Action gauge">
          <span className="battle-gauge-fill" style={{ width: `${gaugePct}%` }} />
        </div>
      </div>
    );
  }
);
