import { bootstrapAdvanceSubclass, bootstrapClaimSkill } from "./skillBootstrap";
import { getFirebaseErrorMessage } from "@/lib/firebaseErrors";

let skillSaveQueue: Promise<void> = Promise.resolve();

export async function claimPlayerSkill(
  userId: string,
  lineageId: string,
  heirId: string,
  skillId: string
) {
  const save = skillSaveQueue.then(() =>
    bootstrapClaimSkill(userId, lineageId, heirId, skillId)
  );
  skillSaveQueue = save.then(() => undefined, () => undefined);
  try {
    return await save;
  } catch (error) {
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
