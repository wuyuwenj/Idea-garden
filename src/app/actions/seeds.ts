"use server";

import { insforge } from "@/lib/insforge";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Seed, SeedPriority, SeedTag, PlantType, ContextRoot, SeedComment, CommentType } from "@/types";
import { saveNiaContext, writeVaultSeedPage, searchVault, appendVaultSeedComment } from "@/lib/nia";
import type { VaultSearchMatch } from "@/lib/nia";

async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get("insforge-token")?.value;
}

async function getCurrentUserId() {
  const token = await getAuthToken();
  if (!token) return null;
  insforge.setAccessToken(token);
  const { data } = await insforge.auth.getCurrentUser();
  return data?.user?.id ?? null;
}

export async function getSeeds(projectId: string): Promise<Seed[]> {
  const token = await getAuthToken();
  if (!token) return [];
  insforge.setAccessToken(token);

  const { data, error } = await insforge.database
    .from("seeds")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as Seed[];
}

export type CreateSeedInput = {
  projectId: string;
  title: string;
  description: string;
  priority: SeedPriority;
  tags: SeedTag[];
  plant_type: PlantType;
};

export type SeedActionState = {
  error?: string;
  seed?: Seed;
} | undefined;

export async function createSeed(input: CreateSeedInput): Promise<SeedActionState> {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  // Get project to find team_id
  const { data: project } = await insforge.database
    .from("projects")
    .select("id, team_id, nia_vault_id")
    .eq("id", input.projectId)
    .single();

  if (!project) return { error: "Project not found." };

  const { data, error } = await insforge.database
    .from("seeds")
    .insert({
      team_id: project.team_id,
      project_id: input.projectId,
      title: input.title,
      description: input.description,
      status: "seed",
      priority: input.priority,
      tags: input.tags,
      plant_type: input.plant_type,
      created_by: userId,
      context_roots: [],
      blockers: [],
      related_issue_ids: [],
      is_revived: false,
      suggested_tickets: [],
    })
    .select()
    .single();

  if (error) return { error: error.message };

  const seed = data as Seed;

  // Save context to Nia scoped by project ID (fire-and-forget)
  saveNiaContext({
    title: seed.title,
    summary: (seed.description || seed.title).padEnd(10, " "),
    content: JSON.stringify({
      id: seed.id,
      title: seed.title,
      description: seed.description,
      priority: seed.priority,
      tags: seed.tags,
      status: seed.status,
      project_id: input.projectId,
      created_at: seed.created_at,
    }).padEnd(50, " "),
    tags: ["seed", ...seed.tags],
    agent: `idea-garden:${input.projectId}`,
    workspace: input.projectId,
  }).then((result) => {
    if (result.contextId) {
      insforge.database
        .from("seeds")
        .update({ nia_context_id: result.contextId })
        .eq("id", seed.id);
    }
  });

  // Write seed as a vault page (fire-and-forget)
  if (project.nia_vault_id) {
    writeVaultSeedPage(project.nia_vault_id, {
      id: seed.id,
      title: seed.title,
      description: seed.description,
      priority: seed.priority,
      status: seed.status,
      tags: seed.tags,
      created_at: seed.created_at,
    });
  }

  return { seed };
}

export type UpdateSeedInput = {
  id: string;
  title?: string;
  description?: string;
  status?: Seed["status"];
  priority?: SeedPriority;
  tags?: SeedTag[];
  blockers?: string[];
  related_issue_ids?: string[];
  is_revived?: boolean;
  suggested_tickets?: string[];
  agent_brief?: string;
  context_roots?: ContextRoot[];
  nia_context_id?: string;
};

export async function updateSeed(input: UpdateSeedInput): Promise<SeedActionState> {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const { id, ...updates } = input;

  const { data, error } = await insforge.database
    .from("seeds")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };
  return { seed: data as Seed };
}

export async function deleteSeed(id: string): Promise<{ error?: string }> {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const { error } = await insforge.database
    .from("seeds")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };
  return {};
}

export async function searchSimilarSeeds(
  projectId: string,
  query: string
): Promise<{ matches: Seed[]; error?: string }> {
  const token = await getAuthToken();
  if (!token) return { matches: [] };
  insforge.setAccessToken(token);

  const matchedSeedIds = new Set<string>();
  const matchedSeeds: Seed[] = [];

  // 1. Try Nia vault search
  const { data: project } = await insforge.database
    .from("projects")
    .select("nia_vault_id")
    .eq("id", projectId)
    .single();

  if (project?.nia_vault_id) {
    const { matches: vaultMatches } = await searchVault(project.nia_vault_id, query, 20);

    if (vaultMatches.length > 0) {
      // Extract seed titles from file paths (e.g. /seeds/ai-onboarding-assistant.md → ai onboarding assistant)
      const slugs = vaultMatches.map((m) =>
        m.filePath.replace("/seeds/", "").replace(".md", "").replace(/-/g, " ")
      );

      // Look up actual seeds by matching titles
      for (const slug of slugs) {
        const words = slug.split(" ").filter(Boolean);
        if (words.length === 0) continue;

        // Build ILIKE pattern from slug words
        const pattern = `%${words.join("%")}%`;
        const { data } = await insforge.database
          .from("seeds")
          .select("*")
          .eq("project_id", projectId)
          .ilike("title", pattern)
          .limit(1);

        if (data?.[0] && !matchedSeedIds.has(data[0].id)) {
          matchedSeedIds.add(data[0].id);
          matchedSeeds.push(data[0] as Seed);
        }
      }
    }
  }

  // 2. DB fallback — ILIKE search on title
  if (matchedSeeds.length === 0) {
    const words = query.split(/\s+/).filter((w) => w.length > 3).slice(0, 3);
    for (const word of words) {
      const { data } = await insforge.database
        .from("seeds")
        .select("*")
        .eq("project_id", projectId)
        .ilike("title", `%${word}%`)
        .limit(5);

      for (const row of data ?? []) {
        if (!matchedSeedIds.has(row.id)) {
          matchedSeedIds.add(row.id);
          matchedSeeds.push(row as Seed);
        }
      }
    }
  }

  // Sort by title similarity — more word overlap with query ranks higher
  const queryWords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  const scored = matchedSeeds.map((seed) => {
    const titleWords = seed.title.toLowerCase().split(/\s+/);
    const overlap = queryWords.filter((qw) =>
      titleWords.some((tw) => tw.includes(qw) || qw.includes(tw))
    ).length;
    return { seed, score: overlap };
  });
  scored.sort((a, b) => b.score - a.score);

  return { matches: scored.map((s) => s.seed).slice(0, 5) };
}

