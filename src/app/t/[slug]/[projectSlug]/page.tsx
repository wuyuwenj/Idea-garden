"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useGardenStore } from "@/store";
import { getSeeds } from "@/app/actions/seeds";
import { getProjects } from "@/app/actions/projects";
import { stardew } from "@/lib/stardewTheme";
import { GardenView2D } from "@/components/garden/GardenView2D";
import { BoardView } from "@/components/board";
import { HarvestView } from "@/components/harvest/HarvestView";
import { SeedDetailView } from "@/components/panels/IdeaDetailPanel";
import { CompostView } from "@/components/compost/CompostView";
import { CreateSeedDialog } from "@/components/panels/CreateSeedDialog";
import { Plus, Flower2, Archive } from "lucide-react";

export default function ProjectGardenPage() {
  const params = useParams();
  const teamSlug = params.slug as string;
  const projectSlug = params.projectSlug as string;

  const activeView = useGardenStore((s) => s.activeView);
  const setActiveView = useGardenStore((s) => s.setActiveView);
  const setSeeds = useGardenStore((s) => s.setSeeds);
  const selectedSeedId = useGardenStore((s) => s.selectedSeedId);
  const harvestCount = useGardenStore(
    (s) => s.seeds.filter((sd) => sd.status === "flower").length
  );
  const compostCount = useGardenStore(
    (s) => s.seeds.filter((sd) => sd.status === "compost").length
  );
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const refreshSeeds = useCallback(() => {
    if (!projectId) return;
    getSeeds(projectId).then(setSeeds);
  }, [projectId, setSeeds]);

  useEffect(() => {
    getProjects(teamSlug).then((projects) => {
      const project = projects.find((p) => p.slug === projectSlug);
      if (project) setProjectId(project.id);
    });
  }, [teamSlug, projectSlug]);

  useEffect(() => {
    if (projectId) refreshSeeds();
  }, [projectId, refreshSeeds]);

  // If a seed is selected, show full-page detail view
  if (selectedSeedId) {
    return (
      <div
        className="h-full bg-[#5a8043]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 32px, rgba(0,0,0,0.05) 32px, rgba(0,0,0,0.05) 36px)",
        }}
      >
        <SeedDetailView teamSlug={teamSlug} projectSlug={projectSlug} />
      </div>
    );
  }

  return (
    <div
      className="h-full bg-[#5a8043] flex flex-col"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 32px, rgba(0,0,0,0.05) 32px, rgba(0,0,0,0.05) 36px)",
      }}
    >
      {/* Header bar */}
      <header className={`${stardew.woodPanel} flex justify-between items-center p-3 m-4 mb-0`}>
        <div>
          <h1 className={`${stardew.fontPixel} text-xl text-[#fbf236] drop-shadow-[2px_2px_0_#4a2f1e]`}>
            {projectSlug}
          </h1>
        </div>

        <div className="flex gap-2 items-center">
          {(["garden", "board", "harvest", "compost"] as const).map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`${stardew.woodButton} ${stardew.fontPixel} px-3 py-1.5 text-xs flex items-center gap-1.5 ${
                activeView === view
                  ? "translate-y-1 bg-[#8b5a2b] shadow-none"
                  : ""
              }`}
            >
              {view === "harvest" && <Flower2 size={14} />}
              {view === "compost" && <Archive size={14} />}
              {view}
              {view === "harvest" && harvestCount > 0 && (
                <span className="bg-[#4a2f1e] text-[#fce8cc] px-1.5 py-0.5 rounded text-[10px]">
                  {harvestCount}
                </span>
              )}
              {view === "compost" && compostCount > 0 && (
                <span className="bg-[#4a2f1e] text-[#fce8cc] px-1.5 py-0.5 rounded text-[10px]">
                  {compostCount}
                </span>
              )}
            </button>
          ))}

          <button
            onClick={() => setIsDialogOpen(true)}
            disabled={!projectId}
            className={`${stardew.woodButton} px-3 py-1.5 flex items-center gap-1.5 text-xs bg-[#7ba65e] border-[#364d26] shadow-[inset_2px_2px_0px_#9ec384] disabled:opacity-40`}
          >
            <Plus size={14} /> Plant Seed
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 overflow-auto p-4">
        {activeView === "garden" && <GardenView2D />}
        {activeView === "board" && <BoardView />}
        {activeView === "harvest" && <HarvestView />}
        {activeView === "compost" && <CompostView />}
      </div>

      {/* Modals */}
      {isDialogOpen && projectId && (
        <CreateSeedDialog projectId={projectId} onClose={() => { setIsDialogOpen(false); refreshSeeds(); }} />
      )}
    </div>
  );
}
