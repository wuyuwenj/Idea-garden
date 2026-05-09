"use server";

import { insforge } from "@/lib/insforge";
import { cookies } from "next/headers";
import type { Seed } from "@/types";

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

export async function getSeeds(teamSlug: string): Promise<Seed[]> {
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

  return data.map((row: Record<string, unknown>) => ({
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) ?? "",
    status: row.status as Seed["status"],
    priority: row.priority as Seed["priority"],
    plantType: row.plant_type as Seed["plantType"],
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }));
}

export async function createSeed(
  teamSlug: string,
  seed: { title: string; description: string; priority: string; plantType: string }
) {
  const userId = await initAuth();
  if (!userId) return { error: "Not authenticated" };

  const teamId = await getTeamIdFromSlug(teamSlug);
  if (!teamId) return { error: "Team not found" };

  const { data, error } = await insforge.database
    .from("seeds")
    .insert({
      team_id: teamId,
      title: seed.title,
      description: seed.description,
      status: "seed",
      priority: seed.priority,
      plant_type: seed.plantType,
      created_by: userId,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  return {
    seed: {
      id: data.id,
      title: data.title,
      description: data.description ?? "",
      status: data.status,
      priority: data.priority,
      plantType: data.plant_type,
      created_at: data.created_at,
      updated_at: data.updated_at,
    } as Seed,
  };
}

export async function updateSeedStatus(seedId: string, status: string) {
  const userId = await initAuth();
  if (!userId) return { error: "Not authenticated" };

  const { error } = await insforge.database
    .from("seeds")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", seedId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteSeed(seedId: string) {
  const userId = await initAuth();
  if (!userId) return { error: "Not authenticated" };

  const { error } = await insforge.database
    .from("seeds")
    .delete()
    .eq("id", seedId);

  if (error) return { error: error.message };
  return { success: true };
}
