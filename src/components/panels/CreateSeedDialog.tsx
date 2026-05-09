"use client";

import { useState } from "react";
import { useGardenStore } from "@/store";
import { plantAssetMap } from "@/lib/plantAssets";
import { stardew, getPriorityColor, getTagColor } from "@/lib/stardewTheme";
import { X, Search, AlertTriangle, ArrowLeft, Link2, Brain } from "lucide-react";
import { createSeed, searchSimilarSeeds, addUrlAttachment } from "@/app/actions/seeds";
import type { Seed, SeedPriority, SeedTag, PlantType } from "@/types";

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

// ── Inline Seed Detail View ──
function SeedDetailView({ seed, onBack }: { seed: Seed; onBack: () => void }) {
  const plant = plantAssetMap[seed.plant_type];

  return (
    <>
      <header
        className={`${stardew.woodPanel} p-4 flex items-center gap-3 -m-1 z-10`}
      >
        <button
          onClick={onBack}
          className="hover:bg-[#a6754b] p-1 rounded transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className={`${stardew.fontPixel} text-xl`}>Seed Details</h2>
      </header>

      <div className="overflow-y-auto flex-1 flex flex-col">
        {/* Header with plant portrait */}
        <div className="p-6 bg-[#d4a373] border-b-4 border-[#8b5a2b] flex flex-col items-center">
          <div className="w-24 h-24 bg-[#5a8043] border-4 border-[#4a2f1e] shadow-[inset_4px_4px_12px_rgba(0,0,0,0.4),_4px_4px_0_rgba(0,0,0,0.1)] flex justify-center items-center mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={plant[seed.status]}
              alt={plant.label}
              className="w-20 h-20 object-contain"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
          <h2 className={`${stardew.fontPixel} text-xl text-center mb-3`}>
            {seed.title}
          </h2>
          <div className="flex flex-wrap gap-2 justify-center">
            <span className={`px-2 py-1 border-2 text-xs font-bold uppercase flex items-center gap-1 ${
              seed.status === "compost"
                ? "bg-[#8b5a2b] border-[#4a2f1e] text-[#d4a373]"
                : "bg-[#e8d6b3] border-[#8b5a2b] text-[#4a2f1e]"
            }`}>
              <div className={`w-2 h-2 rounded-full ${getPriorityColor(seed.priority)} border border-black`} />
              {seed.status}
            </span>
            <span className="px-2 py-1 bg-[#e8d6b3] border-2 border-[#8b5a2b] text-xs font-bold uppercase">
              {plant.label}
            </span>
            {seed.tags?.map((tag) => (
              <span
                key={tag}
                className={`px-2 py-1 border-2 border-[#4a2f1e] text-xs font-bold uppercase ${getTagColor(tag)}`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-5">
          <section>
            <h3 className={`${stardew.fontPixel} text-[#8b5a2b] mb-2`}>Description</h3>
            <p className="bg-[#fce8cc] p-3 border-2 border-[#d4a373] min-h-[60px] font-serif text-sm">
              {seed.description || "No description yet."}
            </p>
          </section>

          {/* Blockers */}
          {seed.blockers?.length > 0 && (
            <>
              <hr className="border-t-4 border-dashed border-[#a6754b]" />
              <section>
                <h3 className={`${stardew.fontPixel} text-[#8b5a2b] mb-2`}>Blockers</h3>
                <ul className="space-y-1">
                  {seed.blockers.map((blocker, i) => (
                    <li key={i} className="bg-[#fce8cc] p-2 border-2 border-[#d4a373] text-sm font-serif flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#c75438] rounded-full flex-shrink-0" />
                      {blocker}
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}

          {/* Context Roots */}
          {seed.context_roots?.length > 0 && (
            <>
              <hr className="border-t-4 border-dashed border-[#a6754b]" />
              <section>
                <h3 className={`${stardew.fontPixel} text-[#8b5a2b] mb-2`}>Context</h3>
                <div className="space-y-2">
                  {seed.context_roots.map((ctx, i) => (
                    <div key={i} className="bg-[#fce8cc] p-3 border-2 border-[#d4a373]">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-1.5 py-0.5 bg-[#5aa6d1] text-[#fce8cc] text-[10px] font-bold uppercase border border-[#4a2f1e]">
                          {ctx.sourceType}
                        </span>
                        <span className="font-bold text-sm text-[#4a2f1e]">{ctx.title}</span>
                      </div>
                      <p className="text-xs font-serif text-[#4a3525]">{ctx.summary}</p>
                      <p className="text-[10px] text-[#8b5a2b] mt-1 italic">{ctx.relevance}</p>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Suggested Tickets */}
          {seed.suggested_tickets?.length > 0 && (
            <>
              <hr className="border-t-4 border-dashed border-[#a6754b]" />
              <section>
                <h3 className={`${stardew.fontPixel} text-[#8b5a2b] mb-2`}>Suggested Tickets</h3>
                <ul className="space-y-1">
                  {seed.suggested_tickets.map((ticket, i) => (
                    <li key={i} className="bg-[#fce8cc] p-2 border-2 border-[#d4a373] text-sm font-serif flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#5a8043] rounded-full flex-shrink-0" />
                      {ticket}
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}

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
        </div>
      </div>

      <footer className="p-4 border-t-4 border-dashed border-[#a6754b] flex justify-center bg-[#d4a373]">
        <button
          onClick={onBack}
          className={`${stardew.woodButton} px-6 py-2 bg-[#a6754b] flex items-center gap-2`}
        >
          <ArrowLeft size={16} />
          Back to Results
        </button>
      </footer>
    </>
  );
}

// ── Main Dialog ──
export function CreateSeedDialog({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<SeedPriority>("medium");
  const [tags, setTags] = useState<SeedTag[]>([]);
  const [plantType, setPlantType] = useState<PlantType>(getRandomPlantType);
  const [submitting, setSubmitting] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // URL attachments state
  const [urls, setUrls] = useState<Array<{ url: string; title: string; syncToNia: boolean }>>([]);
  const [urlInput, setUrlInput] = useState("");
  const [urlTitleInput, setUrlTitleInput] = useState("");

  // Similar seeds state
  const [similarSeeds, setSimilarSeeds] = useState<Seed[] | null>(null);
  const [viewingSeed, setViewingSeed] = useState<Seed | null>(null);
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
      for (const u of urls) {
        addUrlAttachment(result.seed.id, u.url, u.title, u.syncToNia);
      }
      addSeed({
        ...result.seed,
        attachments: urls.map((u) => ({
          url: u.url,
          title: u.title || u.url,
          type: "url" as const,
          added_at: new Date().toISOString(),
        })),
      });
    }

    onClose();
  };

  const handleSubmit = async () => {
    if (!title.trim() || submitting || searching) return;

    if (confirmed) {
      await doCreate();
      return;
    }

    setSearching(true);
    setError(null);

    const searchQuery = `${title.trim()} ${description.trim()}`.trim();
    const { matches } = await searchSimilarSeeds(projectId, searchQuery);

    setSearching(false);

    if (matches.length > 0) {
      setSimilarSeeds(matches);
    } else {
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
        {/* Viewing a specific seed detail */}
        {viewingSeed ? (
          <SeedDetailView seed={viewingSeed} onBack={() => setViewingSeed(null)} />
        ) : similarSeeds ? (
          <>
            {/* Header */}
            <header
              className={`${stardew.woodPanel} p-4 flex justify-between items-center -m-1 z-10`}
            >
              <h2 className={`${stardew.fontPixel} text-xl`}>Similar Seeds Found</h2>
              <button
                onClick={onClose}
                className="hover:bg-[#a6754b] p-1 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </header>

            {/* Similar seeds list */}
            <div className="p-6 overflow-y-auto flex flex-col gap-4">
              <div className="flex items-start gap-3 bg-[#e8c36a] border-2 border-[#a6754b] p-4">
                <AlertTriangle size={24} className="text-[#8b5a2b] shrink-0 mt-0.5" />
                <div>
                  <p className={`${stardew.fontPixel} text-[#4a2f1e] mb-1`}>
                    Hold on, farmer!
                  </p>
                  <p className="text-sm text-[#6a4427]">
                    We found similar seeds already in this garden. Click one to view it, or plant anyway.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {similarSeeds.map((seed) => {
                  const plant = plantAssetMap[seed.plant_type];
                  return (
                    <button
                      key={seed.id}
                      onClick={() => setViewingSeed(seed)}
                      className="w-full text-left bg-[#fce8cc] border-2 border-[#d4a373] p-4 hover:bg-white transition-colors cursor-pointer flex gap-3 items-start"
                    >
                      <div className="w-12 h-12 bg-[#d4a373] border-2 border-[#a6754b] flex items-center justify-center shrink-0">
                        <img
                          src={plant[seed.status]}
                          alt={seed.title}
                          className="w-10 h-10 object-contain"
                          style={{ imageRendering: "pixelated" }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className={`${stardew.fontPixel} text-[#4a2f1e] mb-1`}>
                          {seed.title}
                        </h4>
                        <p className="text-sm text-[#8b5a2b] line-clamp-2 mb-2">
                          {seed.description || "No description."}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          <span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase border border-[#4a2f1e] flex items-center gap-1 ${
                            seed.status === "compost" ? "bg-[#8b5a2b] text-[#d4a373]" : "bg-[#e8d6b3] text-[#4a2f1e]"
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${getPriorityColor(seed.priority)}`} />
                            {seed.status}
                          </span>
                          {seed.tags?.map((tag) => (
                            <span
                              key={tag}
                              className={`px-1.5 py-0.5 text-[10px] font-bold uppercase border border-[#4a2f1e] ${getTagColor(tag)}`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })}
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

            {/* Footer */}
            <footer className="p-4 border-t-4 border-dashed border-[#a6754b] flex justify-end gap-4 bg-[#d4a373]">
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
            </footer>
          </>
        ) : (
          <>
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

            {/* Footer */}
            <footer className="p-4 border-t-4 border-dashed border-[#a6754b] bg-[#d4a373]">
              <div className="flex flex-col gap-3">
                {/* Attached URLs */}
                {urls.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {urls.map((u, i) => (
                      <div key={i} className="flex items-center gap-1 bg-[#e8d6b3] border border-[#a6754b] px-2 py-1 text-xs">
                        <Link2 size={10} className="text-[#5aa6d1]" />
                        <span className="text-[#4a2f1e] font-bold max-w-[120px] truncate">{u.title || u.url}</span>
                        <button
                          type="button"
                          onClick={() => setUrls((prev) => prev.map((item, j) => j === i ? { ...item, syncToNia: !item.syncToNia } : item))}
                          className={`shrink-0 ${u.syncToNia ? "text-[#7ba65e]" : "text-[#a6754b] opacity-50 hover:opacity-100"}`}
                        >
                          <Brain size={10} />
                        </button>
                        <button type="button" onClick={() => setUrls((prev) => prev.filter((_, j) => j !== i))} className="text-[#c75438] hover:text-red-700">
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* URL input row */}
                <div className="flex gap-2 items-center">
                  <input type="text" value={urlTitleInput} onChange={(e) => setUrlTitleInput(e.target.value)} className="bg-[#e8d6b3] border border-[#a6754b] text-[#4a2f1e] px-2 py-1.5 text-xs w-24 focus:outline-none focus:border-[#8b5a2b]" placeholder="Title" />
                  <input type="url" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} className="bg-[#e8d6b3] border border-[#a6754b] text-[#4a2f1e] px-2 py-1.5 text-xs flex-1 focus:outline-none focus:border-[#8b5a2b]" placeholder="Paste a URL..." />
                  <button
                    type="button"
                    onClick={() => {
                      if (!urlInput.trim()) return;
                      setUrls((prev) => [...prev, { url: urlInput.trim(), title: urlTitleInput.trim(), syncToNia: false }]);
                      setUrlInput(""); setUrlTitleInput("");
                    }}
                    className={`${stardew.woodButton} px-2 py-1 text-xs`}
                  >
                    <Link2 size={12} />
                  </button>
                </div>

                {urls.length > 0 && (
                  <label className="flex items-center gap-1.5 text-[10px] text-[#8b5a2b] cursor-pointer">
                    <input type="checkbox" checked={urls.every((u) => u.syncToNia)} onChange={(e) => setUrls((prev) => prev.map((u) => ({ ...u, syncToNia: e.target.checked })))} className="accent-[#7ba65e]" />
                    <Brain size={10} />
                    Sync to Nia
                  </label>
                )}

                {/* Action buttons */}
                <div className="flex justify-end gap-4">
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
                </div>
              </div>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
