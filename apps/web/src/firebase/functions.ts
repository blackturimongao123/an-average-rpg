import { httpsCallable } from "firebase/functions";
import { functions } from "./config";

export const createLineage = httpsCallable<
  { familyName: string; username: string },
  { lineageId: string; familyName: string }
>(functions, "createLineage");

export const createHeir = httpsCallable<
  { lineageId: string; classId: string; name: string },
  { heirId: string; heir: unknown }
>(functions, "createHeir");

export const killHeir = httpsCallable<
  { lineageId: string; heirId: string; deathCause: string },
  {
    previousHeirId: string;
    goldInherited: number;
    itemsInherited: string[];
    itemsLost: string[];
    effectsInherited: string[];
    effectsExpired: string[];
    uniqueSkillsReleased: string[];
  }
>(functions, "killHeir");

export const resolveTavernQuest = httpsCallable<
  { lineageId: string; heirId: string; eventId: string; choiceId: string },
  {
    eventId: string;
    choiceId: string;
    outcome: {
      description: string;
      goldDelta: number;
      xpDelta: number;
      itemRewards: string[];
      effectsAdded: string[];
      heirDied: boolean;
    };
    heirGoldAfter: number;
    heirXpAfter: number;
    leveledUp: boolean;
  }
>(functions, "resolveTavernQuest");

export const resolveDungeon = httpsCallable<
  { lineageId: string; heirId: string; dungeonId: string; floor: number },
  {
    battleId: string;
    victory: boolean;
    heirDied: boolean;
    monsterFaced: string;
    rewards: { gold: number; xp: number; items: string[] };
    floorCleared: boolean;
    dungeonCompleted: boolean;
    battleRounds: unknown[];
  }
>(functions, "resolveDungeon");

export const workJobShift = httpsCallable<
  { lineageId: string; heirId: string; jobId: string },
  {
    salaryEarned: number;
    xpEarned: number;
    promoted: boolean;
    newPosition: string | null;
    event: { id: string; description: string; goldDelta: number } | null;
    skillsUnlocked: string[];
    heirGoldAfter: number;
  }
>(functions, "workJobShift");

export const depositGold = httpsCallable<
  { lineageId: string; heirId: string; amount: number },
  { deposited: number; heirGoldAfter: number; bankGoldAfter: number }
>(functions, "depositGold");

export const withdrawGold = httpsCallable<
  { lineageId: string; heirId: string; amount: number },
  { withdrawn: number; heirGoldAfter: number; bankGoldAfter: number }
>(functions, "withdrawGold");

export const depositItem = httpsCallable<
  { lineageId: string; heirId: string; itemId: string },
  { bankItemId: string; itemId: string; remainingBankSlots: number }
>(functions, "depositItem");

export const withdrawItem = httpsCallable<
  { lineageId: string; heirId: string; bankItemId: string },
  { itemId: string; remainingBankSlots: number }
>(functions, "withdrawItem");

export const claimSkill = httpsCallable<
  { lineageId: string; heirId: string; skillId: string },
  { skillId: string; skillName: string; skillPointsRemaining: number }
>(functions, "claimSkill");

export const claimUniqueSkill = httpsCallable<
  { lineageId: string; heirId: string; skillId: string },
  { skillId: string; skillName: string; claimed: boolean }
>(functions, "claimUniqueSkill");

export const equipItem = httpsCallable<
  { lineageId: string; heirId: string; itemId: string; slot: "main" | "secondary" | "armor" | "accessory" },
  {
    equipment: {
      mainWeapon: string | null;
      secondaryWeapon: string | null;
      armor: string | null;
      accessory: string | null;
    };
    inventory: string[];
  }
>(functions, "equipItem");

export const unequipItem = httpsCallable<
  { lineageId: string; heirId: string; slot: "main" | "secondary" | "armor" | "accessory" },
  {
    equipment: {
      mainWeapon: string | null;
      secondaryWeapon: string | null;
      armor: string | null;
      accessory: string | null;
    };
    inventory: string[];
  }
>(functions, "unequipItem");

export const upgradeItem = httpsCallable<
  { lineageId: string; heirId: string; instanceId?: string; itemId?: string },
  {
    instanceId: string;
    itemId: string;
    upgradeLevel: number;
    itemLevel: number;
    goldSpent: number;
    heirGoldAfter: number;
  }
>(functions, "upgradeItem");

export const allocateStatPoints = httpsCallable<
  { lineageId: string; heirId: string; stat: string; amount?: number },
  { stats: Record<string, number>; unspentStatPoints: number }
>(functions, "allocateStatPoints");

export const purchaseMerchantItem = httpsCallable<
  { lineageId: string; heirId: string; slotIndex: number },
  {
    itemId: string;
    instanceId: string;
    price: number;
    heirGoldAfter: number;
    inventory: string[];
    merchantBoard: unknown;
  }
>(functions, "purchaseMerchantItem");

export const createParty = httpsCallable<
  { lineageId: string },
  { partyId: string }
>(functions, "createParty");

export const inviteToParty = httpsCallable<
  { lineageId: string; toUsername: string },
  { inviteId: string; toUid: string }
>(functions, "inviteToParty");

export const acceptPartyInvite = httpsCallable<
  { lineageId: string; inviteId: string },
  { partyId: string }
>(functions, "acceptPartyInvite");

export const leaveParty = httpsCallable<
  { lineageId: string },
  { left: boolean }
>(functions, "leaveParty");

export const abandonMission = httpsCallable<
  { lineageId: string; heirId: string },
  { missionId: string; cooldownExpiresAtMs: number }
>(functions, "abandonMission");

export const failMission = httpsCallable<
  { lineageId: string; heirId: string },
  { missionId: string; cooldownExpiresAtMs: number }
>(functions, "failMission");
