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
  /** Mission template IDs this heir has completed at least once. */
  completedMissionIds?: string[];
  /** Durable receipts preventing party outcomes from being applied more than once. */
  appliedPartyMissionOutcomeIds?: string[];
  /** Unique mission interludes already experienced by this heir. */
  seenUniqueMissionEventIds?: string[];
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
  lastDailyTickDate?: string;
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

export type MissionEventType = "discovery" | "combat" | "rest" | "social" | "hazard";
export type MissionTimeCost = "low" | "normal" | "high";

export interface MissionChoiceTag {
  label: string;
  tone: "risk" | "reward" | "neutral" | "cost";
}

export interface MissionCampaignChoice {
  id: string;
  label: string;
  subtitle: string;
  tags?: MissionChoiceTag[];
  supplyCost?: number;
  moraleDelta?: number;
  hpDelta?: number;
  stageCost?: number;
  /** Objective increments applied when this choice resolves successfully. */
  objectiveProgress?: Record<string, number>;
  /** UI-only: choice cannot be selected (e.g. Rest exhausted). */
  unavailable?: boolean;
}

export interface MissionCampaignStep {
  text: string;
  title?: string;
  eventType?: MissionEventType;
  timeCost?: MissionTimeCost;
  choices?: MissionCampaignChoice[];
  sceneGradient?: string;
  sceneImage?: string;
  combatEncounter?: MissionCombatEncounter;
  /** Objective increments applied when this event resolves successfully. */
  objectiveProgress?: Record<string, number>;
  /** Plot beat — always plays in order. Omitted = fixed. */
  kind?: "fixed";
}

/** Event step for missions, dungeon floor approach, and shared adventure UI. */
export type AdventureEventStep = MissionCampaignStep;

export type MissionSetting =
  | "town"
  | "forest"
  | "wilderness"
  | "cave"
  | "mountain"
  | "dungeon"
  | "coast"
  | "swamp"
  | "road"
  | "ruins"
  | "crypt";
export type MissionTone = "mild" | "moderate" | "dangerous" | "lethal";

export type MissionArc =
  | "rescue"
  | "retrieve"
  | "hunt"
  | "investigate"
  | "escort"
  | "exorcise"
  | "defend"
  | "delve"
  | "seal"
  | "negotiate"
  | "sabotage"
  | "pilgrimage";

export type InterludeKind = "random" | "unique" | "secret";

export interface MissionInterludeRequirements {
  /** Empty or omitted = any setting. Otherwise mission setting must match. */
  settings?: MissionSetting[];
  /** Empty or omitted = any tone. */
  tones?: MissionTone[];
  minHeirLevel?: number;
  minAdventurerRank?: AdventurerRank;
  /** All listed mission IDs must be completed on this heir before eligible. */
  requiresMissionCompleted?: string[];
  /** Lineage generation gate (interludes / board secrets). */
  generationAtLeast?: number;
  /** Heir must be one of these classes, or meet requiredStats when classOrStatGate is set. */
  requiredClassIds?: string[];
  /** Minimum stat values; with classOrStatGate, any listed class OR all stats suffices. */
  requiredStats?: Partial<Record<keyof Stats, number>>;
  classOrStatGate?: boolean;
  minInfamy?: number;
  maxInfamy?: number;
  /** Lineage chronicle dead heir count from publicSummary.deadHeirs. */
  deadHeirsAtLeast?: number;
  interludeKind?: InterludeKind;
}

export interface MissionBoardHiddenUntil {
  requiresMissionCompleted?: string[];
  anyMissionCompleted?: string[];
  minAdventurerRank?: AdventurerRank;
  minHeirLevel?: number;
  generationAtLeast?: number;
  deadHeirsAtLeast?: number;
  minInfamy?: number;
  maxInfamy?: number;
  requiredClassIds?: string[];
  requiredStats?: Partial<Record<keyof Stats, number>>;
  classOrStatGate?: boolean;
}

export interface MissionBoardRequirements {
  /** Mission stays off the board until all conditions pass. */
  hiddenUntil?: MissionBoardHiddenUntil;
}

export interface MissionRandomEvent extends MissionInterludeRequirements {
  id: string;
  weight: number;
  maxPerRun?: number;
  title: string;
  text: string;
  eventType?: MissionEventType;
  timeCost?: MissionTimeCost;
  sceneImage?: string;
  choices?: MissionCampaignChoice[];
  combatEncounter?: MissionCombatEncounter;
}

