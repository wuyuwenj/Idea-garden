"use client";

import { useState } from "react";
import { useGardenStore } from "@/store";
import { plantAssetMap } from "@/lib/plantAssets";
import { stardew, getPriorityColor } from "@/lib/stardewTheme";
import { X } from "lucide-react";
import type { SeedPriority, PlantType } from "@/types";

const PRIORITIES: { value: SeedPriority; label: string }[] = [
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

function getRandomPlantType(): PlantType {
  const types = Object.keys(plantAssetMap) as PlantType[];
  return types[Math.floor(Math.random() * types.length)];
}

export function CreateSeedDialog({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<SeedPriority>("medium");
  const [plantType, setPlantType] = useState<PlantType>(getRandomPlantType);

  const addSeed = useGardenStore((s) => s.addSeed);

  const handleSubmit = () => {
    if (!title.trim()) return;
    addSeed({
      id: `s-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      status: "seed",
      priority,
      plantType,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div
        className={`${stardew.parchmentPanel} w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[12px_12px_0px_rgba(0,0,0,0.4)]`}
      >
        {/* Header */}
        <header
          className={`${stardew.woodPanel} p-4 flex justify-between items-center -m-1 z-10`}
        >
          <h2 className={`${stardew.fontPixel} text-xl`}>Plant a New Seed</h2>
          <button
            onClick={onClose}
            className="hover:bg-[#a6754b] p-1 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </header>

        {/* Form */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6">
          <div>
            <label
              className={`${stardew.fontPixel} block mb-2 text-[#8b5a2b]`}
            >
              Idea Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={stardew.parchmentInput}
              placeholder="What's the idea?"
            />
          </div>

          <div>
            <label
              className={`${stardew.fontPixel} block mb-2 text-[#8b5a2b]`}
            >
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${stardew.parchmentInput} h-24`}
              placeholder="Describe the seed..."
            />
          </div>

          <div>
            <label
              className={`${stardew.fontPixel} block mb-2 text-[#8b5a2b]`}
            >
              Soil Priority
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={`${stardew.woodButton} py-2 text-sm flex items-center justify-center gap-2 ${
                    priority === p.value
                      ? "translate-y-1 bg-[#8b5a2b] shadow-none"
                      : ""
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full ${getPriorityColor(p.value)} border border-[#4a2f1e]`}
                  />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Plant type preview (randomly assigned) */}
          <div>
            <label
              className={`${stardew.fontPixel} block mb-2 text-[#8b5a2b]`}
            >
              Magical Crop Type
            </label>
            <div className="flex items-center gap-4 bg-[#c28f5b] border-2 border-[#8b5a2b] p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={plantAssetMap[plantType].seed}
                alt={plantAssetMap[plantType].label}
                className="w-12 h-12 object-contain"
                style={{ imageRendering: "pixelated" }}
              />
              <div>
                <p className={`${stardew.fontPixel} text-sm text-[#4a2f1e]`}>
                  {plantAssetMap[plantType].label}
                </p>
                <p className="text-xs text-[#6a4427]">Randomly assigned</p>
              </div>
              <button
                type="button"
                onClick={() => setPlantType(getRandomPlantType())}
                className={`${stardew.woodButton} px-3 py-1 text-xs ml-auto`}
              >
                Reroll
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="p-4 border-t-4 border-dashed border-[#a6754b] flex justify-end gap-4 bg-[#d4a373]">
          <button
            onClick={onClose}
            className={`${stardew.woodButton} px-6 py-2 bg-[#a6754b]`}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className={`${stardew.woodButton} px-6 py-2 bg-[#7ba65e] border-[#364d26] disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            Plant It
          </button>
        </footer>
      </div>
    </div>
  );
}
