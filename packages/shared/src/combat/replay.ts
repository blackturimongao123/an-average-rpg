import type { BattleCombatant, BattleReplayPayload, BattleRound } from "../types.js";
import { calculateMaxHp } from "./stats.js";

export interface BuildBattleReplayInput {
  heir: {
    id: string;
    name: string;
    classId: string;
    level: number;
    stats: { constitution: number };
    startHp?: number;
    maxHp?: number;
  };
  monster: {
    id: string;
    name: string;
    hp: number;
    portraitSrc?: string;
  };
  rounds: BattleRound[];
  victory: boolean;
  sceneImage?: string;
  sceneGradient?: string;
}

export function buildBattleReplayPayload(input: BuildBattleReplayInput): BattleReplayPayload {
  const heirMaxHp =
    input.heir.maxHp ?? calculateMaxHp(input.heir.stats.constitution, input.heir.level);
  const heirStartHp = input.heir.startHp ?? inferStartHp(input.rounds, input.heir.id, heirMaxHp);
  const monsterStartHp = input.monster.hp;

  const combatants: BattleCombatant[] = [
    {
      id: input.heir.id,
      name: input.heir.name,
      side: "ally",
      maxHp: heirMaxHp,
      startHp: heirStartHp,
      classId: input.heir.classId,
    },
    {
      id: input.monster.id,
      name: input.monster.name,
      side: "enemy",
      maxHp: monsterStartHp,
      startHp: monsterStartHp,
      portraitSrc: input.monster.portraitSrc,
    },
  ];

  return {
    combatants,
    rounds: input.rounds,
    victory: input.victory,
    sceneImage: input.sceneImage,
    sceneGradient: input.sceneGradient,
  };
}

function inferStartHp(rounds: BattleRound[], fighterId: string, fallback: number): number {
  for (const round of rounds) {
    if (round.actor === fighterId) {
      const delta = (round.damage ?? 0) - (round.healing ?? 0);
      return Math.min(fallback, round.actorHpAfter + delta);
    }
    if (round.actor !== fighterId) {
      return Math.min(fallback, round.targetHpAfter + (round.damage ?? 0) - (round.healing ?? 0));
    }
  }
  return fallback;
}
