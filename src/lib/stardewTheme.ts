import type { SeedPriority as Priority, SeedTag as IssueTag } from "@/types";

export const stardew = {
  woodPanel:
    "bg-[#8b5a2b] border-[4px] border-[#4a2f1e] text-[#fce8cc] shadow-[inset_2px_2px_0px_#b07d4b,4px_4px_0px_rgba(0,0,0,0.25)]",
  woodButton:
    "bg-[#a6754b] border-[4px] border-[#4a2f1e] text-[#fce8cc] shadow-[inset_2px_2px_0px_#c28f5b] hover:bg-[#b07d4b] active:translate-y-1 active:shadow-none transition-all cursor-pointer font-bold",
  parchmentPanel:
    "bg-[#e8d6b3] border-[4px] border-[#8b5a2b] text-[#4a3525] shadow-[4px_4px_0px_rgba(0,0,0,0.15)]",
  parchmentInput:
    "bg-[#d4a373] border-[2px] border-[#a6754b] text-[#4a3525] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)] focus:outline-none focus:border-[#8b5a2b] p-2 w-full font-serif",
  soilBed:
    "bg-[#6a4427] border-[4px] border-[#4a2f1e] shadow-[inset_4px_4px_12px_rgba(0,0,0,0.3)]",
  fontPixel: "font-mono uppercase tracking-wider",
  fontBody: "font-serif",
} as const;

export function getPriorityColor(priority: Priority): string {
  switch (priority) {
    case "urgent":
      return "bg-[#c75438]";
    case "high":
      return "bg-[#e36944]";
    case "medium":
      return "bg-[#e9c85a]";
    case "low":
      return "bg-[#5aa6d1]";
  }
}

export function getTagColor(tag: IssueTag): string {
  switch (tag) {
    case "bug":
      return "bg-[#c75438] text-[#fce8cc]";
    case "feature":
      return "bg-[#5a8043] text-[#fce8cc]";
    case "idea":
      return "bg-[#e9c85a] text-[#4a2f1e]";
    case "research":
      return "bg-[#5aa6d1] text-[#fce8cc]";
    case "decision":
      return "bg-[#8b5aab] text-[#fce8cc]";
  }
}
