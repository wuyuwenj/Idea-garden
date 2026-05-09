"use server";

import { insforge } from "@/lib/insforge";
import { cookies } from "next/headers";
import type { GardenIssue } from "@/types";

async function initAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("insforge-token")?.value;
  if (!token) return null;
  insforge.setAccessToken(token);
  const { data } = await insforge.auth.getCurrentUser();
  return data?.user?.id ?? null;
}

async function getTeamIdFromSlug(slug: string): Promise<string | null> {
  const { data } = await insforge.database
    .from("teams")
    .select("id")
    .eq("slug", slug)
    .single();
  return data?.id ?? null;
}

function rowToIssue(row: Record<string, unknown>): GardenIssue {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) ?? "",
    status: row.status as GardenIssue["status"],
    priority: row.priority as GardenIssue["priority"],
    tags: (row.tags as GardenIssue["tags"]) ?? [],
    plantType: row.plant_type as GardenIssue["plantType"],
    blockers: (row.blockers as string[]) ?? [],
    relatedIssueIds: (row.related_issue_ids as string[]) ?? [],
    isRevived: (row.is_revived as boolean) ?? false,
    niaContextId: row.nia_context_id as string | undefined,
    contextRoots: (row.context_roots as GardenIssue["contextRoots"]) ?? [],
    suggestedTickets: (row.suggested_tickets as string[]) ?? [],
    agentBrief: row.agent_brief as string | undefined,
    createdAt: new Date(row.created_at as string).getTime(),
    updatedAt: new Date(row.updated_at as string).getTime(),
  };
}

export async function getIssues(teamSlug: string): Promise<GardenIssue[]> {
  const userId = await initAuth();
  if (!userId) return [];

  const teamId = await getTeamIdFromSlug(teamSlug);
  if (!teamId) return [];

  const { data, error } = await insforge.database
    .from("seeds")
    .select("*")
    .eq("team_id", teamId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row: Record<string, unknown>) => rowToIssue(row));
}

export async function createIssue(
  teamSlug: string,
  issue: { title: string; description: string; priority: string; plantType: string; tags: string[] }
) {
  const userId = await initAuth();
  if (!userId) return { error: "Not authenticated" };

  const teamId = await getTeamIdFromSlug(teamSlug);
  if (!teamId) return { error: "Team not found" };

  const { data, error } = await insforge.database
    .from("seeds")
    .insert({
      team_id: teamId,
      title: issue.title,
      description: issue.description,
      status: "seed",
      priority: issue.priority,
      plant_type: issue.plantType,
      tags: issue.tags,
      created_by: userId,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  return { issue: rowToIssue(data) };
}

export async function updateIssueStatus(issueId: string, status: string) {
  const userId = await initAuth();
  if (!userId) return { error: "Not authenticated" };

  const { error } = await insforge.database
    .from("seeds")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", issueId);

  if (error) return { error: error.message };
  return { success: true };
}

// ── Assignees ──

export async function getSeedAssignees(seedId: string): Promise<string[]> {
  const userId = await initAuth();
  if (!userId) return [];

  const { data, error } = await insforge.database
    .from("seed_assignees")
    .select("user_id")
    .eq("seed_id", seedId);

  if (error || !data) return [];
  return data.map((row: { user_id: string }) => row.user_id);
}

export async function assignSeed(seedId: string, assigneeId: string) {
  const userId = await initAuth();
  if (!userId) return { error: "Not authenticated" };

  const { error } = await insforge.database
    .from("seed_assignees")
    .insert({ seed_id: seedId, user_id: assigneeId });

  if (error) return { error: error.message };
  return { success: true };
}

export async function unassignSeed(seedId: string, assigneeId: string) {
  const userId = await initAuth();
  if (!userId) return { error: "Not authenticated" };

  const { error } = await insforge.database
    .from("seed_assignees")
    .delete()
    .eq("seed_id", seedId)
    .eq("user_id", assigneeId);

  if (error) return { error: error.message };
  return { success: true };
}

// ── Team Members ──

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  status: "active" | "invited";
};

export async function getTeamMembers(teamSlug: string): Promise<TeamMember[]> {
  const userId = await initAuth();
  if (!userId) return [];

  const teamId = await getTeamIdFromSlug(teamSlug);
  if (!teamId) return [];

  const { data: members } = await insforge.database
    .from("team_members")
    .select("user_id")
    .eq("team_id", teamId);

  const activeMembers: TeamMember[] = [];
  if (members) {
    for (const m of members) {
      const { data: profile } = await insforge.auth.getProfile(m.user_id);
      activeMembers.push({
        id: m.user_id,
        name: profile?.profile?.name ?? m.user_id.slice(0, 8),
        email: "",
        status: "active",
      });
    }
  }

  const { data: invites } = await insforge.database
    .from("invitations")
    .select("invited_email")
    .eq("team_id", teamId)
    .eq("status", "pending");

  const seenEmails = new Set<string>();
  const invitedMembers: TeamMember[] = [];
  for (const inv of invites ?? []) {
    const email = (inv as { invited_email: string }).invited_email;
    if (seenEmails.has(email)) continue;
    seenEmails.add(email);
    invitedMembers.push({
      id: `invite-${email}`,
      name: email,
      email,
      status: "invited",
    });
  }

  return [...activeMembers, ...invitedMembers];
}

// ── Personal Garden ──

export async function getMySeeds(): Promise<{ active: GardenIssue[]; bloomed: GardenIssue[] }> {
  const userId = await initAuth();
  if (!userId) return { active: [], bloomed: [] };

  const { data: assignments, error: assignError } = await insforge.database
    .from("seed_assignees")
    .select("seed_id")
    .eq("user_id", userId);

  if (assignError || !assignments || assignments.length === 0) {
    return { active: [], bloomed: [] };
  }

  const seedIds = assignments.map((a: { seed_id: string }) => a.seed_id);

  const { data: seeds, error } = await insforge.database
    .from("seeds")
    .select("*")
    .in("id", seedIds)
    .order("updated_at", { ascending: false });

  if (error || !seeds) return { active: [], bloomed: [] };

  const mapped = seeds.map((row: Record<string, unknown>) => rowToIssue(row));
  return {
    active: mapped.filter((s: GardenIssue) => s.status === "seed" || s.status === "sprout"),
    bloomed: mapped.filter((s: GardenIssue) => s.status === "flower"),
  };
}

export async function deleteIssue(issueId: string) {
  const userId = await initAuth();
  if (!userId) return { error: "Not authenticated" };

  const { error } = await insforge.database
    .from("seeds")
    .delete()
    .eq("id", issueId);

  if (error) return { error: error.message };
  return { success: true };
}
