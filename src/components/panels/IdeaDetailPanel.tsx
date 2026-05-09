"use client";

import { useCallback, useEffect, useState } from "react";
import { useGardenStore } from "@/store";
import { updateSeed, getComments, addComment, compostSeed } from "@/app/actions/seeds";
import { plantAssetMap } from "@/lib/plantAssets";
import { stardew, getPriorityColor, getTagColor } from "@/lib/stardewTheme";
import { AssigneePicker } from "@/components/panels/AssigneePicker";
import { ArrowLeft, Archive, Save, Send, MessageSquare } from "lucide-react";
import type { SeedStatus, SeedComment, CommentType } from "@/types";

const STAGES: { id: SeedStatus; label: string }[] = [
  { id: "seed", label: "Seed" },
  { id: "sprout", label: "Sprout" },
  { id: "flower", label: "Flower" },
];

const COMMENT_TYPE_STYLES: Record<CommentType, string> = {
  discussion: "bg-[#5aa6d1]",
  status_update: "bg-[#e9c85a] text-[#4a2f1e]",
  decision: "bg-[#c75438]",
};

export function SeedDetailView({ teamSlug, projectSlug }: { teamSlug: string; projectSlug: string }) {
  const selectedSeedId = useGardenStore((s) => s.selectedSeedId);
  const seeds = useGardenStore((s) => s.seeds);
  const selectSeed = useGardenStore((s) => s.selectSeed);
  const updateSeedStatus = useGardenStore((s) => s.updateSeedStatus);

  const [saving, setSaving] = useState(false);
  const [comments, setComments] = useState<SeedComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentType, setCommentType] = useState<CommentType>("discussion");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showCompostDialog, setShowCompostDialog] = useState(false);
  const [compostReason, setCompostReason] = useState("");

  const seed = seeds.find((s) => s.id === selectedSeedId);

  const loadComments = useCallback(() => {
    if (selectedSeedId) {
      getComments(selectedSeedId).then(setComments);
    }
  }, [selectedSeedId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  if (!seed) return null;

  const plant = plantAssetMap[seed.plant_type];
  const isComposted = seed.status === "compost";

  const handleSave = async () => {
    setSaving(true);
    await updateSeed({ id: seed.id, status: seed.status });
    setSaving(false);
    selectSeed(null);
  };

  const handleCompost = async () => {
    if (!compostReason.trim()) return;
    setSaving(true);
    updateSeedStatus(seed.id, "compost");
    await compostSeed(seed.id, compostReason.trim());
    setSaving(false);
    setShowCompostDialog(false);
    setCompostReason("");
    selectSeed(null);
  };

  const handleRevive = async () => {
    updateSeedStatus(seed.id, "seed");
    setSaving(true);
    await updateSeed({ id: seed.id, status: "seed", is_revived: true });
    setSaving(false);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || submittingComment) return;
    setSubmittingComment(true);
    const result = await addComment(seed.id, newComment.trim(), commentType);
    if (result.comment) {
      setComments((prev) => [...prev, result.comment!]);
      setNewComment("");
    }
    setSubmittingComment(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Breadcrumb header */}
      <header className={`${stardew.woodPanel} flex justify-between items-center p-3 m-4 mb-0`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => selectSeed(null)}
            className={`${stardew.woodButton} p-1.5`}
            title="Back to garden"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-2 text-[#e8d6b3] text-sm">
            <span className="opacity-60">{projectSlug}</span>
            <span className="opacity-40">/</span>
            <span className={`${stardew.fontPixel} text-[#fbf236]`}>{seed.title}</span>
          </div>
        </div>

        <div className="flex gap-2">
          {isComposted ? (
            <button
              onClick={handleRevive}
              disabled={saving}
              className={`${stardew.woodButton} px-3 py-1.5 text-xs bg-[#7ba65e] border-[#364d26] disabled:opacity-40`}
            >
              {saving ? "..." : "Revive"}
            </button>
          ) : showCompostDialog ? null : (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className={`${stardew.woodButton} px-3 py-1.5 text-xs bg-[#7ba65e] border-[#364d26] flex items-center gap-1.5 disabled:opacity-40`}
              >
                <Save size={12} />
                {saving ? "..." : "Save"}
              </button>
              <button
                onClick={() => setShowCompostDialog(true)}
                className={`${stardew.woodButton} px-3 py-1.5 text-xs bg-[#8b5a2b] border-[#4a2f1e] flex items-center gap-1.5`}
              >
                <Archive size={12} />
                Compost
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main content - two column like Linear */}
      <div className="flex-1 overflow-auto flex">
        {/* Left - main content (scrollable) */}
        <div className="flex-1 overflow-auto p-6 pl-8">
          {/* Title */}
          <h1 className={`${stardew.fontPixel} text-3xl text-[#fce8cc] drop-shadow-[2px_2px_0_#2a1a0e] mb-2`}>
            {seed.title}
          </h1>

          {/* Tags inline */}
          <div className="flex flex-wrap gap-2 mb-6">
            {seed.tags?.map((tag) => (
              <span key={tag} className={`px-2 py-0.5 border-2 border-[#4a2f1e] text-xs font-bold uppercase ${getTagColor(tag)}`}>
                {tag}
              </span>
            ))}
            {isComposted && (
              <span className="px-2 py-0.5 bg-[#8b5a2b] border-2 border-[#4a2f1e] text-xs font-bold uppercase text-[#d4a373]">
                Composted
              </span>
            )}
            {seed.is_revived && (
              <span className="px-2 py-0.5 bg-[#7ba65e] border-2 border-[#364d26] text-xs font-bold uppercase text-[#fce8cc]">
                Revived
              </span>
            )}
          </div>

          {/* Description */}
          <div className="mb-8">
            <p className="font-serif text-[#fce8cc] text-base leading-relaxed whitespace-pre-wrap">
              {seed.description || "No description yet."}
            </p>
          </div>

          {/* Context Roots */}
          {seed.context_roots?.length > 0 && (
            <div className="mb-8">
              <h3 className={`${stardew.fontPixel} text-[#e8d6b3] mb-3 text-sm`}>Context</h3>
              <div className="space-y-3">
                {seed.context_roots.map((ctx, i) => (
                  <div key={i} className={`${stardew.parchmentPanel} p-4`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-1.5 py-0.5 bg-[#5aa6d1] text-[#fce8cc] text-[10px] font-bold uppercase border border-[#4a2f1e]">
                        {ctx.sourceType}
                      </span>
                      <span className="font-bold text-sm text-[#4a2f1e]">{ctx.title}</span>
                    </div>
                    <p className="text-sm font-serif text-[#4a3525]">{ctx.summary}</p>
                    <p className="text-[10px] text-[#8b5a2b] mt-1 italic">{ctx.relevance}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Blockers */}
          {seed.blockers?.length > 0 && (
            <div className="mb-8">
              <h3 className={`${stardew.fontPixel} text-[#e8d6b3] mb-3 text-sm`}>Blockers</h3>
              <ul className="space-y-2">
                {seed.blockers.map((blocker, i) => (
                  <li key={i} className={`${stardew.parchmentPanel} p-3 text-sm font-serif flex items-center gap-2`}>
                    <span className="w-2 h-2 bg-[#c75438] rounded-full flex-shrink-0" />
                    {blocker}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Compost reason dialog */}
          {showCompostDialog && (
            <div className={`${stardew.parchmentPanel} p-6 border-[#c75438] mb-8`}>
              <h3 className={`${stardew.fontPixel} text-[#c75438] mb-3`}>
                Why are you composting this seed?
              </h3>
              <textarea
                value={compostReason}
                onChange={(e) => setCompostReason(e.target.value)}
                className={`${stardew.parchmentInput} h-24 text-sm mb-3`}
                placeholder="Explain why... This will be saved as institutional knowledge."
                autoFocus
              />
              <div className="flex gap-2">
                <button onClick={() => setShowCompostDialog(false)} className={`${stardew.woodButton} px-4 py-2 text-sm flex-1`}>
                  Cancel
                </button>
                <button
                  onClick={handleCompost}
                  disabled={!compostReason.trim() || saving}
                  className={`${stardew.woodButton} bg-[#c75438] border-[#6b2a1d] px-4 py-2 text-sm flex-1 flex items-center justify-center gap-2 disabled:opacity-40`}
                >
                  <Archive size={14} />
                  {saving ? "..." : "Compost"}
                </button>
              </div>
            </div>
          )}

          {/* Comments */}
          <div>
            <h3 className={`${stardew.fontPixel} text-[#e8d6b3] mb-3 text-sm flex items-center gap-2`}>
              <MessageSquare size={14} />
              Discussion ({comments.length})
            </h3>

            {comments.length > 0 && (
              <div className="space-y-3 mb-4">
                {comments.map((c) => (
                  <div key={c.id} className={`${stardew.parchmentPanel} p-4`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase border border-[#4a2f1e] text-[#fce8cc] ${COMMENT_TYPE_STYLES[c.comment_type as CommentType]}`}>
                        {c.comment_type.replace("_", " ")}
                      </span>
                      <span className="text-[10px] text-[#8b5a2b]">
                        {new Date(c.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm font-serif text-[#4a3525]">{c.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add comment */}
            <div className="space-y-2">
              <div className="flex gap-1">
                {(["discussion", "status_update", "decision"] as CommentType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setCommentType(t)}
                    className={`px-2 py-1 text-[10px] font-bold uppercase border border-[#4a2f1e] transition-all ${
                      commentType === t
                        ? `${COMMENT_TYPE_STYLES[t]} text-[#fce8cc]`
                        : "bg-[#d4a373] text-[#8b5a2b] opacity-60"
                    }`}
                  >
                    {t.replace("_", " ")}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                  className={`${stardew.parchmentInput} flex-1 text-sm`}
                  placeholder="Add a comment..."
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || submittingComment}
                  className={`${stardew.woodButton} px-3 bg-[#7ba65e] border-[#364d26] disabled:opacity-40`}
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar - properties */}
        <div className="w-56 shrink-0 border-l-4 border-[#486334] overflow-auto p-4 space-y-4">
          {/* Plant + Status */}
          <div className="flex flex-col items-center mb-2">
            <div className="w-20 h-20 bg-[#5a8043] border-3 border-[#4a2f1e] shadow-[inset_2px_2px_8px_rgba(0,0,0,0.3)] flex justify-center items-center mb-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={plant[seed.status]}
                alt={plant.label}
                className="w-16 h-16 object-contain"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
            <span className={`${stardew.fontPixel} text-[10px] text-[#e8d6b3]`}>{plant.label}</span>
          </div>

          {/* Growth Stage */}
          <div>
            <h4 className={`${stardew.fontPixel} text-[10px] text-[#a6754b] mb-2`}>Growth Stage</h4>
            <div className="space-y-1">
              {STAGES.map((stage) => (
                <button
                  key={stage.id}
                  onClick={() => updateSeedStatus(seed.id, stage.id)}
                  className={`w-full flex items-center gap-2 p-1.5 border-2 font-bold text-[10px] uppercase transition-all ${
                    seed.status === stage.id
                      ? "bg-[#7ba65e] border-[#364d26] text-white"
                      : "bg-[#4a2f1e]/30 border-[#486334] text-[#c4a882] opacity-60 hover:opacity-80"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={plant[stage.id]} alt={stage.label} className="w-6 h-6 object-contain" style={{ imageRendering: "pixelated" }} />
                  {stage.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <h4 className={`${stardew.fontPixel} text-[10px] text-[#a6754b] mb-2`}>Priority</h4>
            <div className="flex items-center gap-2 text-[#e8d6b3] text-xs font-bold">
              <div className={`w-3 h-3 rounded-full ${getPriorityColor(seed.priority)} border border-black`} />
              <span className="uppercase">{seed.priority}</span>
            </div>
          </div>

          {/* Assignees */}
          {teamSlug && (
            <div>
              <h4 className={`${stardew.fontPixel} text-[10px] text-[#a6754b] mb-2`}>Assignees</h4>
              <AssigneePicker seedId={seed.id} teamSlug={teamSlug} />
            </div>
          )}

          {/* Suggested Tickets */}
          {seed.suggested_tickets?.length > 0 && (
            <div>
              <h4 className={`${stardew.fontPixel} text-[10px] text-[#a6754b] mb-2`}>Suggested Tickets</h4>
              <ul className="space-y-1">
                {seed.suggested_tickets.map((ticket, i) => (
                  <li key={i} className="text-[#e8d6b3] text-xs flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#7ba65e] rounded-full flex-shrink-0 mt-1" />
                    {ticket}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Details */}
          <div>
            <h4 className={`${stardew.fontPixel} text-[10px] text-[#a6754b] mb-2`}>Details</h4>
            <div className="text-[10px] text-[#c4a882] space-y-1">
              <div className="flex justify-between">
                <span>Planted</span>
                <span>{new Date(seed.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Updated</span>
                <span>{new Date(seed.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
