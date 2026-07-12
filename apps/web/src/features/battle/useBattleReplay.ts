import { useCallback, useEffect, useRef, useState } from "react";
import type { BattleCombatant, BattleRound } from "@bloodline/shared/types";
import { DEFAULT_GAUGE_THRESHOLD, simulateChargePhase } from "@bloodline/shared/combat";
import {
  BATTLE_PACE,
  delay,
  flashScreen,
  playAttack,
  playBuff,
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
  gaugeThreshold?: number;
  onComplete: () => void;
  fieldRef: React.RefObject<HTMLElement | null>;
  flashRef: React.RefObject<HTMLElement | null>;
  fxLayerRef: React.RefObject<HTMLElement | null>;
  unitRefs: React.MutableRefObject<Map<string, HTMLElement>>;
}

function isBuffRound(round: BattleRound): boolean {
  return (
    round.damage === 0 &&
    (round.healing ?? 0) === 0 &&
    !round.isMiss &&
    !round.isDodge &&
    !!round.abilityName
  );
}

function buildFinalGauges(
  combatants: BattleCombatant[],
  rounds: BattleRound[]
): Record<string, number> {
  const gauges: Record<string, number> = {};
  for (const c of combatants) {
    const lastAsActor = [...rounds].reverse().find((r) => r.actor === c.id);
    gauges[c.id] = lastAsActor?.actorGaugeAfter ?? 0;
  }
  return gauges;
}

function getTargetIdForActor(
  combatants: BattleCombatant[],
  actorId: string,
  targetIdOverride?: string
): string | null {
  if (targetIdOverride) return targetIdOverride;
  const actor = combatants.find((c) => c.id === actorId);
  if (!actor) return null;
  const targetSide = actor.side === "ally" ? "enemy" : "ally";
  return combatants.find((c) => c.side === targetSide)?.id ?? null;
}

