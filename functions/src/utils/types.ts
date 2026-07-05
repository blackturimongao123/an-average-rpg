import { Timestamp, FieldValue } from "firebase-admin/firestore";

export interface Stats {
  strength: number;
  dexterity: number;
  intelligence: number;
  constitution: number;
  luck: number;
  charisma: number;
  faith: number;
  infamy: number;
}

export type HeirStatus = "alive" | "dead" | "pending";

export type JobPosition = "apprentice" | "worker" | "specialist" | "master" | "guildmaster";

export interface Equipment {
  mainWeapon: string | null;
  secondaryWeapon: string | null;
  armor: string | null;
  accessory: string | null;
}

export interface JobRecord {
  jobId: string;
  level: number;
  xp: number;
  position: JobPosition;
  salaryPerDay: number;
}

export interface ItemInstance {
  instanceId: string;
  itemId: string;
  upgradeLevel: number;
  itemLevel: number;
}

export interface ActiveMission {
  missionId: string;
  missionName: string;
  difficulty: string;
  slotIndex: number;
  currentStep: number;
  totalSteps: number;
  startedAtMs: number;
}

export interface Heir {
  id: string;
  ownerUid: string;
  lineageId: string;
  generation: number;
  name: string;
  status: HeirStatus;
  classId: string;
  raceId: string;
  level: number;
  xp: number;
  gold: number;
  stats: Stats;
  skillIds: string[];
  effectIds: string[];
  equipment: Equipment;
  inventory: string[];
  jobRecords: Record<string, JobRecord>;
  activeJobShift?: Record<string, unknown> | null;
  activeMission?: ActiveMission | null;
  subclassId?: string | null;
  subclassTier?: number;
  unspentStatPoints?: number;
  itemInstances?: Record<string, ItemInstance>;
  missionCooldowns?: Record<string, number>;
  seed: string;
  createdAt: Timestamp | FieldValue;
  diedAt: Timestamp | null;
}

export interface MerchantBoardSlot {
  slotIndex: number;
  itemId: string | null;
  price: number | null;
  status: "available" | "empty";
}

export interface MerchantBoard {
  slots: MerchantBoardSlot[];
  rolledAtMs: number;
  nextRerollAtMs: number;
}

export interface Lineage {
  id: string;
  ownerUid: string;
  familyName: string;
  generation: number;
  activeHeirId: string | null;
  bankGold: number;
  bankSlots: number;
  adventurerRank?: string;
  adventurerRankXp?: number;
  bloodlineSkillIds?: string[];
  partyId?: string | null;
  merchantBoard?: MerchantBoard;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  publicSummary: {
    highestGeneration: number;
    deadHeirs: number;
    currentClass: string | null;
  };
}

export interface BankItem {
  id: string;
  itemId: string;
  quantity: number;
  depositedAt: Timestamp | FieldValue;
  depositedByHeirId: string;
}

export interface BloodlineEffect {
  id: string;
  effectId: string;
  name: string;
  description: string;
  scope: "heir" | "bloodline" | "generations";
  remainingGenerations: number | null;
  addedByHeirId: string;
  addedAt: Timestamp | FieldValue;
}

export interface BattleRound {
  round: number;
  actor: string;
  action: string;
  abilityId?: string;
  abilityName?: string;
  damage: number;
  healing?: number;
  actorHpAfter: number;
  targetHpAfter: number;
  actorGaugeAfter?: number;
  isCrit: boolean;
  isMiss: boolean;
  isDodge?: boolean;
  hitCount?: number;
}

export interface BattleResult {
  victory: boolean;
  heirDied: boolean;
  rounds: BattleRound[];
  xpGained: number;
  goldGained: number;
  itemIds: string[];
  finalHeirHp: number;
  finalEnemyHp: number;
}

export interface ClassData {
  id: string;
  name: string;
  description: string;
  mainStat: string;
  startingStats: Stats;
  statGrowth: Stats;
  startingSkills: string[];
  startingEquipment: {
    weapon?: string | null;
    mainWeapon?: string | null;
    armor: string | null;
    accessory: string | null;
  };
}

export interface RaceData {
  id: string;
  name: string;
  description: string;
  statModifiers: Stats;
  specialTraits: string[];
}

export interface Monster {
  id: string;
  name: string;
  level: number;
  hp: number;
  damage: number;
  defense: number;
  dexterity: number;
  xpReward: number;
  goldRewardMin: number;
  goldRewardMax: number;
  lootTable: LootEntry[];
  traits?: string[];
}

export interface LootEntry {
  itemId: string;
  weight: number;
  minQuantity: number;
  maxQuantity: number;
}

export interface EventOutcome {
  weight: number;
  description: string;
  goldDelta: number;
  xpDelta: number;
  itemRewards: string[];
  effectsAdded: string[];
  effectsRemoved: string[];
  heirDies: boolean;
}

export interface EventChoice {
  id: string;
  text: string;
  statCheck?: { stat: string; difficulty: number };
  outcomes: EventOutcome[];
}

export interface TavernEvent {
  id: string;
  name: string;
  description: string;
  requirements: {
    minLevel?: number;
    minGeneration?: number;
    requiredClass?: string;
    requiredJob?: string;
  };
  weight: number;
  choices: EventChoice[];
}

export interface CreateLineageRequest {
  familyName: string;
  username: string;
}

export interface CreateLineageResponse {
  lineageId: string;
  familyName: string;
}

export interface CreateHeirRequest {
  lineageId: string;
  classId: string;
  name: string;
}

export interface CreateHeirResponse {
  heirId: string;
  heir: Heir;
}

export interface KillHeirRequest {
  lineageId: string;
  heirId: string;
  deathCause: string;
}

export interface KillHeirResponse {
  previousHeirId: string;
  goldInherited: number;
  itemsInherited: string[];
  itemsLost: string[];
  effectsInherited: string[];
  effectsExpired: string[];
  uniqueSkillsReleased: string[];
}
