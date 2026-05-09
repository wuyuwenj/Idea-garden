"use client";

import { useGardenStore } from "@/store";
import { plantAssetMap } from "@/lib/plantAssets";
import { stardew } from "@/lib/stardewTheme";
import { Archive } from "lucide-react";

export function CompostView() {
  const seeds = useGardenStore((s) => s.seeds);
  const selectSeed = useGardenStore((s) => s.selectSeed);
  const composted = seeds.filter((s) => s.status === "compost");

  return (
    <div className={`${stardew.parchmentPanel} p-12 min-h-[600px]`}>
      <div className="text-center mb-10 border-b-4 border-double border-[#8b5a2b] pb-6">
        <div className="inline-flex justify-center items-center w-16 h-16 bg-[#8b5a2b] border-4 border-[#4a2f1e] rounded-full mb-4 shadow-[4px_4px_0_rgba(0,0,0,0.15)] text-[#d4a373]">
          <Archive size={32} />
        </div>
        <h2 className={`${stardew.fontPixel} text-3xl text-[#4a2f1e]`}>
          Compost Pile
        </h2>
        <p className="text-[#8b5a2b] font-bold mt-2">
          {composted.length} abandoned seed{composted.length !== 1 ? "s" : ""}
        </p>
      </div>

      {composted.length === 0 ? (
        <div className="text-center py-16 text-[#a6754b] border-4 border-dashed border-[#d4a373] max-w-md mx-auto">
          <Archive size={48} className="mx-auto mb-4 opacity-40" />
          <p className={`${stardew.fontPixel} text-lg`}>Nothing composted</p>
          <p className="text-sm mt-2">
            Seeds that get composted will appear here. They can be revived.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-6">
          {composted.map((seed) => {
            const plant = plantAssetMap[seed.plant_type];
            return (
              <button
                key={seed.id}
                onClick={() => selectSeed(seed.id)}
                className={`text-left ${stardew.woodPanel} bg-[#6a4427] p-4 flex flex-col items-center hover:-translate-y-2 transition-transform group opacity-80 hover:opacity-100`}
              >
                <div className="w-full h-32 bg-[#4a2f1e] border-4 border-[#3a1f0e] shadow-[inset_2px_2px_8px_rgba(0,0,0,0.4)] flex items-center justify-center mb-4 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={plant.seed}
                    alt={seed.title}
                    className="w-24 h-24 object-contain grayscale opacity-60"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
                <h3
                  className={`${stardew.fontPixel} text-center w-full truncate text-sm`}
                >
                  {seed.title}
                </h3>
                <p className="text-xs text-[#a6754b] mt-1">{plant.label}</p>
                <p className="text-xs text-[#d4a373] bg-[#4a2f1e] px-2 py-1 mt-2 w-full text-center border-2 border-[#3a1f0e]">
                  Composted{" "}
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
