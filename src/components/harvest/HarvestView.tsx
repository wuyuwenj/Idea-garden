"use client";

import { useGardenStore } from "@/store";
import { plantAssetMap } from "@/lib/plantAssets";
import { stardew } from "@/lib/stardewTheme";
import { Flower2 } from "lucide-react";

export function HarvestView() {
  const seeds = useGardenStore((s) => s.seeds);
  const selectSeed = useGardenStore((s) => s.selectSeed);
  const harvested = seeds.filter((s) => s.status === "flower");

  return (
    <div className={`${stardew.parchmentPanel} p-12 min-h-[600px]`}>
      <div className="text-center mb-10 border-b-4 border-double border-[#8b5a2b] pb-6">
        <div className="inline-flex justify-center items-center w-16 h-16 bg-[#e36944] border-4 border-[#4a2f1e] rounded-full mb-4 shadow-[4px_4px_0_rgba(0,0,0,0.15)] text-[#fce8cc]">
          <Flower2 size={32} />
        </div>
        <h2 className={`${stardew.fontPixel} text-3xl text-[#4a2f1e]`}>
          Harvest Gallery
        </h2>
        <p className="text-[#8b5a2b] font-bold mt-2">
          {harvested.length} beautiful bloom{harvested.length !== 1 ? "s" : ""}{" "}
          harvested
        </p>
      </div>

      {harvested.length === 0 ? (
        <div className="text-center py-16 text-[#a6754b] border-4 border-dashed border-[#d4a373] max-w-md mx-auto">
          <Flower2 size={48} className="mx-auto mb-4 opacity-40" />
          <p className={`${stardew.fontPixel} text-lg`}>No blooms yet</p>
          <p className="text-sm mt-2">
            Seeds that reach Fruit stage will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-6">
          {harvested.map((seed) => {
            const plant = plantAssetMap[seed.plant_type];
            return (
              <button
                key={seed.id}
                onClick={() => selectSeed(seed.id)}
                className={`text-left ${stardew.woodPanel} bg-[#a6754b] p-4 flex flex-col items-center hover:-translate-y-2 transition-transform group`}
              >
                <div className="w-full h-32 bg-[#e8d6b3] border-4 border-[#4a2f1e] shadow-[inset_2px_2px_8px_rgba(0,0,0,0.2)] flex items-center justify-center mb-4 relative">
                  <img
                    src={plant.flower}
                    alt={seed.title}
                    className="w-24 h-24 object-contain"
                    style={{ imageRendering: "pixelated" }}
                  />
                  <div className="absolute top-1 right-1 w-2 h-2 bg-[#fbf236] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-[#fbf236] opacity-0 group-hover:opacity-80 transition-opacity" />
                </div>
                <h3
                  className={`${stardew.fontPixel} text-center w-full truncate text-sm`}
                >
                  {seed.title}
                </h3>
                <p className="text-xs text-[#fce8cc] mt-1">{plant.label}</p>
                <p className="text-xs text-[#4a2f1e] bg-[#d4a373] px-2 py-1 mt-2 w-full text-center border-2 border-[#4a2f1e]">
                  Harvested{" "}
                  {new Date(seed.updated_at).toLocaleDateString()}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
