"use client";

import { useGardenStore } from "@/store";
import { plantAssetMap } from "@/lib/plantAssets";
import { stardew, getPriorityColor } from "@/lib/stardewTheme";
import type { GardenIssue, Priority } from "@/types";

const PRIORITIES: Priority[] = ["urgent", "high", "medium", "low"];

const dirtPathPattern = `url("data:image/svg+xml,%3Csvg width='32' height='32' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='32' height='32' fill='%23a6754b'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%238b5a2b'/%3E%3Crect x='20' y='12' width='4' height='4' fill='%23d4a373'/%3E%3Crect x='10' y='24' width='4' height='4' fill='%238b5a2b'/%3E%3Crect x='28' y='28' width='4' height='4' fill='%23d4a373'/%3E%3C/svg%3E")`;

function PlantSprite({ issue }: { issue: GardenIssue }) {
  const plant = plantAssetMap[issue.plantType];
  const selectIssue = useGardenStore((s) => s.selectIssue);

  return (
    <button
      onClick={() => selectIssue(issue.id)}
      className="group relative flex flex-col items-center justify-end h-24 hover:-translate-y-1 transition-transform"
    >
      {/* Shadow */}
      <div className="absolute bottom-2 w-10 h-4 bg-black/30 rounded-full blur-[2px]" />
      {/* Plant image */}
      <img
        src={plant[issue.status]}
        alt={issue.title}
        className="relative z-10 w-16 h-16 object-contain drop-shadow-[2px_2px_0px_#1a1025]"
        style={{ imageRendering: "pixelated" }}
      />
      {/* Tooltip */}
      <div
        className={`absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 ${stardew.parchmentPanel} p-2 text-xs text-center pointer-events-none`}
      >
        <p
          className={`${stardew.fontPixel} font-bold border-b border-[#a6754b] pb-1 mb-1`}
        >
          {issue.title}
        </p>
        <p>
          {issue.status} · {plantAssetMap[issue.plantType].label}
        </p>
      </div>
    </button>
  );
}

export function GardenView2D() {
  const issues = useGardenStore((s) => s.issues);
  const activeIssues = issues.filter((i) => i.status !== "fruit" && i.status !== "compost");

  return (
    <div className="relative grid grid-cols-2 gap-12 p-12 border-[6px] border-dashed border-[#486334] rounded-xl bg-[#618a48] overflow-hidden">

      {/* --- GARDEN PATHS (z-0, behind beds) --- */}
      {/* Vertical Path */}
      <div
        className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-24 border-x-[4px] border-[#8b5a2b] z-0"
        style={{ backgroundImage: dirtPathPattern, imageRendering: "pixelated" }}
      />
      {/* Horizontal Path */}
      <div
        className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-24 border-y-[4px] border-[#8b5a2b] z-0"
        style={{ backgroundImage: dirtPathPattern, imageRendering: "pixelated" }}
      />
      {/* Center Intersection */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 z-0"
        style={{ backgroundImage: dirtPathPattern, imageRendering: "pixelated" }}
      />

      {/* --- CENTER FOUNTAIN (z-20) --- */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 z-20 flex items-center justify-center pointer-events-none">
        <div className="absolute bottom-2 w-28 h-12 bg-black/40 rounded-[50%] blur-[2px]" />
        <div className="absolute w-24 h-16 bg-[#595652] rounded-[50%] border-b-[6px] border-[#333333]" />
        <div className="absolute w-20 h-12 bg-[#9badb7] rounded-[50%] -translate-y-2 border-2 border-[#595652]" />
        <div className="absolute w-16 h-10 bg-[#5aa6d1] rounded-[50%] -translate-y-2 border-[2px] border-[#3d7a9c] overflow-hidden flex items-center justify-center shadow-[inset_0_4px_6px_rgba(0,0,0,0.2)]">
          <div className="absolute top-2 w-10 h-3 border-t-[2px] border-[#9bddff] rounded-[50%] opacity-80" />
          <div className="absolute bottom-2 w-6 h-2 border-b-[2px] border-[#9bddff] rounded-[50%] opacity-60" />
          <div className="absolute top-2 left-2 w-1 h-1 bg-white animate-pulse" />
          <div className="absolute top-4 right-3 w-1.5 h-1.5 bg-white animate-pulse" style={{ animationDelay: "0.5s" }} />
          <div className="absolute bottom-3 left-5 w-1 h-1 bg-[#9bddff] animate-pulse" style={{ animationDelay: "1s" }} />
        </div>
      </div>

      {/* --- PRIORITY BEDS (z-10) --- */}
      {PRIORITIES.map((priority) => {
        const bedIssues = activeIssues.filter((i) => i.priority === priority);
        return (
          <div
            key={priority}
            className={`${stardew.soilBed} relative min-h-[250px] p-6 z-10`}
          >
            {/* Wooden plank frame */}
            <div className="absolute top-0 left-0 w-full h-4 bg-[#8b5a2b] border-b-[2px] border-[#4a2f1e]" />
            <div className="absolute bottom-0 left-0 w-full h-4 bg-[#8b5a2b] border-t-[2px] border-[#4a2f1e]" />
            <div className="absolute top-0 left-0 w-4 h-full bg-[#8b5a2b] border-r-[2px] border-[#4a2f1e]" />
            <div className="absolute top-0 right-0 w-4 h-full bg-[#8b5a2b] border-l-[2px] border-[#4a2f1e]" />

            {/* Bed label plaque */}
            <div
              className={`absolute -top-4 left-6 ${stardew.woodPanel} px-3 py-1 ${stardew.fontPixel} text-xs flex items-center gap-2`}
            >
              <div
                className={`w-3 h-3 rounded-full ${getPriorityColor(priority)} border-2 border-[#4a2f1e]`}
              />
              {priority}
              <span className="text-[#e8d6b3] ml-1">({bedIssues.length})</span>
            </div>

            {/* Plants grid */}
            <div className="grid grid-cols-4 gap-4 mt-4">
              {bedIssues.map((issue) => (
                <PlantSprite key={issue.id} issue={issue} />
              ))}
              {bedIssues.length === 0 && (
                <div className="col-span-4 text-center py-8 text-[#a6754b] border-2 border-dashed border-[#8b5a2b] rounded">
                  <p className={`${stardew.fontPixel} text-xs`}>
                    Empty soil bed
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
