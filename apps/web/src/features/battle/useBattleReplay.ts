import { useCallback, useEffect, useRef, useState } from "react";
import type { BattleCombatant, BattleRound } from "@bloodline/shared/types";
import {
  BATTLE_PACE,
  delay,
  flashScreen,
  playAttack,
  playDeath,
  playHeal,
  playHit,
  shakeField,
  spawnDamagePopup,
} from "./battleFx";

export interface BattleLogLine {
  text: string;
  round: number;
}

export interface UseBattleReplayOptions {
  combatants: BattleCombatant[];
  rounds: BattleRound[];
  onComplete: () => void;
  fieldRef: React.RefObject<HTMLElement | null>;
  flashRef: React.RefObject<HTMLElement | null>;
  fxLayerRef: React.RefObject<HTMLElement | null>;
  unitRefs: React.MutableRefObject<Map<string, HTMLElement>>;
}

export function useBattleReplay({
  combatants,
  rounds,
  onComplete,
  fieldRef,
  flashRef,
  fxLayerRef,
  unitRefs,
}: UseBattleReplayOptions) {
  const [playing, setPlaying] = useState(true);
  const [skipped, setSkipped] = useState(false);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(-1);
  const [hpById, setHpById] = useState<Record<string, number>>(() =>
    Object.fromEntries(combatants.map((c) => [c.id, c.startHp]))
  );
  const [logLines, setLogLines] = useState<BattleLogLine[]>([]);
  const [activeActorId, setActiveActorId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const completedRef = useRef(false);

  const allyIds = new Set(combatants.filter((c) => c.side === "ally").map((c) => c.id));
  const enemyIds = new Set(combatants.filter((c) => c.side === "enemy").map((c) => c.id));

  const getTargetId = useCallback(
    (actorId: string) => {
      if (allyIds.has(actorId)) {
        return combatants.find((c) => c.side === "enemy")?.id ?? null;
      }
      return combatants.find((c) => c.side === "ally")?.id ?? null;
    },
    [allyIds, combatants]
  );

  const getUnitName = useCallback(
    (id: string) => combatants.find((c) => c.id === id)?.name ?? id,
    [combatants]
  );

  const formatLogLine = useCallback(
    (round: BattleRound) => {
      const actorName = getUnitName(round.actor);
      const targetId = getTargetId(round.actor);
      const targetName = targetId ? getUnitName(targetId) : "target";
      const abilityLabel = round.abilityName ?? round.action;

      if (round.isDodge) return `${actorName} attacks — ${targetName} dodges!`;
      if (round.isMiss) return `${actorName} uses ${abilityLabel} — miss!`;
      if (round.healing && round.healing > 0) {
        return `${actorName} uses ${abilityLabel} — heals ${round.healing}`;
      }
      const crit = round.isCrit ? " CRIT!" : "";
      const hits = round.hitCount && round.hitCount > 1 ? ` (${round.hitCount} hits)` : "";
      return `${actorName} uses ${abilityLabel}${hits} — ${round.damage} damage${crit}`;
    },
    [getTargetId, getUnitName]
  );

  const applyFinalState = useCallback(() => {
    if (rounds.length === 0) return;
    const last = rounds[rounds.length - 1];
    const next: Record<string, number> = {};
    for (const c of combatants) {
      const lastAsActor = [...rounds].reverse().find((r) => r.actor === c.id);
      const lastAsTarget = [...rounds].reverse().find((r) => getTargetId(r.actor) === c.id);
      if (lastAsActor) next[c.id] = lastAsActor.actorHpAfter;
      else if (lastAsTarget) next[c.id] = lastAsTarget.targetHpAfter;
      else next[c.id] = c.startHp;
    }
    if (last) {
      next[last.actor] = last.actorHpAfter;
      const tid = getTargetId(last.actor);
      if (tid) next[tid] = last.targetHpAfter;
    }
    setHpById(next);
    setLogLines(rounds.map((r) => ({ round: r.round, text: formatLogLine(r) })));
    setCurrentRoundIndex(rounds.length - 1);
    setActiveActorId(null);

    for (const c of combatants) {
      const hp = next[c.id] ?? 0;
      if (hp <= 0) {
        playDeath(unitRefs.current.get(c.id) ?? null);
      }
    }
  }, [combatants, formatLogLine, getTargetId, rounds, unitRefs]);

  const skip = useCallback(() => {
    if (completedRef.current) return;
    abortRef.current?.abort();
    setSkipped(true);
    setPlaying(false);
    applyFinalState();
    completedRef.current = true;
    onComplete();
  }, [applyFinalState, onComplete]);

  useEffect(() => {
    if (rounds.length === 0) {
      setPlaying(false);
      onComplete();
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    completedRef.current = false;

    const run = async () => {
      try {
        for (let i = 0; i < rounds.length; i++) {
          const round = rounds[i];
          const targetId = getTargetId(round.actor);
          const actorEl = unitRefs.current.get(round.actor) ?? null;
          const targetEl = targetId ? unitRefs.current.get(targetId) ?? null : null;

          setCurrentRoundIndex(i);
          setActiveActorId(round.actor);
          playAttack(actorEl);

          await delay(BATTLE_PACE.hitDelay, controller.signal);

          if (round.isDodge) {
            spawnDamagePopup(fxLayerRef.current, targetEl, { text: "DODGE", isDodge: true });
          } else if (round.isMiss) {
            spawnDamagePopup(fxLayerRef.current, targetEl, { text: "MISS", isMiss: true });
          } else if (round.healing && round.healing > 0) {
            playHeal(actorEl);
            spawnDamagePopup(fxLayerRef.current, actorEl, {
              text: `+${round.healing}`,
              isHeal: true,
            });
          } else if (round.damage > 0) {
            playHit(targetEl, round.isCrit);
            spawnDamagePopup(fxLayerRef.current, targetEl, {
              text: String(round.damage),
              isCrit: round.isCrit,
            });
            if (round.isCrit) shakeField(fieldRef.current, 1.2);
            else if (round.damage > 30) shakeField(fieldRef.current, 0.7);
            if (enemyIds.has(round.actor)) flashScreen(flashRef.current, "enemy");
          }

          setHpById((prev) => {
            const next = { ...prev, [round.actor]: round.actorHpAfter };
            if (targetId) next[targetId] = round.targetHpAfter;
            return next;
          });

          setLogLines((prev) => [...prev, { round: round.round, text: formatLogLine(round) }]);

          if (targetId && round.targetHpAfter <= 0) {
            playDeath(targetEl);
            await delay(BATTLE_PACE.deathDelay, controller.signal);
          }

          setActiveActorId(null);
          await delay(BATTLE_PACE.actionResolve, controller.signal);
        }

        if (!completedRef.current) {
          completedRef.current = true;
          setPlaying(false);
          onComplete();
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError" && !completedRef.current) {
          completedRef.current = true;
          setPlaying(false);
          onComplete();
        }
      }
    };

    run();
    return () => controller.abort();
  }, [
    rounds,
    onComplete,
    getTargetId,
    formatLogLine,
    fieldRef,
    flashRef,
    fxLayerRef,
    unitRefs,
    enemyIds,
  ]);

  return {
    playing,
    skipped,
    currentRoundIndex,
    hpById,
    logLines,
    activeActorId,
    skip,
  };
}
