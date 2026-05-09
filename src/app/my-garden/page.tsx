"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMySeeds } from "@/app/actions/seeds";
import { checkAuth } from "@/app/actions/auth";
import { plantAssetMap } from "@/lib/plantAssets";
import { stardew, getPriorityColor } from "@/lib/stardewTheme";
import { ArrowLeft, Sprout, Flower2 } from "lucide-react";
import Link from "next/link";
import type { Seed as GardenIssue } from "@/types";

export default function MyGardenPage() {
  const router = useRouter();
  const [active, setActive] = useState<GardenIssue[]>([]);
  const [bloomed, setBloomed] = useState<GardenIssue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth().then((valid) => {
      if (!valid) { router.push("/login"); return; }
      getMySeeds().then(({ active, bloomed }) => {
        setActive(active);
        setBloomed(bloomed);
        setLoading(false);
      });
    });
  }, [router]);

  return (
    <div
      className="min-h-screen bg-[#5a8043] p-8 font-serif"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 32px, rgba(0,0,0,0.05) 32px, rgba(0,0,0,0.05) 36px)",
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className={`${stardew.woodPanel} flex justify-between items-center p-4 mb-8`}>
          <div className="flex items-center gap-4">
            <Link href="/teams" className={`${stardew.woodButton} p-2`}>
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className={`${stardew.fontPixel} text-3xl text-[#fbf236] drop-shadow-[2px_2px_0_#4a2f1e]`}>
                My Garden
              </h1>
              <p className="text-[#e8d6b3] text-sm mt-1">
                Your personal plot across all teams
              </p>
            </div>
          </div>
        </header>

        {loading ? (
          <div className={`${stardew.woodPanel} p-8 text-center`}>
            <p className="text-[#e8d6b3]">Loading your garden...</p>
          </div>
        ) : (
          <>
            {/* Active Plot */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Sprout size={24} className="text-[#fbf236]" />
                <h2 className={`${stardew.fontPixel} text-xl text-[#fbf236] drop-shadow-[1px_1px_0_#2a4a1e]`}>
                  Active Plot
                </h2>
                <span className="bg-[#4a2f1e] text-[#fce8cc] px-2 py-0.5 rounded text-xs font-bold">
                  {active.length}
                </span>
              </div>

              {active.length === 0 ? (
                <div className={`${stardew.woodPanel} p-6 text-center`}>
                  <p className="text-[#e8d6b3]">
                    No seeds assigned to you yet. Ask a teammate to assign you some work!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {active.map((issue) => (
                    <SeedCard key={issue.id} issue={issue} />
                  ))}
                </div>
              )}
            </section>

            {/* Flower Collection */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Flower2 size={24} className="text-[#fbf236]" />
                <h2 className={`${stardew.fontPixel} text-xl text-[#fbf236] drop-shadow-[1px_1px_0_#2a4a1e]`}>
                  Flower Collection
                </h2>
                <span className="bg-[#4a2f1e] text-[#fce8cc] px-2 py-0.5 rounded text-xs font-bold">
                  {bloomed.length}
                </span>
              </div>

              {bloomed.length === 0 ? (
                <div className={`${stardew.woodPanel} p-6 text-center`}>
                  <p className="text-[#e8d6b3]">
                    No flowers yet. Grow your seeds to blooming to collect them here!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {bloomed.map((issue) => (
                    <FlowerCard key={issue.id} issue={issue} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function SeedCard({ issue }: { issue: GardenIssue }) {
  const plant = plantAssetMap[issue.plant_type];

  return (
    <div className={`${stardew.woodPanel} p-4 flex flex-col items-center gap-2`}>
      <div className="w-16 h-16 bg-[#5a8043] border-2 border-[#4a2f1e] shadow-[inset_2px_2px_6px_rgba(0,0,0,0.3)] flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={plant[issue.status]}
          alt={plant.label}
          className="w-12 h-12 object-contain"
          style={{ imageRendering: "pixelated" }}
        />
      </div>
      <h3 className={`${stardew.fontPixel} text-xs text-center text-[#fbf236] truncate w-full`}>
        {issue.title}
      </h3>
      <div className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${getPriorityColor(issue.priority)} border border-black`} />
        <span className="text-[#e8d6b3] text-xs capitalize">{issue.status}</span>
      </div>
    </div>
  );
}

function FlowerCard({ issue }: { issue: GardenIssue }) {
  const plant = plantAssetMap[issue.plant_type];

  return (
    <div className={`${stardew.woodPanel} p-3 flex flex-col items-center gap-2 hover:brightness-110 transition-all`}>
      <div className="w-14 h-14 bg-[#5a8043] border-2 border-[#364d26] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),0_0_8px_rgba(251,242,54,0.3)] flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={plant.flower}
          alt={plant.label}
          className="w-10 h-10 object-contain"
          style={{ imageRendering: "pixelated" }}
        />
      </div>
      <h3 className={`${stardew.fontPixel} text-[10px] text-center text-[#fbf236] truncate w-full`}>
        {issue.title}
      </h3>
      <span className="text-[#e8d6b3] text-[10px]">{plant.label}</span>
    </div>
  );
}
