import { forwardRef } from "react";
import "./BattleFx.css";

export const BattleFxLayer = forwardRef<HTMLDivElement>(function BattleFxLayer(_, ref) {
  return <div ref={ref} className="battle-fx-layer" aria-hidden />;
});

export const BattleFlash = forwardRef<HTMLDivElement>(function BattleFlash(_, ref) {
  return <div ref={ref} className="battle-flash" aria-hidden />;
});
