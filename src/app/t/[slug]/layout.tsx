"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { checkAuth, logout } from "@/app/actions/auth";
import { getTeams, createTeam } from "@/app/actions/team";
import { getProjects, createProject } from "@/app/actions/projects";
import { stardew } from "@/lib/stardewTheme";
import { Sprout, Plus, ChevronDown, UserPlus, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { InviteMemberDialog } from "@/components/panels/InviteMemberDialog";
import type { Project } from "@/types";

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const teamSlug = params.slug as string;

  const [teams, setTeams] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamPickerOpen, setTeamPickerOpen] = useState(false);
  const [newGardenName, setNewGardenName] = useState("");
  const [creating, setCreating] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [showNewInput, setShowNewInput] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNewTeam, setShowNewTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [creatingTeam, setCreatingTeam] = useState(false);

  const currentTeam = teams.find((t) => t.slug === teamSlug);
  const currentProjectSlug = pathname.split("/").at(-1);
  const isOnProjectPage = pathname.split("/").length > 3;

  const refreshProjects = useCallback(() => {
    getProjects(teamSlug).then((p) => {
      setProjects(p);
      // Auto-navigate to first garden if on team page
      if (p.length > 0 && !isOnProjectPage) {
        router.replace(`/t/${teamSlug}/${p[0].slug}`);
      }
    });
  }, [teamSlug, isOnProjectPage, router]);

  useEffect(() => {
    checkAuth().then((valid) => {
      if (!valid) { router.push("/login"); return; }
      getTeams().then((t) => setTeams(t as { id: string; name: string; slug: string }[]));
      refreshProjects();
    });
  }, [teamSlug, router, refreshProjects]);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim() || creatingTeam) return;
    setCreatingTeam(true);
    const formData = new FormData();
    formData.set("name", newTeamName.trim());
    const result = await createTeam(undefined, formData);
    // createTeam redirects on success, so we only get here on error
    if (result?.message) {
      setCreatingTeam(false);
    }
  };

  const handleCreateGarden = async () => {
    if (!newGardenName.trim() || creating) return;
    setCreating(true);
    const result = await createProject(teamSlug, newGardenName.trim());
    if (result?.project) {
      setProjects((prev) => [result.project!, ...prev]);
      setNewGardenName("");
      setShowNewInput(false);
      router.push(`/t/${teamSlug}/${result.project.slug}`);
    }
    setCreating(false);
  };

  return (
    <div className="flex h-screen font-serif relative">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-60" : "w-0 overflow-hidden"} bg-[#4a2f1e] border-r-4 border-[#2a1a0e] flex flex-col shrink-0 transition-all duration-200`}>
        {/* Team picker */}
        <div className="relative">
          <button
            onClick={() => setTeamPickerOpen(!teamPickerOpen)}
            className="w-full p-4 flex items-center justify-between text-[#fce8cc] hover:bg-[#5a3d2b] transition-colors"
          >
            <span className={`${stardew.fontPixel} text-sm truncate`}>
              {currentTeam?.name || teamSlug}
            </span>
            <ChevronDown size={16} className={`transition-transform ${teamPickerOpen ? "rotate-180" : ""}`} />
          </button>
          {teamPickerOpen && (
            <div className="absolute top-full left-0 w-full bg-[#5a3d2b] border-b-2 border-[#2a1a0e] z-50">
              {teams.map((t) => (
                <Link
                  key={t.id}
                  href={`/t/${t.slug}`}
                  onClick={() => setTeamPickerOpen(false)}
                  className={`block px-4 py-3 text-[#fce8cc] text-sm hover:bg-[#6a4d3b] transition-colors ${
                    t.slug === teamSlug ? "bg-[#6a4d3b]" : ""
                  }`}
                >
                  {t.name}
                </Link>
              ))}
              <div className="border-t border-[#4a2f1e]">
                {showNewTeam ? (
                  <div className="p-2 flex gap-1">
                    <input
                      type="text"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleCreateTeam()}
                      className="bg-[#4a2f1e] border border-[#6a4d3b] text-[#fce8cc] text-xs p-1.5 w-full focus:outline-none placeholder-[#7a5a3b]"
                      placeholder="Team name..."
                      autoFocus
                    />
                    <button
                      onClick={handleCreateTeam}
                      disabled={!newTeamName.trim() || creatingTeam}
                      className="bg-[#7ba65e] border border-[#364d26] text-[#fce8cc] px-2 text-xs disabled:opacity-40"
                    >
                      {creatingTeam ? "..." : "+"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowNewTeam(true)}
                    className="w-full px-4 py-3 text-[#a6754b] text-sm hover:bg-[#6a4d3b] hover:text-[#fce8cc] transition-colors flex items-center gap-2"
                  >
                    <Plus size={14} /> New Team
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-[#5a3d2b]" />

        {/* Gardens label */}
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <span className={`${stardew.fontPixel} text-[10px] text-[#a6754b]`}>
            Gardens
          </span>
          <button
            onClick={() => setShowNewInput(!showNewInput)}
            className="text-[#a6754b] hover:text-[#fce8cc] transition-colors"
            title="New garden"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* New garden input */}
        {showNewInput && (
          <div className="px-3 pb-2">
            <div className="flex gap-1">
              <input
                type="text"
                value={newGardenName}
                onChange={(e) => setNewGardenName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateGarden()}
                className="bg-[#5a3d2b] border border-[#6a4d3b] text-[#fce8cc] text-xs p-1.5 w-full focus:outline-none focus:border-[#a6754b] placeholder-[#7a5a3b]"
                placeholder="Garden name..."
                autoFocus
              />
              <button
                onClick={handleCreateGarden}
                disabled={!newGardenName.trim() || creating}
                className="bg-[#7ba65e] border border-[#364d26] text-[#fce8cc] px-2 text-xs disabled:opacity-40"
              >
                {creating ? "..." : "+"}
              </button>
            </div>
          </div>
        )}

        {/* Garden list */}
        <nav className="flex-1 overflow-y-auto px-2">
          {projects.map((project) => {
            const isActive = isOnProjectPage && currentProjectSlug === project.slug;
            return (
              <Link
                key={project.id}
                href={`/t/${teamSlug}/${project.slug}`}
                className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors mb-0.5 ${
                  isActive
                    ? "bg-[#6a4d3b] text-[#fce8cc]"
                    : "text-[#c4a882] hover:bg-[#5a3d2b] hover:text-[#fce8cc]"
                }`}
              >
                <Sprout size={14} />
                <span className="truncate">{project.name}</span>
              </Link>
            );
          })}
          {projects.length === 0 && (
            <p className="text-[#7a5a3b] text-xs px-3 py-4 text-center">
              No gardens yet
            </p>
          )}
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-[#5a3d2b] p-2 space-y-1">
          <button
            onClick={() => setIsInviteOpen(true)}
            className="flex items-center gap-2 w-full px-3 py-2 text-[#c4a882] text-sm hover:bg-[#5a3d2b] hover:text-[#fce8cc] rounded transition-colors"
          >
            <UserPlus size={14} />
            Invite member
          </button>
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-2 w-full px-3 py-2 text-[#c4a882] text-sm hover:bg-[#5a3d2b] hover:text-[#fce8cc] rounded transition-colors"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-1/2 -translate-y-1/2 z-40 bg-[#4a2f1e] border-2 border-[#2a1a0e] text-[#c4a882] hover:text-[#fce8cc] p-1.5 rounded-r transition-all"
        style={{ left: sidebarOpen ? "236px" : "0px" }}
        title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
      >
        {sidebarOpen ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
      </button>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

      {/* Modals */}
      {isInviteOpen && (
        <InviteMemberDialog teamSlug={teamSlug} onClose={() => setIsInviteOpen(false)} />
      )}
    </div>
  );
}
