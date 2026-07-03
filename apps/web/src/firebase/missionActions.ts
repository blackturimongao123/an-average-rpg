import { abandonMission, failMission } from "./functions";
import { getFirebaseErrorMessage } from "@/lib/firebaseErrors";

export async function abandonPlayerMission(lineageId: string, heirId: string) {
  const response = await abandonMission({ lineageId, heirId });
  return response.data;
}

export async function failPlayerMission(lineageId: string, heirId: string) {
  const response = await failMission({ lineageId, heirId });
  return response.data;
}

export function getMissionActionErrorMessage(error: unknown): string {
  return getFirebaseErrorMessage(error);
}
