"use client";

import { useState } from "react";
import { useGardenStore } from "@/store";
import { plantAssetMap } from "@/lib/plantAssets";
import { stardew, getPriorityColor } from "@/lib/stardewTheme";
import { Flower2 } from "lucide-react";
import type { Seed, SeedPriority } from "@/types";

const PRIORITIES: SeedPriority[] = ["urgent", "high", "medium", "low"];

const dirtPathPattern = `url("data:image/svg+xml,%3Csvg width='32' height='32' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='32' height='32' fill='%23a6754b'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%238b5a2b'/%3E%3Crect x='20' y='12' width='4' height='4' fill='%23d4a373'/%3E%3Crect x='10' y='24' width='4' height='4' fill='%238b5a2b'/%3E%3Crect x='28' y='28' width='4' height='4' fill='%23d4a373'/%3E%3C/svg%3E")`;

function PlantSprite({ seed }: { seed: Seed }) {
  const plant = plantAssetMap[seed.plant_type];
  const selectSeed = useGardenStore((s) => s.selectSeed);

  return (
    <button
      onClick={() => selectSeed(seed.id)}
      className="group relative flex flex-col items-center justify-end h-24 hover:-translate-y-1 transition-transform"
    >
      {/* Shadow */}
      <div className="absolute bottom-2 w-10 h-4 bg-black/30 rounded-full blur-[2px]" />
      {/* Plant image */}
      <img
        src={plant[seed.status]}
        alt={seed.title}
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
          {seed.title}
        </p>
        <p>
          {seed.status} · {plantAssetMap[seed.plant_type].label}
        </p>
      </div>
    </button>
  );
}

export function GardenView2D() {
  const seeds = useGardenStore((s) => s.seeds);
  const [showBloomed, setShowBloomed] = useState(false);
  const activeSeeds = seeds.filter((s) => s.status !== "flower" && s.status !== "compost");
  const bloomedSeeds = seeds.filter((s) => s.status === "flower");

  return (
    <div className="flex flex-col gap-4">
      {/* Show Bloomed toggle */}
      {bloomedSeeds.length > 0 && (
        <div className="flex justify-end px-2">
          <button
            onClick={() => setShowBloomed((v) => !v)}
            className={`${stardew.woodButton} px-4 py-2 ${stardew.fontPixel} text-xs flex items-center gap-2 ${
              showBloomed ? "translate-y-1 bg-[#7ba65e] border-[#364d26] shadow-none" : ""
            }`}
          >
            <Flower2 size={14} />
            Bloomed ({bloomedSeeds.length})
          </button>
        </div>
      )}

      {/* Bloomed flowers bed */}
      {showBloomed && bloomedSeeds.length > 0 && (
        <div className={`${stardew.soilBed} relative min-h-[120px] p-6 mx-12 border-[6px] border-dashed border-[#486334] rounded-xl`}>
          <div className="absolute top-0 left-0 w-full h-4 bg-[#8b5a2b] border-b-[2px] border-[#4a2f1e]" />
          <div className="absolute bottom-0 left-0 w-full h-4 bg-[#8b5a2b] border-t-[2px] border-[#4a2f1e]" />
          <div className="absolute top-0 left-0 w-4 h-full bg-[#8b5a2b] border-r-[2px] border-[#4a2f1e]" />
          <div className="absolute top-0 right-0 w-4 h-full bg-[#8b5a2b] border-l-[2px] border-[#4a2f1e]" />
          <div className={`absolute -top-4 left-6 ${stardew.woodPanel} px-3 py-1 ${stardew.fontPixel} text-xs flex items-center gap-2`}>
            <Flower2 size={12} className="text-[#fbf236]" />
            Bloomed
            <span className="text-[#e8d6b3] ml-1">({bloomedSeeds.length})</span>
          </div>
          <div className="grid grid-cols-6 gap-4 mt-4">
            {bloomedSeeds.map((seed) => (
              <PlantSprite key={seed.id} seed={seed} />
            ))}
          </div>
        </div>
      )}

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
        <img
          src="/plants/fountain.svg"
          alt="Fountain"
          className="w-32 h-32 object-contain"
          style={{ imageRendering: "pixelated" }}
        />
      </div>

      {/* --- PRIORITY BEDS (z-10) --- */}
      {PRIORITIES.map((priority) => {
        const bedSeeds = activeSeeds.filter((s) => s.priority === priority);
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
              <span className="text-[#e8d6b3] ml-1">({bedSeeds.length})</span>
            </div>

            {/* Plants grid */}
            <div className="grid grid-cols-4 gap-4 mt-4">
              {bedSeeds.map((seed) => (
                <PlantSprite key={seed.id} seed={seed} />
              ))}
              {bedSeeds.length === 0 && (
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
    </div>
  );
}
