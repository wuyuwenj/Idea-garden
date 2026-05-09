"use client";

import { useState } from "react";
import { useGardenStore } from "@/store";
import { plantAssetMap } from "@/lib/plantAssets";
import { stardew, getPriorityColor } from "@/lib/stardewTheme";
import { X, Search, AlertTriangle } from "lucide-react";
import { createSeed, searchSimilarSeeds } from "@/app/actions/seeds";
import type { SeedPriority, SeedTag, PlantType } from "@/types";
import type { VaultSearchMatch } from "@/lib/nia";

const PRIORITIES: { value: SeedPriority; label: string }[] = [
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const TAGS: { value: SeedTag; label: string }[] = [
  { value: "bug", label: "Bug" },
  { value: "feature", label: "Feature" },
  { value: "idea", label: "Idea" },
  { value: "research", label: "Research" },
  { value: "decision", label: "Decision" },
];

function getRandomPlantType(): PlantType {
  const types = Object.keys(plantAssetMap) as PlantType[];
  return types[Math.floor(Math.random() * types.length)];
}

function SeedNameFromPath(filePath: string) {
  return filePath.replace("/seeds/", "").replace(".md", "").replace(/-/g, " ");
}

export function CreateSeedDialog({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<SeedPriority>("medium");
  const [tags, setTags] = useState<SeedTag[]>([]);
  const [plantType, setPlantType] = useState<PlantType>(getRandomPlantType);
  const [submitting, setSubmitting] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Similar seeds state
  const [similarSeeds, setSimilarSeeds] = useState<VaultSearchMatch[] | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const addSeed = useGardenStore((s) => s.addSeed);

  const toggleTag = (tag: SeedTag) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const doCreate = async () => {
    setSubmitting(true);
    setError(null);

    const result = await createSeed({
      projectId,
      title: title.trim(),
      description: description.trim(),
      priority,
      tags,
      plant_type: plantType,
    });

    if (result?.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    if (result?.seed) {
      addSeed(result.seed);
    }

    onClose();
  };

  const handleSubmit = async () => {
    if (!title.trim() || submitting || searching) return;

    // If already confirmed, just create
    if (confirmed) {
      await doCreate();
      return;
    }

    // Search for similar seeds first
    setSearching(true);
    setError(null);

    const searchQuery = `${title.trim()} ${description.trim()}`.trim();
    const { matches } = await searchSimilarSeeds(projectId, searchQuery);

    setSearching(false);

    if (matches.length > 0) {
      // Show similar seeds and ask for confirmation
      setSimilarSeeds(matches);
    } else {
      // No similar seeds found, create directly
      await doCreate();
    }
  };

  const handleConfirmCreate = async () => {
    setConfirmed(true);
    await doCreate();
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
          <h2 className={`${stardew.fontPixel} text-xl`}>
            {similarSeeds ? "Similar Seeds Found" : "Plant a New Seed"}
          </h2>
          <button
            onClick={onClose}
            className="hover:bg-[#a6754b] p-1 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </header>

        {/* Similar seeds warning */}
        {similarSeeds ? (
          <div className="p-6 overflow-y-auto flex flex-col gap-4">
            <div className="flex items-start gap-3 bg-[#e8c36a] border-2 border-[#a6754b] p-4">
              <AlertTriangle size={24} className="text-[#8b5a2b] shrink-0 mt-0.5" />
              <div>
                <p className={`${stardew.fontPixel} text-[#4a2f1e] mb-1`}>
                  Hold on, farmer!
                </p>
                <p className="text-sm text-[#6a4427]">
                  We found similar seeds already in this garden. Check if your idea has been explored before.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {similarSeeds.map((match, i) => (
                <div
                  key={i}
                  className="bg-[#fce8cc] border-2 border-[#d4a373] p-4"
                >
                  <h4 className={`${stardew.fontPixel} text-[#4a2f1e] mb-1 capitalize`}>
                    {SeedNameFromPath(match.filePath)}
                  </h4>
                  <p className="text-sm text-[#8b5a2b]">
                    {match.content}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-[#fce8cc] border-2 border-[#d4a373] p-4">
              <p className={`${stardew.fontPixel} text-sm text-[#8b5a2b] mb-1`}>
                Your new seed:
              </p>
              <h4 className={`${stardew.fontPixel} text-[#4a2f1e]`}>{title}</h4>
              {description && (
                <p className="text-sm text-[#8b5a2b] mt-1">{description}</p>
              )}
            </div>
          </div>
        ) : (
          /* Form */
          <div className="p-6 overflow-y-auto flex flex-col gap-6">
            {error && (
              <div className="bg-red-900/30 border border-red-700 text-red-800 px-4 py-2 rounded text-sm">
                {error}
              </div>
            )}
            <div>
              <label className={`${stardew.fontPixel} block mb-2 text-[#8b5a2b]`}>
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
              <label className={`${stardew.fontPixel} block mb-2 text-[#8b5a2b]`}>
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
              <label className={`${stardew.fontPixel} block mb-2 text-[#8b5a2b]`}>
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

            {/* Tags */}
            <div>
              <label className={`${stardew.fontPixel} block mb-2 text-[#8b5a2b]`}>
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {TAGS.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => toggleTag(t.value)}
                    className={`${stardew.woodButton} px-3 py-1 text-sm ${
                      tags.includes(t.value)
                        ? "translate-y-1 bg-[#7ba65e] border-[#364d26] shadow-none"
                        : ""
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Plant type preview */}
            <div>
              <label className={`${stardew.fontPixel} block mb-2 text-[#8b5a2b]`}>
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
        )}

        {/* Footer */}
        <footer className="p-4 border-t-4 border-dashed border-[#a6754b] flex justify-end gap-4 bg-[#d4a373]">
          {similarSeeds ? (
            <>
              <button
                onClick={() => setSimilarSeeds(null)}
                className={`${stardew.woodButton} px-6 py-2 bg-[#a6754b]`}
              >
                Go Back
              </button>
              <button
                onClick={handleConfirmCreate}
                disabled={submitting}
                className={`${stardew.woodButton} px-6 py-2 bg-[#7ba65e] border-[#364d26] disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {submitting ? "Planting..." : "Plant Anyway"}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className={`${stardew.woodButton} px-6 py-2 bg-[#a6754b]`}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!title.trim() || submitting || searching}
                className={`${stardew.woodButton} px-6 py-2 bg-[#7ba65e] border-[#364d26] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2`}
              >
                {searching ? (
                  <>
                    <Search size={16} className="animate-pulse" />
                    Checking garden...
                  </>
                ) : submitting ? (
                  "Planting..."
                ) : (
                  "Plant It"
                )}
              </button>
            </>
          )}
        </footer>
      </div>
    </div>
  );
}
