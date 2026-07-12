import { resolveTavernQuest } from "./functions";
import { getFirebaseErrorMessage } from "@/lib/firebaseErrors";

export async function resolvePlayerTavernQuest(
  userId: string,
  lineageId: string,
  heirId: string,
  eventId: string,
  choiceId: string
) {
  try {
    const response = await resolveTavernQuest({
      lineageId,
      heirId,
      eventId,
      choiceId,
    });
    return response.data;
  } catch (error) {
    void userId;
    throw new Error(getFirebaseErrorMessage(error));
  }
}