/** One-time-per-heir interludes from the mission bible. */
export interface MissionUniqueEvent extends MissionInterludeRequirements {
  id: string;
  weight: number;
  maxPerRun?: number;
  title: string;
  text: string;
  eventType?: MissionEventType;
  timeCost?: MissionTimeCost;
  sceneImage?: string;
  choices?: MissionCampaignChoice[];
  combatEncounter?: MissionCombatEncounter;
}

export type MissionSecretCondition =
  | { type: "choiceMade"; choiceId: string }
  | { type: "moraleAtMost"; value: number }
  | { type: "moraleAtLeast"; value: number }
  | { type: "suppliesAtMost"; value: number }
  | { type: "heirStatAtLeast"; stat: keyof Stats; value: number }
  | { type: "heirStatAtMost"; stat: keyof Stats; value: number }
  | { type: "generationAtLeast"; value: number }
  | { type: "randomEventSeen"; eventId: string }
  | { type: "fixedStepCompleted"; stepIndex: number }
  | { type: "minHeirLevel"; value: number }
  | { type: "minAdventurerRank"; rank: AdventurerRank }
  | { type: "missionCompleted"; missionId: string }
  | { type: "anyMissionCompleted"; missionIds: string[] }
  | { type: "infamyAtLeast"; value: number }
  | { type: "infamyAtMost"; value: number }
  | { type: "deadHeirsAtLeast"; value: number }
  | { type: "classId"; classId: string };

export interface MissionSecretEvent extends MissionInterludeRequirements {
  id: string;
  conditions: MissionSecretCondition[];
  title: string;
  text: string;
  eventType?: MissionEventType;
  timeCost?: MissionTimeCost;
  sceneImage?: string;
  choices?: MissionCampaignChoice[];
  combatEncounter?: MissionCombatEncounter;
  maxPerRun?: number;
}

export interface MissionCampaignInterlude {
  kind: "random" | "secret" | "unique";
  eventId: string;
  step: MissionCampaignStep;
}

export interface MissionCampaign {
  regionName?: string;
  /** Drives default scene and random pool flavor (town, forest, …). */
  setting?: MissionSetting;
  /** Caps combat in random interludes — mild missions stay non-violent. */
  tone?: MissionTone;
  defaultSceneImage?: string;
  maxStages?: number;
  startingSupplies?: number;
  /** Ordered plot beats — always play in sequence. */
  steps: MissionCampaignStep[];
  /** Weighted detours between fixed steps. */
  randomPool?: MissionRandomEvent[];
  /** Hidden beats gated by run state (checked before random rolls). */
  secretEvents?: MissionSecretEvent[];
  /** 0–1 chance to roll randomPool after each non-final fixed step. Default 0.35 when pool exists. */
  randomEventChance?: number;
  /** Objective-driven missions only succeed after every main objective is complete. */
  objectives?: MissionObjective[];
}

export type MissionObjectiveKind = "main" | "bonus" | "hidden";

export interface MissionObjective {
  id: string;
  label: string;
  kind: MissionObjectiveKind;
  target: number;
  hiddenUntilDiscovered?: boolean;
}

export interface MissionObjectiveProgress {
  objectiveId: string;
  current: number;
  target: number;
  completed: boolean;
  discovered: boolean;
}

