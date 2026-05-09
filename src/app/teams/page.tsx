"use client";

import { useActionState, useEffect, useState } from "react";
import { createTeam, getTeams } from "@/app/actions/team";
import { logout } from "@/app/actions/auth";
import { stardew } from "@/lib/stardewTheme";
import Link from "next/link";
import { Plus, LogOut } from "lucide-react";

export default function TeamsPage() {
  const [teams, setTeams] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [state, action, pending] = useActionState(createTeam, undefined);

  useEffect(() => {
    getTeams().then((t) => setTeams(t as Array<{ id: string; name: string; slug: string }>));
  }, []);

  return (
    <div
      className="min-h-screen bg-[#5a8043] p-8 font-serif"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 32px, rgba(0,0,0,0.05) 32px, rgba(0,0,0,0.05) 36px)",
      }}
    >
      <div className="max-w-2xl mx-auto">
        <header className={`${stardew.woodPanel} flex justify-between items-center p-4 mb-8`}>
          <div>
            <h1
              className={`${stardew.fontPixel} text-3xl text-[#fbf236] drop-shadow-[2px_2px_0_#4a2f1e]`}
            >
              Your Gardens
            </h1>
            <p className="text-[#e8d6b3] text-sm mt-1">
              Choose a garden or start a new one.
            </p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className={`${stardew.woodButton} px-3 py-2 flex items-center gap-2 text-sm`}
            >
              <LogOut size={16} /> Leave
            </button>
          </form>
        </header>

        <div className="grid gap-4">
          {teams.map((team) => (
            <Link
              key={team.id}
              href={`/t/${team.slug}`}
              className={`${stardew.woodPanel} p-6 hover:brightness-110 transition-all block`}
            >
              <h2
                className={`${stardew.fontPixel} text-xl text-[#fbf236] drop-shadow-[1px_1px_0_#4a2f1e]`}
              >
                {team.name}
              </h2>
              <p className="text-[#e8d6b3] text-sm mt-1">/{team.slug}</p>
            </Link>
          ))}

          {teams.length === 0 && !showCreate && (
            <div className={`${stardew.woodPanel} p-6 text-center`}>
              <p className="text-[#e8d6b3] mb-4">
                No gardens yet. Plant your first one!
              </p>
            </div>
          )}

          {showCreate ? (
            <div className={`${stardew.woodPanel} p-6`}>
              <h2
                className={`${stardew.fontPixel} text-lg text-[#fbf236] mb-4`}
              >
                New Garden
              </h2>

              {state?.message && (
                <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-2 rounded mb-4 text-sm">
                  {state.message}
                </div>
              )}

              <form action={action} className="flex gap-3">
                <input
                  name="name"
                  placeholder="Garden name"
                  className="flex-1 px-3 py-2 bg-[#4a2f1e] border-2 border-[#3a1f0e] rounded text-[#fce8cc] placeholder-[#8b6b4a] focus:border-[#fbf236] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={pending}
                  className={`${stardew.woodButton} px-4 py-2 ${stardew.fontPixel} bg-[#7ba65e] border-[#364d26] shadow-[inset_2px_2px_0px_#9ec384] disabled:opacity-50`}
                >
                  {pending ? "Planting..." : "Plant"}
                </button>
              </form>
              {state?.errors?.name && (
                <p className="text-red-300 text-xs mt-2">{state.errors.name}</p>
              )}
            </div>
          ) : null}

          <button
            onClick={() => setShowCreate(true)}
            className={`${stardew.woodButton} w-full py-4 flex items-center justify-center gap-2 ${stardew.fontPixel} text-lg bg-[#7ba65e] border-[#364d26] shadow-[inset_2px_2px_0px_#9ec384]`}
          >
            <Plus size={20} /> New Garden
          </button>
        </div>
      </div>
    </div>
  );
}
