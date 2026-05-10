import { create } from "zustand";
import type { Seed, SeedStatus } from "@/types";

export interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
  seedCreated?: {
    id: string;
    title: string;
    priority: string;
    tags: string[];
    plant_type: string;
  };
}

interface GardenState {
  // Data
  seeds: Seed[];

  // UI state
  selectedSeedId: string | null;
  activeView: "garden" | "board" | "harvest" | "compost";
  sidebarOpen: boolean;

  // Chat state
  chatOpen: boolean;
  chatMessages: ChatMsg[];
  chatLoading: boolean;

  // Actions
  setSeeds: (seeds: Seed[]) => void;
  addSeed: (seed: Seed) => void;
  updateSeed: (id: string, updates: Partial<Seed>) => void;
  updateSeedStatus: (id: string, status: SeedStatus) => void;
  deleteSeed: (id: string) => void;
  selectSeed: (id: string | null) => void;
  setActiveView: (view: "garden" | "board" | "harvest" | "compost") => void;
  setSidebarOpen: (open: boolean) => void;

  // Chat actions
  setChatOpen: (open: boolean) => void;
  addChatMessage: (msg: ChatMsg) => void;
  updateLastAssistantMessage: (content: string) => void;
  setChatMessages: (msgs: ChatMsg[]) => void;
  setChatLoading: (loading: boolean) => void;
}

export const useGardenStore = create<GardenState>((set) => ({
  seeds: [],

  selectedSeedId: null,
  activeView: "garden",
  sidebarOpen: false,

  chatOpen: false,
  chatMessages: [],
  chatLoading: false,

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

  setChatOpen: (open) => set({ chatOpen: open }),
  addChatMessage: (msg) =>
    set((s) => ({ chatMessages: [...s.chatMessages, msg] })),
  updateLastAssistantMessage: (content) =>
    set((s) => {
      const msgs = [...s.chatMessages];
      for (let i = msgs.length - 1; i >= 0; i--) {
        if (msgs[i].role === "assistant") {
          msgs[i] = { ...msgs[i], content };
          break;
        }
      }
      return { chatMessages: msgs };
    }),
  setChatMessages: (msgs) => set({ chatMessages: msgs }),
  setChatLoading: (loading) => set({ chatLoading: loading }),
}));
