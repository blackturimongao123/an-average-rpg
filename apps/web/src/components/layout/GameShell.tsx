import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot, doc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useAuthStore } from "@/stores/authStore";
import { useGameStore } from "@/stores/gameStore";
import { useJobShiftTimer } from "@/hooks/useJobShiftTimer";
import { normalizeAdventurerRank } from "@/lib/missions";
import { migrateEquipment } from "@bloodline/shared/equipment";
import type { ActiveMission, MerchantBoard } from "@bloodline/shared/types";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { JobShiftBanner } from "./JobShiftBanner";

interface GameShellProps {
  children: React.ReactNode;
}

export function GameShell({ children }: GameShellProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { setLineage, setHeir, setLoading } = useGameStore();

  useJobShiftTimer();

  useEffect(() => {
    if (!user) return;

    setLoading(true);

    const lineagesQuery = query(
      collection(db, "lineages"),
      where("ownerUid", "==", user.uid)
    );

    const unsubscribeLineage = onSnapshot(lineagesQuery, (snapshot) => {
      if (snapshot.empty) {
        setLineage(null);
        setHeir(null);
        setLoading(false);
        return;
      }

      const lineageDoc = snapshot.docs[0];
      const lineageData = lineageDoc.data();
      
      setLineage({
        id: lineageDoc.id,
        ownerUid: lineageData.ownerUid,
        familyName: lineageData.familyName,
        generation: lineageData.generation,
        activeHeirId: lineageData.activeHeirId,
        bankGold: lineageData.bankGold,
        bankSlots: lineageData.bankSlots,
        adventurerRank: normalizeAdventurerRank(lineageData.adventurerRank),
        adventurerRankXp: lineageData.adventurerRankXp ?? 0,
        bloodlineSkillIds: lineageData.bloodlineSkillIds ?? [],
        partyId: lineageData.partyId ?? null,
        merchantBoard: (lineageData.merchantBoard as MerchantBoard | undefined) ?? undefined,
        publicSummary: lineageData.publicSummary ?? {
          highestGeneration: lineageData.generation ?? 1,
          deadHeirs: 0,
          currentClass: null,
        },
      });

      if (lineageData.activeHeirId) {
        const heirRef = doc(db, "lineages", lineageDoc.id, "heirs", lineageData.activeHeirId);
        
        const unsubscribeHeir = onSnapshot(heirRef, (heirDoc) => {
          if (heirDoc.exists()) {
            const heirData = heirDoc.data();
            const rawMission = heirData.activeMission as ActiveMission | null | undefined;
            setHeir({
              id: heirDoc.id,
              ownerUid: heirData.ownerUid,
              lineageId: heirData.lineageId,
              generation: heirData.generation,
              name: heirData.name,
              status: heirData.status,
              classId: heirData.classId,
              raceId: heirData.raceId,
              level: heirData.level,
              xp: heirData.xp,
              gold: heirData.gold,
              stats: heirData.stats,
              skillIds: heirData.skillIds || [],
              effectIds: heirData.effectIds || [],
              equipment: migrateEquipment(heirData.equipment),
              inventory: heirData.inventory || [],
              jobRecords: heirData.jobRecords || {},
              activeJobShift: heirData.activeJobShift ?? null,
              activeMission: rawMission
                ? {
                    ...rawMission,
                    difficulty: normalizeAdventurerRank(rawMission.difficulty),
                  }
                : null,
              subclassId: heirData.subclassId ?? null,
              subclassTier: heirData.subclassTier ?? 0,
              unspentStatPoints: heirData.unspentStatPoints ?? 0,
              itemInstances: heirData.itemInstances ?? {},
              missionCooldowns: heirData.missionCooldowns ?? {},
              seed: heirData.seed,
            });

            if (heirData.status === "dead") {
              navigate("/create-heir");
            }
          } else {
            setHeir(null);
            navigate("/create-heir");
          }
          setLoading(false);
        });

        return () => unsubscribeHeir();
      } else {
        setHeir(null);
        setLoading(false);
        navigate("/create-heir");
      }
    });

    return () => unsubscribeLineage();
  }, [user, setLineage, setHeir, setLoading, navigate]);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <JobShiftBanner />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
