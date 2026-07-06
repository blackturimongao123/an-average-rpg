import { useEffect, useRef } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { useAuthStore } from "@/stores/authStore";
import { useGameStore } from "@/stores/gameStore";
import { usePartyMembers } from "@/hooks/usePartyMembers";
import {
  activeMissionFromParty,
  applyPartyMissionOutcomeToHeir,
} from "@/firebase/partyMissionClient";
import { db } from "@/firebase/config";

function missionKey(missionId: string, startedAtMs: number) {
  return `${missionId}:${startedAtMs}`;
}

export function usePartyMissionSync() {
  const { user } = useAuthStore();
  const { lineage, heir } = useGameStore();
  const { party } = usePartyMembers(lineage?.partyId);

  const syncedAtMsRef = useRef<number | null>(null);
  const appliedOutcomeAtMsRef = useRef<number | null>(null);
  const trackedPartyMissionKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!lineage || !heir || !user || !party || !lineage.partyId) return;

    const partyMission = party.activeMission ?? null;
    const isLeader = party.leaderUid === user.uid;

    if (partyMission?.outcome) {
      const outcomeAt = partyMission.outcome.updatedAtMs;
      if (appliedOutcomeAtMsRef.current !== outcomeAt && !isLeader) {
        appliedOutcomeAtMsRef.current = outcomeAt;
        void applyPartyMissionOutcomeToHeir(lineage, heir, partyMission.outcome).catch((err) => {
          console.error("Party mission outcome sync error:", err);
        });
      }
      return;
    }

    if (partyMission) {
      trackedPartyMissionKeyRef.current = missionKey(
        partyMission.missionId,
        partyMission.startedAtMs
      );

      if (isLeader) return;

      if (syncedAtMsRef.current === partyMission.updatedAtMs) return;

      const heirMission = heir.activeMission;
      const needsSync =
        !heirMission ||
        heirMission.currentStep !== partyMission.currentStep ||
        heirMission.startedAtMs !== partyMission.startedAtMs ||
        heirMission.missionId !== partyMission.missionId;

      if (!needsSync) {
        syncedAtMsRef.current = partyMission.updatedAtMs;
        return;
      }

      syncedAtMsRef.current = partyMission.updatedAtMs;
      void updateDoc(doc(db, "lineages", lineage.id, "heirs", heir.id), {
        activeMission: activeMissionFromParty(partyMission),
      }).catch((err) => {
        console.error("Party mission state sync error:", err);
      });
      return;
    }

    if (
      !isLeader &&
      trackedPartyMissionKeyRef.current &&
      heir.activeMission &&
      missionKey(heir.activeMission.missionId, heir.activeMission.startedAtMs) ===
        trackedPartyMissionKeyRef.current
    ) {
      trackedPartyMissionKeyRef.current = null;
      syncedAtMsRef.current = null;
      void updateDoc(doc(db, "lineages", lineage.id, "heirs", heir.id), {
        activeMission: null,
      }).catch((err) => {
        console.error("Party mission clear sync error:", err);
      });
    }
  }, [
    lineage,
    heir,
    user,
    party?.activeMission?.updatedAtMs,
    party?.activeMission?.currentStep,
    party?.activeMission?.outcome?.updatedAtMs,
    party?.leaderUid,
    lineage?.partyId,
  ]);
}
