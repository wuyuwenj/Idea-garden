"use client";

import { useGardenStore } from "@/store";
import { plantAssetMap } from "@/lib/plantAssets";
import { stardew, getPriorityColor } from "@/lib/stardewTheme";
import { X } from "lucide-react";
import type { SeedStatus } from "@/types";

const STAGES: { id: SeedStatus; label: string }[] = [
  { id: "seed", label: "Seed" },
  { id: "sprout", label: "Sprout" },
  { id: "flower", label: "Flower" },
  { id: "fruit", label: "Fruit" },
  { id: "compost", label: "Compost" },
];

export function SeedDetailPanel() {
  const selectedSeedId = useGardenStore((s) => s.selectedSeedId);
  const seeds = useGardenStore((s) => s.seeds);
  const sidebarOpen = useGardenStore((s) => s.sidebarOpen);
  const selectSeed = useGardenStore((s) => s.selectSeed);
  const updateSeedStatus = useGardenStore((s) => s.updateSeedStatus);
  const deleteSeed = useGardenStore((s) => s.deleteSeed);

  const seed = seeds.find((s) => s.id === selectedSeedId);

  if (!sidebarOpen || !seed) return null;

  const plant = plantAssetMap[seed.plant_type];

  return (
    <div className="fixed inset-y-0 right-0 w-[400px] z-50 shadow-[-12px_0px_0px_rgba(0,0,0,0.3)] flex flex-col">
      <div className={`${stardew.parchmentPanel} h-full flex flex-col`}>
        {/* Close button */}
        <button
          onClick={() => selectSeed(null)}
          className={`absolute -left-12 top-4 ${stardew.woodButton} p-2 bg-[#c75438] border-[#6b2a1d]`}
        >
          <X size={24} />
        </button>

        {/* Header with plant portrait */}
        <header className="p-6 bg-[#d4a373] border-b-4 border-[#8b5a2b] flex flex-col items-center">
          <div className="w-32 h-32 bg-[#5a8043] border-4 border-[#4a2f1e] shadow-[inset_4px_4px_12px_rgba(0,0,0,0.4),_4px_4px_0_rgba(0,0,0,0.1)] flex justify-center items-center mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={plant[seed.status]}
              alt={plant.label}
              className="w-24 h-24 object-contain"
              style={{ imageRendering: "pixelated" }}
            />
          </div>

          <h2
            className={`${stardew.fontPixel} text-2xl text-center mb-4`}
          >
            {seed.title}
          </h2>

          <div className="flex flex-wrap gap-2 justify-center">
            <span className="px-2 py-1 bg-[#e8d6b3] border-2 border-[#8b5a2b] text-xs font-bold uppercase flex items-center gap-1">
              <div
                className={`w-2 h-2 rounded-full ${getPriorityColor(seed.priority)} border border-black`}
              />
              {seed.priority}
            </span>
            <span className="px-2 py-1 bg-[#e8d6b3] border-2 border-[#8b5a2b] text-xs font-bold uppercase">
              {plant.label}
            </span>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 flex-grow overflow-y-auto flex flex-col gap-6">
          <section>
            <h3 className={`${stardew.fontPixel} text-[#8b5a2b] mb-2`}>
              Description
            </h3>
            <p className="bg-[#fce8cc] p-3 border-2 border-[#d4a373] min-h-[80px] font-serif">
              {seed.description || "No description yet."}
            </p>
          </section>

          <hr className="border-t-4 border-dashed border-[#a6754b]" />

          <section>
            <h3 className={`${stardew.fontPixel} text-[#8b5a2b] mb-2`}>
              Growth Stage
            </h3>
            <div className="flex justify-between gap-2">
              {STAGES.map((stage) => (
                <button
                  key={stage.id}
                  onClick={() => updateSeedStatus(seed.id, stage.id)}
                  className={`flex-1 flex flex-col items-center py-2 border-2 font-bold text-xs uppercase transition-all ${
                    seed.status === stage.id
                      ? "bg-[#7ba65e] border-[#364d26] text-white shadow-[inset_2px_2px_0_rgba(255,255,255,0.2)]"
                      : "bg-[#d4a373] border-[#a6754b] text-[#8b5a2b] opacity-60 hover:opacity-80"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={plant[stage.id]}
                    alt={stage.label}
                    className="w-8 h-8 object-contain mb-1"
                    style={{ imageRendering: "pixelated" }}
                  />
                  {stage.label}
                </button>
              ))}
            </div>
          </section>

          <hr className="border-t-4 border-dashed border-[#a6754b]" />

          <section className="text-sm text-[#8b5a2b] font-bold space-y-1">
            <div className="flex justify-between">
              <span>Planted:</span>
              <span>{new Date(seed.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Updated:</span>
              <span>{new Date(seed.updated_at).toLocaleDateString()}</span>
            </div>
          </section>

          <button
            onClick={() => deleteSeed(seed.id)}
            className={`${stardew.woodButton} bg-[#c75438] border-[#6b2a1d] mt-auto py-3`}
          >
            Uproot Seed (Delete)
          </button>
        </div>
      </div>
    </div>
  );
}
