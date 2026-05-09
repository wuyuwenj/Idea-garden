import { create } from "zustand";
import type { Seed, SeedStatus } from "@/types";

interface GardenState {
  // Data
  seeds: Seed[];

  // UI state
  selectedSeedId: string | null;
  activeView: "garden" | "board" | "harvest";
  sidebarOpen: boolean;

  // Actions
  setSeeds: (seeds: Seed[]) => void;
  addSeed: (seed: Seed) => void;
  updateSeed: (id: string, updates: Partial<Seed>) => void;
  updateSeedStatus: (id: string, status: SeedStatus) => void;
  deleteSeed: (id: string) => void;
  selectSeed: (id: string | null) => void;
  setActiveView: (view: "garden" | "board" | "harvest") => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useGardenStore = create<GardenState>((set) => ({
  seeds: [],

  selectedSeedId: null,
  activeView: "garden",
  sidebarOpen: false,

  setSeeds: (seeds) => set({ seeds }),
  addSeed: (seed) => set((s) => ({ seeds: [...s.seeds, seed] })),
  updateSeed: (id, updates) =>
    set((s) => ({
      seeds: s.seeds.map((seed) =>
        seed.id === id ? { ...seed, ...updates, updated_at: new Date().toISOString() } : seed
      ),
    })),
  updateSeedStatus: (id, status) =>
    set((s) => ({
      seeds: s.seeds.map((seed) =>
        seed.id === id ? { ...seed, status, updated_at: new Date().toISOString() } : seed
      ),
    })),
  deleteSeed: (id) =>
    set((s) => ({
      seeds: s.seeds.filter((seed) => seed.id !== id),
      selectedSeedId: s.selectedSeedId === id ? null : s.selectedSeedId,
      sidebarOpen: s.selectedSeedId === id ? false : s.sidebarOpen,
    })),
  selectSeed: (id) => set({ selectedSeedId: id }),
  setActiveView: (view) => set({ activeView: view }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