export interface CampaignRunState {
  supplies: number;
  maxSupplies: number;
  morale: number;
  stagesRemaining: number;
  maxStages: number;
  eventLog: Array<{ text: string; timestampMs: number }>;
  runGold: number;
  runXp: number;
  runItems: string[];
  hpPercent: number;
  regionName?: string;
  seenRandomEventIds?: string[];
  seenSecretEventIds?: string[];
  seenUniqueInterludeIds?: string[];
  choiceHistory?: string[];
  interlude?: MissionCampaignInterlude;
  /** Times Rest was used this contract (max 2). */
  restUsesCount?: number;
  objectiveProgress?: MissionObjectiveProgress[];
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
  arc?: MissionArc;
  rewards: MissionRewards;
  boardRequirements?: MissionBoardRequirements;
  campaign: MissionCampaign;
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
  campaignState?: CampaignRunState;
  /** Monotonic optimistic-concurrency token for mission advancement. */
  revision?: number;
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
  /** Explicit target when multiple combatants share a side (party co-op). */
  targetId?: string;
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

export interface BattleCombatant {
  id: string;
  name: string;
  side: "ally" | "enemy";
  maxHp: number;
  startHp: number;
  speed: number;
  portraitSrc?: string;
  classId?: string;
}

export interface BattleReplayPayload {
  combatants: BattleCombatant[];
  rounds: BattleRound[];
  victory: boolean;
  gaugeThreshold: number;
  sceneImage?: string;
  sceneGradient?: string;
}

export interface MissionCombatEncounter {
  monsterId: string;
  levelScale?: number;
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

export interface PartyDungeonBattleSummary {
  victory: boolean;
  heirDied: boolean;
  monsterFaced: string;
  monsterId: string;
  rewards: { gold: number; xp: number; items: string[] };
  floorCleared: boolean;
  dungeonCompleted: boolean;
  choiceLabel?: string;
}

export interface PartyDungeonEventOutcome {
  persistKey: string;
  floor: number;
  floorChoiceId: string;
  logText: string;
  rewards: { gold: number; xp: number; items: string[] };
  floorCleared: boolean;
  dungeonCompleted: boolean;
}

export interface PartyActiveDungeon {
  dungeonId: string;
  dungeonName: string;
  currentFloor: number;
  phase: "floor_event" | "battle";
  floorChoiceId: string | null;
  battleSeed: string | null;
  battleReplay: BattleReplayPayload | null;
  battleSummary: PartyDungeonBattleSummary | null;
  lastEventOutcome?: PartyDungeonEventOutcome | null;
  runLog: Array<{ text: string; timestampMs: number }>;
  updatedAtMs: number;
}

export interface PartyMissionPendingBattle {
  battleReplay: BattleReplayPayload;
  choiceLabel?: string;
  missionFailed?: boolean;
  completed?: boolean;
  updatedAtMs: number;
}

export interface PartyMissionOutcome {
  completed: boolean;
  missionFailed?: boolean;
  rewards?: MissionRewards | null;
  adventurerRank?: AdventurerRank;
  adventurerRankXp?: number;
  rankUp?: { rank: AdventurerRank; rankXp: number } | null;
  updatedAtMs: number;
}

export interface PartyActiveMission {
  missionId: string;
  missionName: string;
  difficulty: AdventurerRank;
  slotIndex: number;
  currentStep: number;
  totalSteps: number;
  startedAtMs: number;
  campaignState?: CampaignRunState;
  revision?: number;
  leaderUid: string;
  leaderLineageId: string;
  leaderHeirId: string;
  updatedAtMs: number;
  pendingBattle?: PartyMissionPendingBattle | null;
  outcome?: PartyMissionOutcome | null;
}

export interface PartyMemberProfile {
  familyName: string;
  heirName: string;
  classId: string;
  subclassId?: string | null;
  level: number;
}

export interface Party {
  id: string;
  leaderUid: string;
  leaderLineageId: string;
  memberUids: string[];
  memberLineageIds: string[];
  memberProfiles?: PartyMemberProfile[];
  createdAtMs: number;
  activeDungeon?: PartyActiveDungeon | null;
  activeMission?: PartyActiveMission | null;
  /** Set when a party mission ends; cleared after the leader dismisses the reward screen. */
  lastMissionOutcome?: PartyMissionOutcome | null;
}

export interface PartyInvite {
  id: string;
  fromUid: string;
  toUid: string;
  partyId: string;
  status: "pending" | "accepted" | "declined";
  createdAtMs: number;
  fromHeirName: string;
  fromFamilyName: string;
  toHeirName?: string;
}

export interface HeirLookupEntry {
  heirName: string;
  nameKey: string;
  ownerUid: string;
  lineageId: string;
  heirId: string;
  familyName: string;
  classId: string;
  partyId?: string | null;
  updatedAtMs: number;
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
  approach?: AdventureEventStep;
}

export interface TavernEvent {
  id: string;
  name: string;
  description: string;
  requirements: EventRequirements;
  weight: number;
  choices: EventChoice[];
  /** Background art for adventure UI (GitHub Pages path under /scenes/). */
  sceneImage?: string;
  eventType?: MissionEventType;
  /** Content grouping — many events can share one location/background. */
  location?: string;
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
