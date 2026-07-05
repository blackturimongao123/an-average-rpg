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
  /** @deprecated migrated to mainWeapon on read */
  weapon?: string | null;
}

export interface ItemInstance {
  instanceId: string;
  itemId: string;
  upgradeLevel: number;
  itemLevel: number;
}

export interface JobRecord {
  jobId: string;
  level: number;
  xp: number;
  position: JobPosition;
  salaryPerDay: number;
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
  activeJobShift?: ActiveJobShift | null;
  activeMission?: ActiveMission | null;
  subclassId?: string | null;
  subclassTier?: number;
  unspentStatPoints?: number;
  itemInstances?: Record<string, ItemInstance>;
  missionCooldowns?: Record<string, number>;
  seed: string;
  createdAt?: Date;
  diedAt?: Date | null;
}

export interface Lineage {
  id: string;
  ownerUid: string;
  familyName: string;
  generation: number;
  activeHeirId: string | null;
  bankGold: number;
  bankSlots: number;
  adventurerRank?: AdventurerRank;
  adventurerRankXp?: number;
  bloodlineSkillIds?: string[];
  partyId?: string | null;
  merchantBoard?: MerchantBoard;
  createdAt?: Date;
  updatedAt?: Date;
  publicSummary: {
    highestGeneration: number;
    deadHeirs: number;
    currentClass: string | null;
  };
}

export type AdventurerRank = "F" | "E" | "D" | "C" | "B" | "A" | "S" | "SS" | "SSS";

export type MissionType = "combat" | "explore" | "deliver" | "investigate";

export interface MissionRewards {
  gold: number;
  xp: number;
  rankXp: number;
  items: string[];
}

export interface MissionCampaignStep {
  text: string;
}

export interface MissionTemplate {
  id: string;
  name: string;
  description: string;
  difficulty: AdventurerRank;
  minAdventurerRank?: AdventurerRank;
  minHeirLevel?: number;
  weight: number;
  type: MissionType;
  rewards: MissionRewards;
  campaign: {
    steps: MissionCampaignStep[];
  };
}

export type MissionBoardSlotStatus = "available" | "empty";

export interface MissionBoardSlot {
  slotIndex: number;
  missionId: string | null;
  difficulty: AdventurerRank | null;
  status: MissionBoardSlotStatus;
}

export interface MissionBoard {
  slots: MissionBoardSlot[];
  rolledAtMs: number;
  nextRerollAtMs: number;
  hourBucket: number;
}

export interface ActiveMission {
  missionId: string;
  missionName: string;
  difficulty: AdventurerRank;
  slotIndex: number;
  currentStep: number;
  totalSteps: number;
  startedAtMs: number;
}

export interface ActiveJobShift {
  jobId: string;
  jobName: string;
  hoursCommitted: number;
  goldReward: number;
  xpReward: number;
  startedAtMs: number;
  endsAtMs: number;
}

export interface BankItem {
  id: string;
  itemId: string;
  quantity: number;
  depositedAt?: Date;
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
  addedAt?: Date;
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
  startingEquipment: Equipment;
  classAbility?: {
    id: string;
    name: string;
    description: string;
  };
  flavorText?: string;
}

export interface RaceData {
  id: string;
  name: string;
  description: string;
  statModifiers: Stats;
  specialTraits: string[];
  lifespan?: string;
  flavorText?: string;
}

export interface JobData {
  id: string;
  name: string;
  description: string;
  classTags: string[];
  /** When set, job is only available on this subclass path (tier 1 or ascended tier 2). */
  subclassTags?: string[];
  baseSalary: number;
  xpPerShift: number;
  requiredStats?: Partial<Stats>;
  unlockedSkills: string[];
  promotionThresholds: number[];
  positions?: Array<{ name: string; salaryMultiplier: number }>;
  flavorText?: string;
}

export interface ClassTreeRetention {
  blockedSkillIds?: string[];
  blockedBranchRoots?: string[];
}

export interface SubclassAdvanceRequires {
  level: number;
  skillIds: string[];
}

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  treeScope?: "character" | "bloodline";
  classTags: string[];
  subclassTags?: string[];
  /** When set, skill only applies to heirs whose base classId matches. */
  originClassTags?: string[];
  cost: number;
  requires: string[];
  blocks: string[];
  grants: Effect[];
  position: { x: number; y: number };
  tier?: number;
  jobRequirement?: { jobId: string; level: number };
  specialRequirement?: string;
  /** Visual / gameplay category for constellation map. */
  nodeType?: "minor" | "passive" | "active" | "special";
  /** Silhouette on map until reveal gate passes. */
  isHidden?: boolean;
  hiddenStyle?: "silhouette" | "crystal" | "shadow_orb";
  /** Skill IDs that become visible when this hidden node is revealed. */
  revealsPaths?: string[];
}

