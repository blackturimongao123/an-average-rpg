import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useAuthStore } from "@/stores/authStore";
import { useGameStore } from "@/stores/gameStore";
import { db } from "@/firebase/config";
import { getPlayerMissionBoard } from "@/firebase/missionBoard";
import { boardNeedsReroll, getRerollCountdownMs, normalizeAdventurerRank } from "@/lib/missions";
import type { MissionBoard } from "@bloodline/shared/types";

export function useMissionBoard() {
  const { user } = useAuthStore();
  const { lineage, heir, missionBoard, setMissionBoard, updateAdventurerRank } = useGameStore();
  const [loading, setLoading] = useState(false);
  const [countdownMs, setCountdownMs] = useState(0);

  const refreshBoard = async () => {
    if (!user || !lineage || !heir) {
      return;
    }

    setLoading(true);
    try {
      const response = getPlayerMissionBoard(user.uid, lineage, heir, missionBoard);
      setMissionBoard(response.board);
      updateAdventurerRank(response.adventurerRank, response.adventurerRankXp);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!lineage) {
      setMissionBoard(null);
      return;
    }

    const boardRef = doc(db, "lineages", lineage.id, "missionBoard", "current");
    const unsubscribe = onSnapshot(boardRef, (snapshot) => {
      if (snapshot.exists()) {
        setMissionBoard(snapshot.data() as MissionBoard);
      }
    });

    return () => unsubscribe();
  }, [lineage, setMissionBoard]);

  useEffect(() => {
    if (!user || !lineage || !heir) {
      return;
    }

    refreshBoard();
  }, [user?.uid, lineage?.id, heir?.id]);

  useEffect(() => {
    if (!missionBoard) {
      setCountdownMs(0);
      return;
    }

    const tick = () => {
      const remaining = getRerollCountdownMs(missionBoard.nextRerollAtMs);
      setCountdownMs(remaining);

      if (boardNeedsReroll(missionBoard) && user && lineage && heir) {
        refreshBoard();
      }
    };

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [missionBoard?.nextRerollAtMs, user?.uid, lineage?.id, heir?.id]);

  return {
    missionBoard,
    loading,
    countdownMs,
    refreshBoard,
  };
}
