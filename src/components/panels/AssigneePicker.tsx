"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getTeamMembers,
  getSeedAssignees,
  assignSeed,
  unassignSeed,
  type TeamMember,
} from "@/app/actions/seeds";
import { stardew } from "@/lib/stardewTheme";
import { Users, Check } from "lucide-react";

function getInitials(name: string): string {
  return name
    .split(/[\s@]+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const COLORS = [
  "bg-emerald-600", "bg-rose-600", "bg-sky-600", "bg-amber-600",
  "bg-violet-600", "bg-teal-600", "bg-orange-600", "bg-indigo-600",
];

function getColor(id: string): string {
  let hash = 0;
  for (const ch of id) hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0;
  return COLORS[Math.abs(hash) % COLORS.length];
}

interface AssigneePickerProps {
  seedId: string;
  teamSlug: string;
}

export function AssigneePicker({ seedId, teamSlug }: AssigneePickerProps) {
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    const [m, a] = await Promise.all([
      getTeamMembers(teamSlug),
      getSeedAssignees(seedId),
    ]);
    setMembers(m);
    setAssigneeIds(a);
  }, [seedId, teamSlug]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function toggleAssignee(memberId: string) {
    setLoading(true);
    if (assigneeIds.includes(memberId)) {
      await unassignSeed(seedId, memberId);
      setAssigneeIds((prev) => prev.filter((id) => id !== memberId));
    } else {
      await assignSeed(seedId, memberId);
      setAssigneeIds((prev) => [...prev, memberId]);
    }
    setLoading(false);
  }

  const assignedMembers = members.filter(
    (m) => m.status === "active" && assigneeIds.includes(m.id)
  );

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 bg-[#d4a373] border-2 border-[#a6754b] hover:bg-[#c28f5b] transition-colors w-full text-left"
      >
        <Users size={14} className="text-[#8b5a2b]" />
        {assignedMembers.length > 0 ? (
          <div className="flex items-center gap-1 flex-wrap">
            {assignedMembers.map((m) => (
              <span
                key={m.id}
                className={`${getColor(m.id)} text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center`}
                title={m.name}
              >
                {getInitials(m.name)}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-[#8b5a2b] text-sm">No assignee</span>
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-[#fce8cc] border-2 border-[#8b5a2b] shadow-[4px_4px_0_rgba(0,0,0,0.2)] z-50">
          <div className="p-2 border-b border-[#d4a373]">
            <span className={`${stardew.fontPixel} text-xs text-[#8b5a2b]`}>
              Assign to...
            </span>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {/* No assignee option */}
            <button
              onClick={() => {
                // Unassign all
                Promise.all(assigneeIds.map((id) => unassignSeed(seedId, id))).then(() => {
                  setAssigneeIds([]);
                });
              }}
              disabled={loading}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#e8d6b3] transition-colors text-left"
            >
              <span className="w-7 h-7 rounded-full bg-[#d4a373] border border-[#a6754b] flex items-center justify-center">
                <Users size={14} className="text-[#8b5a2b]" />
              </span>
              <span className="text-sm text-[#4a3525] flex-1">No assignee</span>
              {assigneeIds.length === 0 && (
                <Check size={16} className="text-[#7ba65e]" />
              )}
            </button>

            {/* Active members */}
            {members
              .filter((m) => m.status === "active")
              .map((member) => (
                <button
                  key={member.id}
                  onClick={() => toggleAssignee(member.id)}
                  disabled={loading}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#e8d6b3] transition-colors text-left"
                >
                  <span
                    className={`${getColor(member.id)} text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center`}
                  >
                    {getInitials(member.name)}
                  </span>
                  <span className="text-sm text-[#4a3525] flex-1 truncate">
                    {member.name}
                  </span>
                  {assigneeIds.includes(member.id) && (
                    <Check size={16} className="text-[#7ba65e]" />
                  )}
                </button>
              ))}

            {/* Invited members */}
            {members
              .filter((m) => m.status === "invited")
              .map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 px-3 py-2 opacity-50"
                >
                  <span className="w-7 h-7 rounded-full bg-[#d4a373] border border-[#a6754b] flex items-center justify-center text-xs font-bold text-[#8b5a2b]">
                    {getInitials(member.name)}
                  </span>
                  <span className="text-sm text-[#4a3525] flex-1 truncate">
                    {member.name}
                  </span>
                  <span className="text-xs bg-[#e8d6b3] border border-[#d4a373] px-2 py-0.5 rounded text-[#8b5a2b]">
                    Invited
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
