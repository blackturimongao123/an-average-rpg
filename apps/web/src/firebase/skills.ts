import { claimSkill as claimSkillFunction } from "./functions";
import { bootstrapAdvanceSubclass } from "./skillBootstrap";
import { getFirebaseErrorMessage } from "@/lib/firebaseErrors";

export async function claimPlayerSkill(
  userId: string,
  lineageId: string,
  heirId: string,
  skillId: string
) {
  try {
    const response = await claimSkillFunction({ lineageId, heirId, skillId });
    return response.data;
  } catch (error) {
    void userId;
    throw new Error(getFirebaseErrorMessage(error));
  }
}

export async function advancePlayerSubclass(
  userId: string,
  lineageId: string,
  heirId: string,
  subclassId: string
) {
  try {
    return await bootstrapAdvanceSubclass(userId, lineageId, heirId, subclassId);
  } catch (error) {
    throw new Error(getFirebaseErrorMessage(error));
  }
}
