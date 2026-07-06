import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { BattleReplayPayload } from "@bloodline/shared/types";
import { getDefaultSceneGradient } from "@bloodline/shared/adventure";
import { useUIStore } from "@/stores/uiStore";
import { BattleField } from "./BattleField";
import { BattleFlash, BattleFxLayer } from "./BattleFxLayer";
import { useBattleReplay } from "./useBattleReplay";
import "./Battle.css";
import "./BattleFx.css";

export interface BattleResultSummary {
  victory: boolean;
  heirDied?: boolean;
  rewards?: { gold: number; xp: number; items: string[] };
  monsterFaced?: string;
  choiceLabel?: string;
  dungeonCompleted?: boolean;
  floorCleared?: boolean;
}

interface BattleViewProps {
  replay: BattleReplayPayload;
  headerLabel: string;
  onFinished: (summary: BattleResultSummary) => void;
  resultSummary: BattleResultSummary;
  continueLabel?: string;
  onContinue: () => void;
  onLeave?: () => void;
}

export function BattleView({
  replay,
  headerLabel,
  onFinished,
  resultSummary,
  continueLabel = "Continue",
  onContinue,
  onLeave,
}: BattleViewProps) {
  const setBattleReplayActive = useUIStore((s) => s.setBattleReplayActive);
  const fieldRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const fxLayerRef = useRef<HTMLDivElement>(null);
  const unitRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    setBattleReplayActive(true);
    return () => setBattleReplayActive(false);
  }, [setBattleReplayActive]);

  const handleComplete = useCallback(() => {
    setShowResult(true);
    onFinished(resultSummary);
  }, [onFinished, resultSummary]);

  const registerUnitRef = useCallback((id: string, el: HTMLElement | null) => {
    if (el) unitRefs.current.set(id, el);
    else unitRefs.current.delete(id);
  }, []);

  const { playing, hpById, logLines, activeActorId, skip } = useBattleReplay({
    combatants: replay.combatants,
    rounds: replay.rounds,
    onComplete: handleComplete,
    fieldRef,
    flashRef,
    fxLayerRef,
    unitRefs,
  });

  const allies = useMemo(
    () => replay.combatants.filter((c) => c.side === "ally"),
    [replay.combatants]
  );
  const enemies = useMemo(
    () => replay.combatants.filter((c) => c.side === "enemy"),
    [replay.combatants]
  );

  const bgStyle = useMemo(() => {
    if (replay.sceneImage) {
      return {
        backgroundImage: `url("${replay.sceneImage}")`,
      };
    }
    return {
      background: replay.sceneGradient ?? getDefaultSceneGradient("combat"),
    };
  }, [replay.sceneImage, replay.sceneGradient]);

  return (
    <div className="battle-shell h-full">
      <div className="battle-bg" style={bgStyle} />
      <div className="battle-bg-gradient" />
      <div className="battle-bg-vignette" />
      <BattleFlash ref={flashRef} />
      <BattleFxLayer ref={fxLayerRef} />

      <header className="battle-header">
        <p className="battle-header-title">{headerLabel}</p>
        <button
          type="button"
          className="battle-skip-btn"
          onClick={skip}
          disabled={!playing}
        >
          Skip
        </button>
      </header>

      <div className="battle-arena">
        <BattleField
          fieldRef={fieldRef}
          allies={allies}
          enemies={enemies}
          hpById={hpById}
          activeActorId={activeActorId}
          registerUnitRef={registerUnitRef}
        />
      </div>

      <div className="battle-hud scrollbar-thin">
        {logLines.length === 0 && playing && (
          <p className="battle-log-line text-white/40">Combat begins...</p>
        )}
        {logLines.slice(-8).map((line, idx) => (
          <div key={`${line.round}-${idx}`} className="battle-log-line">
            <span className="tick">T{line.round}</span>
            {line.text}
          </div>
        ))}
      </div>

      {showResult && (
        <div className="battle-result-overlay">
          <div
            className={`battle-result-card ${resultSummary.victory ? "victory" : "defeat"}`}
          >
            <h2 className="font-display text-2xl font-bold mb-2">
              {resultSummary.victory ? "Victory!" : "Defeat..."}
            </h2>
            {resultSummary.monsterFaced && (
              <p className="text-sm text-white/60 mb-3">
                Faced: <span className="text-white">{resultSummary.monsterFaced}</span>
              </p>
            )}
            {resultSummary.choiceLabel && (
              <p className="text-xs text-white/50 mb-2">
                Approach: {resultSummary.choiceLabel}
              </p>
            )}
            {resultSummary.victory && resultSummary.rewards && (
              <div className="flex justify-center gap-4 text-sm mb-4">
                <span className="text-gold">+{resultSummary.rewards.gold} gold</span>
                <span className="text-blue-400">+{resultSummary.rewards.xp} XP</span>
              </div>
            )}
            {resultSummary.heirDied && (
              <p className="text-destructive text-sm mb-3">
                Your heir has fallen. The bloodline must continue...
              </p>
            )}
            {resultSummary.dungeonCompleted && (
              <p className="text-primary text-sm mb-3">Dungeon complete!</p>
            )}
            <div className="flex gap-3 justify-center flex-wrap">
              <button type="button" className="btn-primary" onClick={onContinue}>
                {continueLabel}
              </button>
              {onLeave && (
                <button type="button" className="btn-secondary" onClick={onLeave}>
                  Leave
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
