import { doc, updateDoc } from "firebase/firestore";
import { MISSION_COOLDOWN_MS } from "@bloodline/shared/constants";
import type { Heir } from "@bloodline/shared/types";
import { db } from "./config";
import { getFirebaseErrorMessage } from "@/lib/firebaseErrors";

function endMissionLater(lineageId: string, heir: Heir) {
  if (!heir.activeMission) throw new Error("No active mission");
  const missionId = heir.activeMission.missionId;
  const cooldownExpiresAtMs = Date.now() + MISSION_COOLDOWN_MS;
  void updateDoc(doc(db, "lineages", lineageId, "heirs", heir.id), {
    activeMission: null,
    missionCooldowns: {
      ...(heir.missionCooldowns ?? {}),
      [missionId]: cooldownExpiresAtMs,
    },
  }).catch((error) => console.error("Failed to save ended mission", error));
  return { missionId, cooldownExpiresAtMs };
}

export function abandonPlayerMission(lineageId: string, heir: Heir) {
  return endMissionLater(lineageId, heir);
}

export function failPlayerMission(lineageId: string, heir: Heir) {
  return endMissionLater(lineageId, heir);
}

export function getMissionActionErrorMessage(error: unknown): string {
  return getFirebaseErrorMessage(error);
}
