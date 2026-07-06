import { useEffect, useState } from "react";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
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

    const unsub = onSnapshot(doc(db, "parties", partyId), async (snap) => {
      if (!snap.exists()) {
        setParty(null);
        setMembers([]);
        return;
      }

      const partyData = { id: snap.id, ...snap.data() } as Party;
      setParty(partyData);

      const memberInfos: PartyMemberDisplay[] = [];
      for (let i = 0; i < partyData.memberUids.length; i += 1) {
        const memberUid = partyData.memberUids[i];
        const memberLineageId = partyData.memberLineageIds[i];
        const lineageDoc = await getDoc(doc(db, "lineages", memberLineageId));
        const lineageInfo = lineageDoc.data();
        let heirName = "—";
        let classId = "warrior";
        let subclassId: string | null = null;
        let level = 1;

        if (lineageInfo?.activeHeirId) {
          const heirDoc = await getDoc(
            doc(db, "lineages", memberLineageId, "heirs", lineageInfo.activeHeirId as string)
          );
          if (heirDoc.exists()) {
            const heirData = heirDoc.data();
            heirName = (heirData.name as string) ?? "—";
            classId = (heirData.classId as string) ?? "warrior";
            subclassId = (heirData.subclassId as string | null) ?? null;
            level = (heirData.level as number) ?? 1;
          }
        }

        memberInfos.push({
          uid: memberUid,
          lineageId: memberLineageId,
          familyName: (lineageInfo?.familyName as string) ?? "Unknown",
          heirName,
          classId,
          subclassId,
          level,
          isLeader: memberUid === partyData.leaderUid,
        });
      }
      setMembers(memberInfos);
    });

    return () => unsub();
  }, [partyId]);

  return { party, members };
}
