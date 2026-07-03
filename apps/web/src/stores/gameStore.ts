import { create } from "zustand";
import type {
  ActiveJobShift,
  ActiveMission,
  AdventurerRank,
  BankItem,
  Heir,
  JobRecord,
  Lineage,
  MissionBoard,
} from "@bloodline/shared/types";

export type {
  ActiveJobShift,
  ActiveMission,
  AdventurerRank,
  BankItem,
  Equipment,
  Heir,
  JobRecord,
  Lineage,
  MissionBoard,
  MissionBoardSlot,
  Stats,
} from "@bloodline/shared/types";

interface GameState {
  lineage: Lineage | null;
  heir: Heir | null;
  bankItems: BankItem[];
  missionBoard: MissionBoard | null;
  loading: boolean;
  error: string | null;

  setLineage: (lineage: Lineage | null) => void;
  setHeir: (heir: Heir | null) => void;
  setBankItems: (items: BankItem[]) => void;
  setMissionBoard: (board: MissionBoard | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  updateHeirGold: (gold: number) => void;
  updateHeirXp: (xp: number) => void;
  updateHeirLevel: (level: number) => void;
  updateAdventurerRank: (rank: AdventurerRank, rankXp: number) => void;
  setActiveMission: (mission: ActiveMission | null) => void;
  setActiveJobShift: (shift: ActiveJobShift | null) => void;
  applyJobShiftRewards: (payload: {
    gold: number;
    jobId: string;
    jobRecord: JobRecord;
  }) => void;
  setHeirSubclass: (subclassId: string, tier: number) => void;
  addBloodlineSkill: (skillId: string) => void;
  updateBankGold: (gold: number) => void;
  addSkillToHeir: (skillId: string) => void;
  addItemToInventory: (itemId: string) => void;
  removeItemFromInventory: (itemId: string) => void;
}

export const useGameStore = create<GameState>((set) => ({
  lineage: null,
  heir: null,
  bankItems: [],
  missionBoard: null,
  loading: false,
  error: null,

  setLineage: (lineage) => set({ lineage }),
  setHeir: (heir) => set({ heir }),
  setBankItems: (bankItems) => set({ bankItems }),
  setMissionBoard: (missionBoard) => set({ missionBoard }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  updateHeirGold: (gold) =>
    set((state) => ({
      heir: state.heir ? { ...state.heir, gold } : null,
    })),

  updateHeirXp: (xp) =>
    set((state) => ({
      heir: state.heir ? { ...state.heir, xp } : null,
    })),

  updateHeirLevel: (level) =>
    set((state) => ({
      heir: state.heir ? { ...state.heir, level } : null,
    })),

  updateAdventurerRank: (adventurerRank, adventurerRankXp) =>
    set((state) => ({
      lineage: state.lineage ? { ...state.lineage, adventurerRank, adventurerRankXp } : null,
    })),

  setActiveMission: (activeMission) =>
    set((state) => ({
      heir: state.heir ? { ...state.heir, activeMission } : null,
    })),

  setActiveJobShift: (activeJobShift) =>
    set((state) => ({
      heir: state.heir ? { ...state.heir, activeJobShift } : null,
    })),

  applyJobShiftRewards: ({ gold, jobId, jobRecord }) =>
    set((state) => ({
      heir: state.heir
        ? {
            ...state.heir,
            activeJobShift: null,
            gold,
            jobRecords: {
              ...state.heir.jobRecords,
              [jobId]: jobRecord,
            },
          }
        : null,
    })),

  setHeirSubclass: (subclassId, subclassTier) =>
    set((state) => ({
      heir: state.heir ? { ...state.heir, subclassId, subclassTier } : null,
    })),

  addBloodlineSkill: (skillId) =>
    set((state) => ({
      lineage: state.lineage
        ? {
            ...state.lineage,
            bloodlineSkillIds: [...(state.lineage.bloodlineSkillIds ?? []), skillId],
          }
        : null,
    })),

  updateBankGold: (bankGold) =>
    set((state) => ({
      lineage: state.lineage ? { ...state.lineage, bankGold } : null,
    })),

  addSkillToHeir: (skillId) =>
    set((state) => ({
      heir: state.heir
        ? { ...state.heir, skillIds: [...state.heir.skillIds, skillId] }
        : null,
    })),

  addItemToInventory: (itemId) =>
    set((state) => ({
      heir: state.heir
        ? { ...state.heir, inventory: [...state.heir.inventory, itemId] }
        : null,
    })),

  removeItemFromInventory: (itemId) =>
    set((state) => ({
      heir: state.heir
        ? {
            ...state.heir,
            inventory: state.heir.inventory.filter((id) => id !== itemId),
          }
        : null,
    })),
}));
