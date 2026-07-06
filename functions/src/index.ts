import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { setGlobalOptions } from "firebase-functions/v2";
import { FIREBASE_FUNCTIONS_REGION } from "@bloodline/shared/constants";

// Low CPU footprint: ~24 v2 functions = ~24 Cloud Run services; default CPU per service
// exhausts regional quota on new Blaze projects (europe-west1).
setGlobalOptions({
  region: FIREBASE_FUNCTIONS_REGION,
  memory: "128MiB",
  cpu: "gcf_gen1",
  maxInstances: 2,
  concurrency: 80,
  minInstances: 0,
});

initializeApp();

export const db = getFirestore();

export * from "./actions/createLineage.js";
export * from "./actions/createHeir.js";
export * from "./actions/killHeir.js";
export * from "./actions/dailyTick.js";
export * from "./actions/resolveTavernQuest.js";
export * from "./actions/resolveDungeon.js";
export * from "./actions/workJobShift.js";
export * from "./actions/bankOperations.js";
export * from "./actions/claimSkill.js";
export * from "./actions/equipItem.js";
export * from "./actions/allocateStatPoints.js";
export * from "./actions/upgradeItem.js";
export * from "./actions/purchaseMerchantItem.js";
export * from "./actions/partyActions.js";
export * from "./actions/missionActions.js";
