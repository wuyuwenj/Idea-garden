"use server";

import { insforge } from "@/lib/insforge";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createVault } from "@/lib/nia";
import type { Project } from "@/types";

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

export async function getProjects(teamSlug: string): Promise<Project[]> {
  const token = await getAuthToken();
  if (!token) return [];
  insforge.setAccessToken(token);

  const { data: team } = await insforge.database
    .from("teams")
    .select("id")
    .eq("slug", teamSlug)
    .single();

  if (!team) return [];

  const { data, error } = await insforge.database
    .from("projects")
    .select("*")
    .eq("team_id", team.id)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as Project[];
}

export type ProjectActionState = {
  error?: string;
  project?: Project;
} | undefined;

export async function createProject(
  teamSlug: string,
  name: string
): Promise<ProjectActionState> {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const { data: team } = await insforge.database
    .from("teams")
    .select("id")
    .eq("slug", teamSlug)
    .single();

  if (!team) return { error: "Team not found." };

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const { data, error } = await insforge.database
    .from("projects")
    .insert({
      team_id: team.id,
      name,
      slug,
      created_by: userId,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  const project = data as Project;

  // Create a Nia vault for this project
  const vaultResult = await createVault(
    name,
    `Idea Garden knowledge base for project: ${name}`
  );
  if (vaultResult.vaultId) {
    await insforge.database
      .from("projects")
      .update({ nia_vault_id: vaultResult.vaultId })
      .eq("id", project.id);
    project.nia_vault_id = vaultResult.vaultId;
  }

  return { project };
}
