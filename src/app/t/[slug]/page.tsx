"use client";

import { stardew } from "@/lib/stardewTheme";
import { Sprout } from "lucide-react";

export default function TeamPage() {
  return (
    <div
      className="h-full bg-[#5a8043] flex items-center justify-center"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 32px, rgba(0,0,0,0.05) 32px, rgba(0,0,0,0.05) 36px)",
      }}
    >
      <div className="text-center">
        <Sprout size={64} className="mx-auto mb-4 text-[#e8d6b3] opacity-40" />
        <h2 className={`${stardew.fontPixel} text-2xl text-[#fce8cc] mb-2`}>
          Select a Garden
        </h2>
        <p className="text-[#c4dba8] text-sm">
          Pick a garden from the sidebar, or create a new one.
        </p>
      </div>
    </div>
  );
}
