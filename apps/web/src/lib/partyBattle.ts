import type { PartyReplayAlly } from "@bloodline/shared/combat";
import type { Heir } from "@bloodline/shared/types";
import type { PartyMemberDisplay } from "@/hooks/usePartyMembers";

export function buildPartyReplayAllies(
  heir: Heir,
  members: PartyMemberDisplay[]
): PartyReplayAlly[] {
  if (members.length <= 1) {
    return [
      {
        id: heir.id,
        name: heir.name,
        classId: heir.classId,
        level: heir.level,
        constitution: heir.stats.constitution,
        dexterity: heir.stats.dexterity,
        isLeader: true,
      },
    ];
  }

  const leaderFirst = [
    ...members.filter((m) => m.isLeader),
    ...members.filter((m) => !m.isLeader),
  ];

  return leaderFirst.map((member) => {
    const isSelf = member.lineageId === heir.lineageId;
    return {
      id: isSelf ? heir.id : `party-${member.lineageId}`,
      name: member.heirName,
      classId: member.classId,
      level: member.level,
      ...(isSelf
        ? {
            constitution: heir.stats.constitution,
            dexterity: heir.stats.dexterity,
          }
        : {}),
      isLeader: member.isLeader,
    };
  });
}
