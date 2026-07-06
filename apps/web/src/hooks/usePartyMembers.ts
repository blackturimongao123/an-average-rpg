import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import type { Party } from "@bloodline/shared/types";
import { db } from "@/firebase/config";

export interface PartyMemberDisplay {
  uid: string;
  lineageId: string;
  familyName: string;
  heirName: string;
  classId: string;
  subclassId: string | null;
  level: number;
  isLeader: boolean;
}

export function usePartyMembers(partyId: string | null | undefined) {
  const [party, setParty] = useState<Party | null>(null);
  const [members, setMembers] = useState<PartyMemberDisplay[]>([]);

  useEffect(() => {
    if (!partyId) {
      setParty(null);
      setMembers([]);
      return;
    }

    const unsub = onSnapshot(doc(db, "parties", partyId), (snap) => {
      if (!snap.exists()) {
        setParty(null);
        setMembers([]);
        return;
      }

      const partyData = { id: snap.id, ...snap.data() } as Party;
      setParty(partyData);

      const memberInfos: PartyMemberDisplay[] = partyData.memberUids.map((memberUid, i) => {
        const profile = partyData.memberProfiles?.[i];
        return {
          uid: memberUid,
          lineageId: partyData.memberLineageIds[i] ?? "",
          familyName: profile?.familyName ?? "Unknown",
          heirName: profile?.heirName ?? "—",
          classId: profile?.classId ?? "warrior",
          subclassId: profile?.subclassId ?? null,
          level: profile?.level ?? 1,
          isLeader: memberUid === partyData.leaderUid,
        };
      });
      setMembers(memberInfos);
    });

    return () => unsub();
  }, [partyId]);

  return { party, members };
}
