"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useGardenStore } from "@/store";
import { getSeeds } from "@/app/actions/seed";
import { stardew } from "@/lib/stardewTheme";
import { GardenView2D } from "@/components/garden/GardenView2D";
import { BoardView } from "@/components/board";
import { HarvestView } from "@/components/harvest/HarvestView";
import { SeedDetailPanel } from "@/components/panels/IdeaDetailPanel";
import { CreateSeedDialog } from "@/components/panels/CreateSeedDialog";
import { InviteMemberDialog } from "@/components/panels/InviteMemberDialog";
import { Plus, Flower2, UserPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { logout } from "@/app/actions/auth";

export default function TeamGardenPage() {
  const params = useParams();
  const slug = params.slug as string;

  const activeView = useGardenStore((s) => s.activeView);
  const setActiveView = useGardenStore((s) => s.setActiveView);
  const setSeeds = useGardenStore((s) => s.setSeeds);
  const harvestCount = useGardenStore(
    (s) => s.seeds.filter((sd) => sd.status === "blooming").length
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const refreshSeeds = useCallback(() => {
    getSeeds(slug).then(setSeeds);
  }, [slug, setSeeds]);

  useEffect(() => {
    refreshSeeds();
  }, [refreshSeeds]);

  return (
    <div
      className="min-h-screen bg-[#5a8043] p-8 font-serif"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 32px, rgba(0,0,0,0.05) 32px, rgba(0,0,0,0.05) 36px)",
      }}
    >
      {/* HEADER */}
      <header
        className={`${stardew.woodPanel} flex justify-between items-end p-4 mb-8 relative z-10`}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/teams"
            className={`${stardew.woodButton} p-2`}
            title="Back to gardens"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1
              className={`${stardew.fontPixel} text-3xl text-[#fbf236] drop-shadow-[2px_2px_0_#4a2f1e]`}
            >
              {slug}
            </h1>
            <p className="text-[#e8d6b3] text-sm mt-1">
              Plant ideas. Grow progress. Harvest finished work.
            </p>
          </div>
        </div>

        <div className="flex gap-3 items-end">
          {/* TABS */}
          <div className="flex gap-2">
            {(["garden", "board", "harvest"] as const).map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`${stardew.woodButton} ${stardew.fontPixel} px-4 py-2 flex items-center gap-2 ${
                  activeView === view
                    ? "translate-y-2 bg-[#8b5a2b] shadow-none border-b-0 pb-4"
                    : ""
                }`}
              >
                {view === "harvest" && <Flower2 size={16} />}
                {view}
                {view === "harvest" && harvestCount > 0 && (
                  <span className="bg-[#4a2f1e] text-[#fce8cc] px-2 py-0.5 rounded text-xs">
                    {harvestCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsInviteOpen(true)}
            className={`${stardew.woodButton} px-3 py-3 flex items-center gap-2`}
            title="Invite member"
          >
            <UserPlus size={18} />
          </button>

          <button
            onClick={() => setIsDialogOpen(true)}
            className={`${stardew.woodButton} px-4 py-3 flex items-center gap-2 bg-[#7ba65e] border-[#364d26] shadow-[inset_2px_2px_0px_#9ec384]`}
          >
            <Plus size={18} /> Plant Seed
          </button>

          <form action={logout}>
            <button
              type="submit"
              className={`${stardew.woodButton} px-3 py-3 text-sm`}
              title="Sign out"
            >
              Leave
            </button>
          </form>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="relative">
        {activeView === "garden" && <GardenView2D />}
        {activeView === "board" && <BoardView />}
        {activeView === "harvest" && <HarvestView />}
      </main>

      {/* MODALS */}
      {isDialogOpen && (
        <CreateSeedDialog teamSlug={slug} onClose={() => { setIsDialogOpen(false); refreshSeeds(); }} />
      )}
      {isInviteOpen && (
        <InviteMemberDialog
          teamSlug={slug}
          onClose={() => setIsInviteOpen(false)}
        />
      )}
      <SeedDetailPanel />
    </div>
  );
}
