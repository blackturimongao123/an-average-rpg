import { createLineage, createHeir } from "./functions";
import { bootstrapLineage } from "./lineageBootstrap";
import { bootstrapHeir } from "./heirBootstrap";
import { getFirebaseErrorMessage, isFunctionsUnavailable } from "@/lib/firebaseErrors";

export async function createPlayerBloodline(
  userId: string,
  familyName: string,
  username: string
): Promise<{ lineageId: string; familyName: string }> {
  try {
    const response = await createLineage({ familyName, username });
    return response.data;
  } catch (error) {
    if (isFunctionsUnavailable(error)) {
      try {
        return await bootstrapLineage(userId, familyName, username);
      } catch (bootstrapError) {
        throw new Error(getFirebaseErrorMessage(bootstrapError));
      }
    }

    throw new Error(getFirebaseErrorMessage(error));
  }
}

export async function createPlayerHeir(
  userId: string,
  lineageId: string,
  classId: string,
  name: string
): Promise<{ heirId: string }> {
  try {
    const response = await createHeir({ lineageId, classId, name });
    return { heirId: response.data.heirId };
  } catch (error) {
    if (isFunctionsUnavailable(error)) {
      try {
        return await bootstrapHeir(userId, lineageId, classId, name);
      } catch (bootstrapError) {
        throw new Error(getFirebaseErrorMessage(bootstrapError));
      }
    }

    throw new Error(getFirebaseErrorMessage(error));
  }
}
