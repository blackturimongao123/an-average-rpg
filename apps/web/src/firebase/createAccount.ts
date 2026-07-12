import { createLineage, createHeir } from "./functions";
import { getFirebaseErrorMessage } from "@/lib/firebaseErrors";

export async function createPlayerBloodline(
  userId: string,
  familyName: string,
  username: string
): Promise<{ lineageId: string; familyName: string }> {
  try {
    const response = await createLineage({ familyName, username });
    return response.data;
  } catch (error) {
    void userId;
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
    void userId;
    throw new Error(getFirebaseErrorMessage(error));
  }
}
