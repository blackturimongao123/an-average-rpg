import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

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
