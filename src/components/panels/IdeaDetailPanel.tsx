"use client";

import { useState } from "react";
import { useGardenStore } from "@/store";
import { updateIssueStatus as saveStatus } from "@/app/actions/seed";
import { plantAssetMap } from "@/lib/plantAssets";
import { stardew, getPriorityColor, getTagColor } from "@/lib/stardewTheme";
import { AssigneePicker } from "@/components/panels/AssigneePicker";
import { X, Archive, Save } from "lucide-react";
import type { IssueStatus } from "@/types";

const STAGES: { id: IssueStatus; label: string }[] = [
  { id: "seed", label: "Seed" },
  { id: "sprout", label: "Sprout" },
  { id: "flower", label: "Flower" },
];

export function IssueDetailPanel({ teamSlug }: { teamSlug?: string }) {
  const selectedIssueId = useGardenStore((s) => s.selectedIssueId);
  const issues = useGardenStore((s) => s.issues);
  const sidebarOpen = useGardenStore((s) => s.sidebarOpen);
  const selectIssue = useGardenStore((s) => s.selectIssue);
  const updateIssueStatus = useGardenStore((s) => s.updateIssueStatus);

  const [saving, setSaving] = useState(false);

  const issue = issues.find((i) => i.id === selectedIssueId);

  if (!sidebarOpen || !issue) return null;

  const plant = plantAssetMap[issue.plantType];
  const isComposted = issue.status === "compost";

  const handleSave = async () => {
    setSaving(true);
    await saveStatus(issue.id, issue.status);
    setSaving(false);
  };

  const handleCompost = async () => {
    updateIssueStatus(issue.id, "compost");
    setSaving(true);
    await saveStatus(issue.id, "compost");
    setSaving(false);
    selectIssue(null);
  };

  const handleRevive = async () => {
    updateIssueStatus(issue.id, "seed");
    setSaving(true);
    await saveStatus(issue.id, "seed");
    setSaving(false);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[400px] z-50 shadow-[-12px_0px_0px_rgba(0,0,0,0.3)] flex flex-col">
      <div className={`${stardew.parchmentPanel} h-full flex flex-col`}>
        {/* Close button */}
        <button
          onClick={() => selectIssue(null)}
          className={`absolute -left-12 top-4 ${stardew.woodButton} p-2 bg-[#c75438] border-[#6b2a1d]`}
        >
          <X size={24} />
        </button>

        {/* Header with plant portrait */}
        <header className="p-6 bg-[#d4a373] border-b-4 border-[#8b5a2b] flex flex-col items-center">
          <div className="w-32 h-32 bg-[#5a8043] border-4 border-[#4a2f1e] shadow-[inset_4px_4px_12px_rgba(0,0,0,0.4),_4px_4px_0_rgba(0,0,0,0.1)] flex justify-center items-center mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={plant[issue.status]}
              alt={plant.label}
              className="w-24 h-24 object-contain"
              style={{ imageRendering: "pixelated" }}
            />
          </div>

          <h2
            className={`${stardew.fontPixel} text-2xl text-center mb-4`}
          >
            {issue.title}
          </h2>

          <div className="flex flex-wrap gap-2 justify-center">
            <span className="px-2 py-1 bg-[#e8d6b3] border-2 border-[#8b5a2b] text-xs font-bold uppercase flex items-center gap-1">
              <div
                className={`w-2 h-2 rounded-full ${getPriorityColor(issue.priority)} border border-black`}
              />
              {issue.priority}
            </span>
            <span className="px-2 py-1 bg-[#e8d6b3] border-2 border-[#8b5a2b] text-xs font-bold uppercase">
              {plant.label}
            </span>
            {issue.tags.map((tag) => (
              <span
                key={tag}
                className={`px-2 py-1 border-2 border-[#4a2f1e] text-xs font-bold uppercase ${getTagColor(tag)}`}
              >
                {tag}
              </span>
            ))}
            {isComposted && (
              <span className="px-2 py-1 bg-[#8b5a2b] border-2 border-[#4a2f1e] text-xs font-bold uppercase text-[#d4a373]">
                Composted
              </span>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="p-6 flex-grow overflow-y-auto flex flex-col gap-6">
          <section>
            <h3 className={`${stardew.fontPixel} text-[#8b5a2b] mb-2`}>
              Description
            </h3>
            <p className="bg-[#fce8cc] p-3 border-2 border-[#d4a373] min-h-[80px] font-serif">
              {issue.description || "No description yet."}
            </p>
          </section>

          {teamSlug && (
            <>
              <hr className="border-t-4 border-dashed border-[#a6754b]" />
              <section>
                <h3 className={`${stardew.fontPixel} text-[#8b5a2b] mb-2`}>
                  Assignees
                </h3>
                <AssigneePicker seedId={issue.id} teamSlug={teamSlug} />
              </section>
            </>
          )}

          <hr className="border-t-4 border-dashed border-[#a6754b]" />

          <section>
            <h3 className={`${stardew.fontPixel} text-[#8b5a2b] mb-2`}>
              Growth Stage
            </h3>
            <div className="flex justify-between gap-2">
              {STAGES.map((stage) => (
                <button
                  key={stage.id}
                  onClick={() => updateIssueStatus(issue.id, stage.id)}
                  className={`flex-1 flex flex-col items-center py-2 border-2 font-bold text-xs uppercase transition-all ${
                    issue.status === stage.id
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

          {/* Blockers */}
          {issue.blockers.length > 0 && (
            <>
              <hr className="border-t-4 border-dashed border-[#a6754b]" />
              <section>
                <h3 className={`${stardew.fontPixel} text-[#8b5a2b] mb-2`}>
                  Blockers
                </h3>
                <ul className="space-y-1">
                  {issue.blockers.map((blocker, i) => (
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
          {issue.contextRoots.length > 0 && (
            <>
              <hr className="border-t-4 border-dashed border-[#a6754b]" />
              <section>
                <h3 className={`${stardew.fontPixel} text-[#8b5a2b] mb-2`}>
                  Context
                </h3>
                <div className="space-y-2">
                  {issue.contextRoots.map((ctx, i) => (
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
          {issue.suggestedTickets.length > 0 && (
            <>
              <hr className="border-t-4 border-dashed border-[#a6754b]" />
              <section>
                <h3 className={`${stardew.fontPixel} text-[#8b5a2b] mb-2`}>
                  Suggested Tickets
                </h3>
                <ul className="space-y-1">
                  {issue.suggestedTickets.map((ticket, i) => (
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
              <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Updated:</span>
              <span>{new Date(issue.updatedAt).toLocaleDateString()}</span>
            </div>
            {issue.isRevived && (
              <div className="flex justify-between">
                <span>Revived:</span>
                <span className="text-[#5a8043]">Yes</span>
              </div>
            )}
          </section>

          {isComposted ? (
            <button
              onClick={handleRevive}
              disabled={saving}
              className={`${stardew.woodButton} bg-[#7ba65e] border-[#364d26] mt-auto py-3 disabled:opacity-40`}
            >
              {saving ? "Saving..." : "Revive from Compost"}
            </button>
          ) : (
            <div className="flex gap-3 mt-auto">
              <button
                onClick={handleSave}
                disabled={saving}
                className={`${stardew.woodButton} bg-[#7ba65e] border-[#364d26] py-3 flex-1 flex items-center justify-center gap-2 disabled:opacity-40`}
              >
                <Save size={16} />
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={handleCompost}
                disabled={saving}
                className={`${stardew.woodButton} bg-[#8b5a2b] border-[#4a2f1e] py-3 flex items-center justify-center gap-2 px-4 disabled:opacity-40`}
              >
                <Archive size={16} />
                Compost
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