export function useBattleReplay({
  combatants,
  rounds,
  gaugeThreshold = DEFAULT_GAUGE_THRESHOLD,
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
  const [gaugeById, setGaugeById] = useState<Record<string, number>>(() =>
    Object.fromEntries(combatants.map((c) => [c.id, 0]))
  );
  const [logLines, setLogLines] = useState<BattleLogLine[]>([]);
  const [activeActorId, setActiveActorId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const combatantsRef = useRef(combatants);
  const gaugeThresholdRef = useRef(gaugeThreshold);
  const unitRefsRef = useRef(unitRefs);
  const fieldRefRef = useRef(fieldRef);
  const flashRefRef = useRef(flashRef);
  const fxLayerRefRef = useRef(fxLayerRef);

  onCompleteRef.current = onComplete;
  combatantsRef.current = combatants;
  gaugeThresholdRef.current = gaugeThreshold;
  unitRefsRef.current = unitRefs;
  fieldRefRef.current = fieldRef;
  flashRefRef.current = flashRef;
  fxLayerRefRef.current = fxLayerRef;

  const formatLogLine = useCallback((round: BattleRound, combatantList: BattleCombatant[]) => {
    const actorName = combatantList.find((c) => c.id === round.actor)?.name ?? round.actor;
    const targetId = getTargetIdForActor(combatantList, round.actor, round.targetId);
    const targetName = targetId
      ? (combatantList.find((c) => c.id === targetId)?.name ?? "target")
      : "target";
    const abilityLabel = round.abilityName ?? round.action;

    if (round.isDodge) return `${actorName} attacks — ${targetName} dodges!`;
    if (round.isMiss) return `${actorName} uses ${abilityLabel} — miss!`;
    if (round.healing && round.healing > 0) {
      return `${actorName} uses ${abilityLabel} — heals ${round.healing}`;
    }
    if (isBuffRound(round)) {
      return `${actorName} uses ${abilityLabel}`;
    }
    const crit = round.isCrit ? " CRIT!" : "";
    const hits = round.hitCount && round.hitCount > 1 ? ` (${round.hitCount} hits)` : "";
    return `${actorName} uses ${abilityLabel}${hits} — ${round.damage} damage${crit}`;
  }, []);

  const applyFinalState = useCallback(() => {
    if (rounds.length === 0) return;
    const fighters = combatantsRef.current;
    const last = rounds[rounds.length - 1];
    const next: Record<string, number> = {};
    for (const c of fighters) {
      const lastAsActor = [...rounds].reverse().find((r) => r.actor === c.id);
      const lastAsTarget = [...rounds]
        .reverse()
        .find((r) => getTargetIdForActor(fighters, r.actor, r.targetId) === c.id);
      if (lastAsActor) next[c.id] = lastAsActor.actorHpAfter;
      else if (lastAsTarget) next[c.id] = lastAsTarget.targetHpAfter;
      else next[c.id] = c.startHp;
    }
    if (last) {
      next[last.actor] = last.actorHpAfter;
      const tid = getTargetIdForActor(fighters, last.actor, last.targetId);
      if (tid) next[tid] = last.targetHpAfter;
    }
    setHpById(next);
    setGaugeById(buildFinalGauges(fighters, rounds));
    setLogLines(
      rounds.map((r) => ({ round: r.round, text: formatLogLine(r, fighters) }))
    );
    setCurrentRoundIndex(rounds.length - 1);
    setActiveActorId(null);

    for (const c of fighters) {
      const hp = next[c.id] ?? 0;
      if (hp <= 0) {
        playDeath(unitRefsRef.current.current.get(c.id) ?? null);
      }
    }
  }, [formatLogLine, rounds]);

  const skip = useCallback(() => {
    if (completedRef.current) return;
    abortRef.current?.abort();
    setSkipped(true);
    setPlaying(false);
    applyFinalState();
    completedRef.current = true;
    onCompleteRef.current();
  }, [applyFinalState]);

  useEffect(() => {
    if (rounds.length === 0) {
      setPlaying(false);
      onCompleteRef.current();
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    completedRef.current = false;

    const run = async () => {
      const fighters = combatantsRef.current;
      const threshold = gaugeThresholdRef.current;

      let gaugeState: Record<string, number> = Object.fromEntries(
        fighters.map((c) => [c.id, 0])
      );

      const fightersForCharge = (hp: Record<string, number>) =>
        fighters.map((c) => ({
          id: c.id,
          speed: c.speed > 0 ? c.speed : 10,
          dexterity: 10,
          hp: hp[c.id] ?? c.startHp,
        }));

      /** One smooth synchronized charge: all bars advance together for T engine ticks. */
      const animateChargePhase = async (
        actorId: string,
        gaugeStart: Record<string, number>,
        gaugeReady: Record<string, number>
      ) => {
        setGaugeById({ ...gaugeStart });
        setActiveActorId(actorId);
        await delay(16, controller.signal);

        setGaugeById({ ...gaugeReady });
        await delay(BATTLE_PACE.turnCharge, controller.signal);
        await delay(BATTLE_PACE.turnReady, controller.signal);
      };

      const enemyIds = new Set(
        fighters.filter((c) => c.side === "enemy").map((c) => c.id)
      );

      const playActionRound = async (
        round: BattleRound,
        roundIndex: number,
        currentHp: Record<string, number>
      ): Promise<Record<string, number>> => {
        const targetId = getTargetIdForActor(fighters, round.actor, round.targetId);
        const actorEl = unitRefsRef.current.current.get(round.actor) ?? null;
        const targetEl = targetId
          ? unitRefsRef.current.current.get(targetId) ?? null
          : null;

        setCurrentRoundIndex(roundIndex);
        setActiveActorId(round.actor);

        if (isBuffRound(round)) {
          playBuff(actorEl);
          spawnDamagePopup(fxLayerRefRef.current.current, actorEl, {
            text: round.abilityName ?? round.action,
            isBuff: true,
          });
          await delay(BATTLE_PACE.hitDelay, controller.signal);
        } else {
          playAttack(actorEl);
          await delay(BATTLE_PACE.hitDelay, controller.signal);

          if (round.isDodge) {
            spawnDamagePopup(fxLayerRefRef.current.current, targetEl, {
              text: "DODGE",
              isDodge: true,
            });
          } else if (round.isMiss) {
            spawnDamagePopup(fxLayerRefRef.current.current, targetEl, {
              text: "MISS",
              isMiss: true,
            });
          } else if (round.healing && round.healing > 0) {
            playHeal(actorEl);
            spawnDamagePopup(fxLayerRefRef.current.current, actorEl, {
              text: `+${round.healing}`,
              isHeal: true,
            });
          } else if (round.damage > 0) {
            playHit(targetEl, round.isCrit);
            spawnDamagePopup(fxLayerRefRef.current.current, targetEl, {
              text: String(round.damage),
              isCrit: round.isCrit,
            });
            if (round.isCrit) shakeField(fieldRefRef.current.current, 1.2);
            else if (round.damage > 30) shakeField(fieldRefRef.current.current, 0.7);
            if (enemyIds.has(round.actor)) flashScreen(flashRefRef.current.current, "enemy");
          }
        }

        const nextHp = {
          ...currentHp,
          [round.actor]: round.actorHpAfter,
          ...(targetId ? { [targetId]: round.targetHpAfter } : {}),
        };
        setHpById(nextHp);

        gaugeState = {
          ...gaugeState,
          [round.actor]: round.actorGaugeAfter ?? 0,
        };
        setGaugeById({ ...gaugeState });

        setLogLines((prev) => [
          ...prev,
          { round: round.round, text: formatLogLine(round, fighters) },
        ]);

        if (targetId && round.targetHpAfter <= 0) {
          playDeath(targetEl);
          await delay(BATTLE_PACE.deathDelay, controller.signal);
        } else {
          await delay(BATTLE_PACE.actionResolve, controller.signal);
        }

        setActiveActorId(null);
        return nextHp;
      };

      try {
        let currentHp = Object.fromEntries(
          fighters.map((c) => [c.id, c.startHp])
        );

        let i = 0;
        while (i < rounds.length) {
          const round = rounds[i];
          const charge = simulateChargePhase(
            fightersForCharge(currentHp),
            gaugeState,
            threshold
          );

          if (charge) {
            if (charge.actorId !== round.actor && import.meta.env.DEV) {
              console.warn(
                `[battle-replay] charge actor ${charge.actorId} !== round actor ${round.actor}`
              );
            }
            await animateChargePhase(
              round.actor,
              charge.gaugeStart,
              charge.gaugeReady
            );
            gaugeState = { ...charge.gaugeReady };
          }

          const groupStart = i;
          while (i < rounds.length) {
            const actionRound = rounds[i];
            if (actionRound.actor !== round.actor) break;
            if (i > groupStart && actionRound.round !== rounds[i - 1].round) break;

            currentHp = await playActionRound(actionRound, i, currentHp);

            if (
              getTargetIdForActor(fighters, actionRound.actor, actionRound.targetId) &&
              actionRound.targetHpAfter <= 0
            ) {
              i = rounds.length;
              break;
            }
            i += 1;
          }
        }

        if (!completedRef.current) {
          completedRef.current = true;
          setPlaying(false);
          onCompleteRef.current();
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError" && !completedRef.current) {
          completedRef.current = true;
          setPlaying(false);
          onCompleteRef.current();
        }
      }
    };

    run();
    return () => controller.abort();
  }, [rounds]);

  return {
    playing,
    skipped,
    currentRoundIndex,
    hpById,
    gaugeById,
    logLines,
    activeActorId,
    skip,
  };
}
