import { create } from "zustand";
import type { GardenIssue, IssueStatus } from "@/types";

interface GardenState {
  // Data
  issues: GardenIssue[];

  // UI state
  selectedIssueId: string | null;
  activeView: "garden" | "board" | "harvest";
  sidebarOpen: boolean;

  // Actions
  setIssues: (issues: GardenIssue[]) => void;
  addIssue: (issue: GardenIssue) => void;
  updateIssue: (id: string, updates: Partial<GardenIssue>) => void;
  updateIssueStatus: (id: string, status: IssueStatus) => void;
  deleteIssue: (id: string) => void;
  selectIssue: (id: string | null) => void;
  setActiveView: (view: "garden" | "board" | "harvest") => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useGardenStore = create<GardenState>((set) => ({
  issues: [],

  selectedIssueId: null,
  activeView: "garden",
  sidebarOpen: false,

  setIssues: (issues) => set({ issues }),
  addIssue: (issue) => set((s) => ({ issues: [...s.issues, issue] })),
  updateIssue: (id, updates) =>
    set((s) => ({
      issues: s.issues.map((issue) =>
        issue.id === id ? { ...issue, ...updates, updatedAt: Date.now() } : issue
      ),
    })),
  updateIssueStatus: (id, status) =>
    set((s) => ({
      issues: s.issues.map((issue) =>
        issue.id === id ? { ...issue, status, updatedAt: Date.now() } : issue
      ),
    })),
  deleteIssue: (id) =>
    set((s) => ({
      issues: s.issues.filter((issue) => issue.id !== id),
      selectedIssueId: s.selectedIssueId === id ? null : s.selectedIssueId,
      sidebarOpen: s.selectedIssueId === id ? false : s.sidebarOpen,
    })),
  selectIssue: (id) => set({ selectedIssueId: id, sidebarOpen: id !== null }),
  setActiveView: (view) => set({ activeView: view }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
