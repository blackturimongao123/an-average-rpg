import { z } from "zod";

export const StatsSchema = z.object({
  strength: z.number(),
  dexterity: z.number(),
  intelligence: z.number(),
  constitution: z.number(),
  luck: z.number(),
  charisma: z.number(),
  faith: z.number(),
  infamy: z.number(),
});

export const EquipmentSchema = z.object({
  mainWeapon: z.string().nullable().optional(),
  secondaryWeapon: z.string().nullable().optional(),
  armor: z.string().nullable(),
  accessory: z.string().nullable(),
  weapon: z.string().nullable().optional(),
});

export const JobRecordSchema = z.object({
  jobId: z.string(),
  level: z.number().int().positive(),
  xp: z.number().int().nonnegative(),
  position: z.enum(["apprentice", "worker", "specialist", "master", "guildmaster"]),
  salaryPerDay: z.number().int().nonnegative(),
});

export const HeirSchema = z.object({
  id: z.string(),
  ownerUid: z.string(),
  lineageId: z.string(),
  generation: z.number().int().positive(),
  name: z.string().min(2).max(50),
  status: z.enum(["alive", "dead", "pending"]),
  classId: z.string(),
  raceId: z.string(),
  level: z.number().int().positive(),
  xp: z.number().int().nonnegative(),
  gold: z.number().int(),
  stats: StatsSchema,
  skillIds: z.array(z.string()),
  effectIds: z.array(z.string()),
  equipment: EquipmentSchema,
  inventory: z.array(z.string()),
  jobRecords: z.record(JobRecordSchema),
  subclassId: z.string().nullable().optional(),
  subclassTier: z.number().optional(),
  unspentStatPoints: z.number().optional(),
  missionCooldowns: z.record(z.number()).optional(),
  seed: z.string(),
});

export const LineageSchema = z.object({
  id: z.string(),
  ownerUid: z.string(),
  familyName: z.string().min(2).max(30),
  generation: z.number().int().positive(),
  activeHeirId: z.string().nullable(),
  bankGold: z.number().int().nonnegative(),
  bankSlots: z.number().int().positive(),
});

export const CreateLineageRequestSchema = z.object({
  familyName: z.string()
    .min(2, "Family name must be at least 2 characters")
    .max(30, "Family name must be at most 30 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Family name can only contain letters, spaces, hyphens, and apostrophes"),
});

export const CreateHeirRequestSchema = z.object({
  lineageId: z.string(),
  classId: z.enum(["warrior", "rogue", "mage", "priest", "ranger"]),
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"),
});

export const ResolveTavernQuestRequestSchema = z.object({
  lineageId: z.string(),
  heirId: z.string(),
  eventId: z.string(),
  choiceId: z.string(),
});

export const ResolveDungeonRequestSchema = z.object({
  lineageId: z.string(),
  heirId: z.string(),
  dungeonId: z.string(),
  floor: z.number().int().positive(),
});

export const WorkJobShiftRequestSchema = z.object({
  lineageId: z.string(),
  heirId: z.string(),
  jobId: z.string(),
});

export const DepositGoldRequestSchema = z.object({
  lineageId: z.string(),
  heirId: z.string(),
  amount: z.number().int().positive(),
});

export const WithdrawGoldRequestSchema = z.object({
  lineageId: z.string(),
  heirId: z.string(),
  amount: z.number().int().positive(),
});

export const ClaimSkillRequestSchema = z.object({
  lineageId: z.string(),
  heirId: z.string(),
  skillId: z.string(),
});

export type Stats = z.infer<typeof StatsSchema>;
export type Equipment = z.infer<typeof EquipmentSchema>;
export type JobRecord = z.infer<typeof JobRecordSchema>;
export type Heir = z.infer<typeof HeirSchema>;
export type Lineage = z.infer<typeof LineageSchema>;
export type CreateLineageRequest = z.infer<typeof CreateLineageRequestSchema>;
export type CreateHeirRequest = z.infer<typeof CreateHeirRequestSchema>;
