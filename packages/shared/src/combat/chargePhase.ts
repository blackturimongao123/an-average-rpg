export interface ChargePhaseFighter {
  id: string;
  speed: number;
  dexterity: number;
  hp: number;
}

export interface ChargePhaseResult {
  actorId: string;
  ticks: number;
  gaugeStart: Record<string, number>;
  /** Gauge values after T simultaneous ticks (capped at threshold for display). */
  gaugeReady: Record<string, number>;
}

function pickReadyActor(
  fighters: ChargePhaseFighter[],
  gauges: Record<string, number>,
  threshold: number
): ChargePhaseFighter | null {
  const ready = fighters
    .filter((f) => f.hp > 0 && (gauges[f.id] ?? 0) >= threshold)
    .sort((a, b) => {
      const gaugeDiff = (gauges[b.id] ?? 0) - (gauges[a.id] ?? 0);
      if (gaugeDiff !== 0) return gaugeDiff;
      return b.dexterity - a.dexterity;
    });

  return ready[0] ?? null;
}

/**
 * Mirror the combat engine tick loop: all living fighters gain speed each tick
 * until someone reaches the threshold. Returns one charge phase for replay UI.
 */
export function simulateChargePhase(
  fighters: ChargePhaseFighter[],
  gaugeState: Record<string, number>,
  threshold: number
): ChargePhaseResult | null {
  const living = fighters.filter((f) => f.hp > 0);
  if (living.length === 0) return null;

  const gaugeStart: Record<string, number> = {};
  const working: Record<string, number> = {};

  for (const f of fighters) {
    gaugeStart[f.id] = gaugeState[f.id] ?? 0;
    working[f.id] = gaugeState[f.id] ?? 0;
  }

  const alreadyReady = pickReadyActor(living, working, threshold);
  if (alreadyReady) {
    const gaugeReady: Record<string, number> = {};
    for (const f of fighters) {
      gaugeReady[f.id] = Math.min(threshold, working[f.id] ?? 0);
    }
    return {
      actorId: alreadyReady.id,
      ticks: 0,
      gaugeStart,
      gaugeReady,
    };
  }

  let ticks = 0;
  const maxTicks = 500;

  while (ticks < maxTicks) {
    ticks += 1;

    for (const f of living) {
      const speed = f.speed > 0 ? f.speed : 10;
      working[f.id] = (working[f.id] ?? 0) + speed;
    }

    const actor = pickReadyActor(living, working, threshold);
    if (actor) {
      const gaugeReady: Record<string, number> = {};
      for (const f of fighters) {
        gaugeReady[f.id] = Math.min(threshold, working[f.id] ?? 0);
      }
      return {
        actorId: actor.id,
        ticks,
        gaugeStart,
        gaugeReady,
      };
    }
  }

  return null;
}
