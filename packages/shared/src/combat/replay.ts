import type { BattleCombatant, BattleReplayPayload, BattleRound } from "../types.js";
import { calculateMaxHp } from "./stats.js";

export const DEFAULT_GAUGE_THRESHOLD = 100;

export interface BuildBattleReplayInput {
  heir: {
    id: string;
    name: string;
    classId: string;
    level: number;
    stats: { constitution: number };
    speed: number;
    startHp?: number;
    maxHp?: number;
  };
  monster: {
    id: string;
    name: string;
    hp: number;
    speed: number;
    portraitSrc?: string;
  };
  rounds: BattleRound[];
  victory: boolean;
  gaugeThreshold?: number;
  sceneImage?: string;
  sceneGradient?: string;
}

/** Stop replay at the first round that reduces a target to 0 HP (inclusive). */
export function trimRoundsAtFirstKill(rounds: BattleRound[]): BattleRound[] {
  const killIndex = rounds.findIndex((r) => r.targetHpAfter <= 0);
  if (killIndex === -1) return rounds;
  return rounds.slice(0, killIndex + 1);
}

export function buildBattleReplayPayload(input: BuildBattleReplayInput): BattleReplayPayload {
  const trimmedRounds = trimRoundsAtFirstKill(input.rounds);
  const heirMaxHp =
    input.heir.maxHp ?? calculateMaxHp(input.heir.stats.constitution, input.heir.level);
  const heirStartHp =
    input.heir.startHp ??
    inferStartHp(trimmedRounds, input.heir.id, input.monster.id, heirMaxHp);
  const monsterStartHp = input.monster.hp;
  const gaugeThreshold = input.gaugeThreshold ?? DEFAULT_GAUGE_THRESHOLD;

  const combatants: BattleCombatant[] = [
    {
      id: input.heir.id,
      name: input.heir.name,
      side: "ally",
      maxHp: heirMaxHp,
      startHp: heirStartHp,
      speed: input.heir.speed,
      classId: input.heir.classId,
    },
    {
      id: input.monster.id,
      name: input.monster.name,
      side: "enemy",
      maxHp: monsterStartHp,
      startHp: monsterStartHp,
      speed: input.monster.speed,
      portraitSrc: input.monster.portraitSrc,
    },
  ];

  return {
    combatants,
    rounds: trimmedRounds,
    victory: input.victory,
    gaugeThreshold,
    sceneImage: input.sceneImage,
    sceneGradient: input.sceneGradient,
  };
}

function inferStartHp(
  rounds: BattleRound[],
  fighterId: string,
  opponentId: string,
  fallback: number
): number {
  for (const round of rounds) {
    if (round.actor === fighterId) {
      if (round.healing && round.healing > 0) {
        return Math.min(fallback, round.actorHpAfter - round.healing);
      }
      return Math.min(fallback, round.actorHpAfter);
    }
    if (round.actor === opponentId) {
      const dmg = round.damage ?? 0;
      const heal = round.healing ?? 0;
      return Math.min(fallback, round.targetHpAfter + dmg - heal);
    }
  }
  return fallback;
}
