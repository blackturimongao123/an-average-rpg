import { onCall, HttpsError } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import { MISSION_COOLDOWN_MS } from "@bloodline/shared/constants";
import { db } from "../index.js";
import type { Heir, Lineage } from "../utils/types.js";

interface MissionActionRequest {
  lineageId: string;
  heirId: string;
}

interface MissionActionResponse {
  missionId: string;
  cooldownExpiresAtMs: number;
}

async function validateMissionOwner(lineageId: string, heirId: string, uid: string) {
  const lineageRef = db.collection("lineages").doc(lineageId);
  const heirRef = lineageRef.collection("heirs").doc(heirId);

  const [lineageDoc, heirDoc] = await Promise.all([lineageRef.get(), heirRef.get()]);
  if (!lineageDoc.exists || !heirDoc.exists) {
    throw new HttpsError("not-found", "Lineage or heir not found");
  }

  const lineage = lineageDoc.data() as Lineage;
  const heir = heirDoc.data() as Heir;

  if (lineage.ownerUid !== uid) {
    throw new HttpsError("permission-denied", "You do not own this lineage");
  }
  if (heir.status !== "alive") {
    throw new HttpsError("failed-precondition", "Heir is not alive");
  }
  if (!heir.activeMission) {
    throw new HttpsError("failed-precondition", "No active mission");
  }

  return { lineageRef, heirRef, heir };
}

export const abandonMission = onCall<MissionActionRequest>(
  { cors: true },
  async (request): Promise<MissionActionResponse> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be signed in");
    }

    const { lineageId, heirId } = request.data;
    if (!lineageId || !heirId) {
      throw new HttpsError("invalid-argument", "Missing required fields");
    }

    const { lineageRef, heirRef, heir } = await validateMissionOwner(
      lineageId,
      heirId,
      request.auth.uid
    );

    const missionId = heir.activeMission!.missionId;
    const cooldownExpiresAtMs = Date.now() + MISSION_COOLDOWN_MS;
    const missionCooldowns = {
      ...(heir.missionCooldowns ?? {}),
      [missionId]: cooldownExpiresAtMs,
    };

    await heirRef.update({
      activeMission: null,
      missionCooldowns,
    });
    await lineageRef.update({ updatedAt: FieldValue.serverTimestamp() });

    return { missionId, cooldownExpiresAtMs };
  }
);

export const failMission = onCall<MissionActionRequest>(
  { cors: true },
  async (request): Promise<MissionActionResponse> => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be signed in");
    }

    const { lineageId, heirId } = request.data;
    if (!lineageId || !heirId) {
      throw new HttpsError("invalid-argument", "Missing required fields");
    }

    const { lineageRef, heirRef, heir } = await validateMissionOwner(
      lineageId,
      heirId,
      request.auth.uid
    );

    const missionId = heir.activeMission!.missionId;
    const cooldownExpiresAtMs = Date.now() + MISSION_COOLDOWN_MS;
    const missionCooldowns = {
      ...(heir.missionCooldowns ?? {}),
      [missionId]: cooldownExpiresAtMs,
    };

    await heirRef.update({
      activeMission: null,
      missionCooldowns,
    });
    await lineageRef.update({ updatedAt: FieldValue.serverTimestamp() });

    return { missionId, cooldownExpiresAtMs };
  }
);
