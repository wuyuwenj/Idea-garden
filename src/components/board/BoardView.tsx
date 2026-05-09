"use client";

import { useGardenStore } from "@/store";
import { plantAssetMap } from "@/lib/plantAssets";
import { stardew, getPriorityColor } from "@/lib/stardewTheme";
import type { Seed, SeedPriority } from "@/types";

const PRIORITIES: SeedPriority[] = ["urgent", "high", "medium", "low"];

function SeedCard({ seed }: { seed: Seed }) {
  const selectSeed = useGardenStore((s) => s.selectSeed);
  const plant = plantAssetMap[seed.plant_type];

  return (
    <div
      onClick={() => selectSeed(seed.id)}
      className={`${stardew.parchmentInput} bg-[#fce8cc] cursor-pointer hover:bg-white flex gap-3 items-center group`}
    >
      <div className="w-12 h-12 bg-[#d4a373] border-2 border-[#a6754b] flex items-center justify-center group-hover:scale-110 transition-transform">
        <img
          src={plant[seed.status]}
          alt={seed.title}
          className="w-10 h-10 object-contain"
          style={{ imageRendering: "pixelated" }}
        />
      </div>
      <div className="min-w-0">
        <h4 className="font-bold text-[#4a2f1e] leading-tight truncate">
          {seed.title}
        </h4>
        <p className="text-xs text-[#8b5a2b]">{plant.label}</p>
      </div>
    </div>
  );
}

export function BoardView() {
  const seeds = useGardenStore((s) => s.seeds);

  return (
    <div
      className={`${stardew.woodPanel} p-8 flex gap-6 overflow-x-auto min-h-[600px] bg-[#a6754b]`}
    >
      {PRIORITIES.map((priority) => {
        const prioritySeeds = seeds.filter(
          (s) => s.priority === priority && s.status !== "fruit" && s.status !== "compost"
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
                {prioritySeeds.length} seeds
              </span>
            </header>

            <div className="flex flex-col gap-3">
              {prioritySeeds.map((seed) => (
                <SeedCard key={seed.id} seed={seed} />
              ))}
              {prioritySeeds.length === 0 && (
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
