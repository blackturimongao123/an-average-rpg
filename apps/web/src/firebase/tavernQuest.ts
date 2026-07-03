import { resolveTavernQuest } from "./functions";
import { bootstrapTavernQuest } from "./tavernBootstrap";
import { getFirebaseErrorMessage, isFunctionsUnavailable } from "@/lib/firebaseErrors";

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
    if (isFunctionsUnavailable(error)) {
      try {
        return await bootstrapTavernQuest(userId, lineageId, heirId, eventId, choiceId);
      } catch (bootstrapError) {
        throw new Error(getFirebaseErrorMessage(bootstrapError));
      }
    }

    throw new Error(getFirebaseErrorMessage(error));
  }
}