export interface SubclassData {
  id: string;
  baseClassId: string;
  alternateBaseClassIds?: string[];
  name: string;
  description: string;
  tier: number;
  parentSubclassId: string | null;
  advanceRequires: SubclassAdvanceRequires;
  advanceRequiresByClass?: Record<string, SubclassAdvanceRequires>;
  classTreeRetentionByClass?: Record<string, ClassTreeRetention>;
  flavorText?: string;
}

export type MerchantBoardSlotStatus = "available" | "empty";

export interface MerchantBoardSlot {
  slotIndex: number;
  itemId: string | null;
  price: number | null;
  status: MerchantBoardSlotStatus;
}

export interface MerchantBoard {
  slots: MerchantBoardSlot[];
  rolledAtMs: number;
  nextRerollAtMs: number;
}

export interface Party {
  id: string;
  leaderUid: string;
  leaderLineageId: string;
  memberUids: string[];
  memberLineageIds: string[];
  createdAtMs: number;
}

export interface PartyInvite {
  id: string;
  fromUid: string;
  toUid: string;
  partyId: string;
  status: "pending" | "accepted" | "declined";
  createdAtMs: number;
}

export interface Effect {
  id: string;
  name: string;
  description?: string;
  effectType: "buff" | "debuff" | "curse" | "blessing" | "mutation" | "passive";
  scope?: "heir" | "bloodline" | "generations";
  duration?: { type: string; value: number };
  modifiers: StatModifier[];
  specialEffects?: Record<string, unknown>;
}

export interface StatModifier {
  stat: string;
  type: "flat" | "percent" | "override";
  value: number;
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
  isBoss?: boolean;
  traits?: string[];
  bossAbilities?: string[];
}

export interface LootEntry {
  itemId: string;
  weight: number;
  minQuantity: number;
  maxQuantity: number;
}

export interface DungeonData {
  id: string;
  name: string;
  description: string;
  requiredLevel: number;
  difficulty?: string;
  floors: DungeonFloor[];
  rewards?: {
    completionBonus: {
      gold: number;
      xp: number;
      items: string[];
    };
  };
  specialMechanics?: Record<string, string>;
  flavorText?: string;
}

export interface DungeonFloor {
  floor: number;
  monsterPool: string[];
  bossId: string | null;
  lootModifier: number;
  xpModifier: number;
}

export interface TavernEvent {
  id: string;
  name: string;
  description: string;
  requirements: EventRequirements;
  weight: number;
  choices: EventChoice[];
}

export interface EventRequirements {
  minLevel?: number;
  minGeneration?: number;
  requiredClass?: string;
  requiredJob?: string;
  minInfamy?: number;
}

export interface EventChoice {
  id: string;
  text: string;
  statCheck?: { stat: string; difficulty: number };
  outcomes: EventOutcome[];
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

export interface ItemData {
  id: string;
  name: string;
  description: string;
  itemType: "weapon" | "armor" | "accessory" | "consumable" | "material" | "quest";
  rarity:
    | "common"
    | "uncommon"
    | "rare"
    | "epic"
    | "legendary"
    | "mythic"
    | "unique"
    | "cursed"
    | "heirloom";
  stats?: Partial<Stats>;
  effects: string[];
  value: number;
  isBankable: boolean;
  isSoulbound: boolean;
  isHeirloom: boolean;
  equipSlot?: string;
  hands?: "one" | "two";
  weaponCategory?: string;
  allowedSlots?: ("main" | "secondary")[];
  classTags?: string[];
  maxItemLevel?: number;
  weaponDamage?: number;
  armorValue?: number;
  stackable?: boolean;
  maxStack?: number;
  isCursed?: boolean;
  heirloomBonusPerGeneration?: Partial<Stats>;
}

export interface UniqueSkill {
  id: string;
  name: string;
  description: string;
  availability: "unique_global";
  releaseCondition: string;
  grants: Effect[];
  specialEffects?: Record<string, unknown>;
}
