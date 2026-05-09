"use client";

import { useGardenStore } from "@/store";
import { plantAssetMap } from "@/lib/plantAssets";
import { stardew, getPriorityColor, getTagColor } from "@/lib/stardewTheme";
import type { GardenIssue, Priority } from "@/types";

const PRIORITIES: Priority[] = ["urgent", "high", "medium", "low"];

function IssueCard({ issue }: { issue: GardenIssue }) {
  const selectIssue = useGardenStore((s) => s.selectIssue);
  const plant = plantAssetMap[issue.plantType];

  return (
    <div
      onClick={() => selectIssue(issue.id)}
      className={`${stardew.parchmentInput} bg-[#fce8cc] cursor-pointer hover:bg-white flex gap-3 items-center group`}
    >
      <div className="w-12 h-12 bg-[#d4a373] border-2 border-[#a6754b] flex items-center justify-center group-hover:scale-110 transition-transform">
        <img
          src={plant[issue.status]}
          alt={issue.title}
          className="w-10 h-10 object-contain"
          style={{ imageRendering: "pixelated" }}
        />
      </div>
      <div className="min-w-0">
        <h4 className="font-bold text-[#4a2f1e] leading-tight truncate">
          {issue.title}
        </h4>
        <p className="text-xs text-[#8b5a2b]">{plant.label}</p>
        {issue.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {issue.tags.map((tag) => (
              <span
                key={tag}
                className={`px-1.5 py-0.5 text-[10px] font-bold uppercase border border-[#4a2f1e] ${getTagColor(tag)}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function BoardView() {
  const issues = useGardenStore((s) => s.issues);

  return (
    <div
      className={`${stardew.woodPanel} p-8 flex gap-6 overflow-x-auto min-h-[600px] bg-[#a6754b]`}
    >
      {PRIORITIES.map((priority) => {
        const priorityIssues = issues.filter(
          (i) => i.priority === priority && i.status !== "fruit" && i.status !== "compost"
        );
        return (
          <div
            key={priority}
            className={`${stardew.parchmentPanel} min-w-[300px] p-4 flex flex-col shadow-[8px_8px_0px_rgba(0,0,0,0.2)]`}
          >
            <header className="flex items-center gap-2 border-b-4 border-dashed border-[#a6754b] pb-4 mb-4">
              <div
                className={`w-4 h-4 rounded-full ${getPriorityColor(priority)} border-2 border-[#4a2f1e]`}
              />
              <h2 className={`${stardew.fontPixel} text-xl flex-grow`}>
                {priority}
              </h2>
              <span className="text-sm font-bold text-[#a6754b]">
                {priorityIssues.length} seeds
              </span>
            </header>

            <div className="flex flex-col gap-3">
              {priorityIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
              {priorityIssues.length === 0 && (
                <div className="text-center py-8 text-[#a6754b] border-2 border-dashed border-[#d4a373]">
                  No seeds here.
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