// ── Assignee functions (used by AssigneePicker) ──

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  status: "active" | "invited";
};

export async function getTeamMembers(teamSlug: string): Promise<TeamMember[]> {
  const token = await getAuthToken();
  if (!token) return [];
  insforge.setAccessToken(token);

  const { data: team } = await insforge.database
    .from("teams")
    .select("id")
    .eq("slug", teamSlug)
    .single();
  if (!team) return [];

  const { data } = await insforge.database
    .from("team_members")
    .select("user_id, users:user_id(id, name, email)")
    .eq("team_id", team.id);

  if (!data) return [];
  return data.map((m: Record<string, unknown>) => {
    const user = m.users as Record<string, string> | null;
    return {
      id: m.user_id as string,
      name: user?.name ?? "Unknown",
      email: user?.email ?? "",
      status: "active" as const,
    };
  });
}

export async function getSeedAssignees(seedId: string): Promise<string[]> {
  const token = await getAuthToken();
  if (!token) return [];
  insforge.setAccessToken(token);

  const { data } = await insforge.database
    .from("seed_assignees")
    .select("user_id")
    .eq("seed_id", seedId);

  return data?.map((r: { user_id: string }) => r.user_id) ?? [];
}

export async function assignSeed(seedId: string, userId: string) {
  const token = await getAuthToken();
  if (!token) return;
  insforge.setAccessToken(token);

  await insforge.database.from("seed_assignees").insert({
    seed_id: seedId,
    user_id: userId,
  });
}

export async function unassignSeed(seedId: string, userId: string) {
  const token = await getAuthToken();
  if (!token) return;
  insforge.setAccessToken(token);

  await insforge.database
    .from("seed_assignees")
    .delete()
    .eq("seed_id", seedId)
    .eq("user_id", userId);
}

// ── My Garden (personal seeds across teams) ──

export async function getMySeeds(): Promise<{ active: Seed[]; bloomed: Seed[] }> {
  const userId = await getCurrentUserId();
  if (!userId) return { active: [], bloomed: [] };

  const { data } = await insforge.database
    .from("seed_assignees")
    .select("seed:seeds(*)")
    .eq("user_id", userId);

  if (!data) return { active: [], bloomed: [] };

  const seeds = data.map((r: { seed: unknown }) => r.seed as Seed);
  return {
    active: seeds.filter((s) => s.status !== "flower" && s.status !== "compost"),
    bloomed: seeds.filter((s) => s.status === "flower"),
  };
}

// ── Comments ──

export async function getComments(seedId: string): Promise<SeedComment[]> {
  const token = await getAuthToken();
  if (!token) return [];
  insforge.setAccessToken(token);

  const { data, error } = await insforge.database
    .from("seed_comments")
    .select("*")
    .eq("seed_id", seedId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data as SeedComment[];
}

export async function addComment(
  seedId: string,
  content: string,
  commentType: CommentType
): Promise<{ comment?: SeedComment; error?: string }> {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const { data, error } = await insforge.database
    .from("seed_comments")
    .insert({
      seed_id: seedId,
      user_id: userId,
      content,
      comment_type: commentType,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  const comment = data as SeedComment;

  // Get seed + project for vault write
  const { data: seed } = await insforge.database
    .from("seeds")
    .select("title, project_id")
    .eq("id", seedId)
    .single();

  if (seed?.project_id) {
    const { data: project } = await insforge.database
      .from("projects")
      .select("nia_vault_id")
      .eq("id", seed.project_id)
      .single();

    if (project?.nia_vault_id) {
      appendVaultSeedComment(project.nia_vault_id, seed.title, {
        userName: userId.slice(0, 8),
        content,
        commentType,
        date: new Date().toISOString().split("T")[0],
      });
    }
  }

  return { comment };
}

export async function compostSeed(
  seedId: string,
  reason: string
): Promise<{ error?: string }> {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  // Add decision comment first
  await addComment(seedId, reason, "decision");

  // Then compost
  await insforge.database
    .from("seeds")
    .update({ status: "compost", updated_at: new Date().toISOString() })
    .eq("id", seedId);

  return {};
}
