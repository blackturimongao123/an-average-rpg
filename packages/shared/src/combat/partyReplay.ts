import type { BattleCombatant, BattleReplayPayload, BattleRound } from "../types.js";
import { calculateMaxHp, computeCombatSpeed } from "./stats.js";
import type { CombatData } from "./types.js";

export interface PartyReplayAlly {
  id: string;
  name: string;
  classId: string;
  level: number;
  constitution?: number;
  dexterity?: number;
  speed?: number;
  maxHp?: number;
  startHp?: number;
  isLeader?: boolean;
}

function defaultConstitution(level: number) {
  return 8 + Math.floor(level / 2);
}

function defaultDexterity(level: number) {
  return 8 + Math.floor(level / 3);
}

function buildAllyCombatant(
  ally: PartyReplayAlly,
  leaderCombatant: BattleCombatant | undefined,
  combatData?: CombatData
): BattleCombatant {
  if (ally.isLeader && leaderCombatant) {
    return { ...leaderCombatant };
  }

  const constitution = ally.constitution ?? defaultConstitution(ally.level);
  const dexterity = ally.dexterity ?? defaultDexterity(ally.level);
  const maxHp = ally.maxHp ?? calculateMaxHp(constitution, ally.level);
  const startHp = ally.startHp ?? maxHp;
  const speed =
    ally.speed ??
    (combatData ? computeCombatSpeed(dexterity, [], combatData) : 10 + dexterity);

  return {
    id: ally.id,
    name: ally.name,
    side: "ally",
    maxHp,
    startHp,
    speed,
    classId: ally.classId,
  };
}

/**
 * Expand a solo-heir battle replay so every party ally appears and takes turns attacking.
 * Combat outcome stays leader-authoritative; extra allies are visual participants.
 */
export function expandBattleReplayForParty(
  replay: BattleReplayPayload,
  leaderId: string,
  partyAllies: PartyReplayAlly[],
  combatData?: CombatData
): BattleReplayPayload {
  if (partyAllies.length <= 1) {
    return replay;
  }

  const leaderCombatant = replay.combatants.find((c) => c.id === leaderId && c.side === "ally");
  const monster = replay.combatants.find((c) => c.side === "enemy");
  if (!monster || !leaderCombatant) {
    return replay;
  }

  const leaderFirst = [
    ...partyAllies.filter((a) => a.isLeader || a.id === leaderId),
    ...partyAllies.filter((a) => !a.isLeader && a.id !== leaderId),
  ];

  const allyCombatants = leaderFirst.map((ally) =>
    buildAllyCombatant(ally, leaderCombatant, combatData)
  );
  const allyHp = Object.fromEntries(allyCombatants.map((a) => [a.id, a.startHp]));
  const attackerIds = allyCombatants.map((a) => a.id);

  let leaderHp = leaderCombatant.startHp;
  let monsterHp = monster.startHp;
  let attackerIdx = 0;
  const expandedRounds: BattleRound[] = [];

  for (const round of replay.rounds) {
    if (round.actor === leaderId) {
      const isSelfHeal = (round.healing ?? 0) > 0;
      const actorId = isSelfHeal
        ? leaderId
        : attackerIds[attackerIdx % attackerIds.length];
      if (!isSelfHeal) {
        attackerIdx += 1;
      }
      monsterHp = round.targetHpAfter;
      if (actorId === leaderId) {
        leaderHp = round.actorHpAfter;
        allyHp[leaderId] = leaderHp;
      }

      expandedRounds.push({
        ...round,
        actor: actorId,
        targetId: isSelfHeal ? leaderId : monster.id,
        actorHpAfter: allyHp[actorId] ?? leaderHp,
        targetHpAfter: isSelfHeal ? leaderHp : monsterHp,
      });
      continue;
    }

    if (round.actor === monster.id) {
      leaderHp = round.targetHpAfter;
      allyHp[leaderId] = leaderHp;

      expandedRounds.push({
        ...round,
        targetId: leaderId,
        actorHpAfter: round.actorHpAfter,
        targetHpAfter: leaderHp,
      });
      continue;
    }

    expandedRounds.push(round);
  }

  return {
    ...replay,
    combatants: [...allyCombatants, monster],
    rounds: expandedRounds,
  };
}
