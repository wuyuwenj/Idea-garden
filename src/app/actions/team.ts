"use server";

import { insforge } from "@/lib/insforge";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import * as z from "zod";
import crypto from "crypto";

const CreateTeamSchema = z.object({
  name: z.string().min(2, { message: "Team name must be at least 2 characters." }),
});

const InviteSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
});

export type TeamActionState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
} | undefined;

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

export async function createTeam(
  _prevState: TeamActionState,
  formData: FormData
): Promise<TeamActionState> {
  const parsed = CreateTeamSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }

  const slug = parsed.data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const { data: team, error } = await insforge.database
    .from("teams")
    .insert({
      name: parsed.data.name,
      slug,
      created_by: userId,
    })
    .select()
    .single();

  if (error) {
    return { message: error.message };
  }

  // Auto-join creator as team member
  await insforge.database.from("team_members").insert({
    team_id: team.id,
    user_id: userId,
  });

  redirect(`/t/${slug}`);
}

export async function getTeams() {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await insforge.database
    .from("team_members")
    .select("team:teams(*)")
    .eq("user_id", userId);

  if (error) return [];
  return data?.map((tm: { team: unknown }) => tm.team) ?? [];
}

export async function inviteMember(
  teamId: string,
  _prevState: TeamActionState,
  formData: FormData
): Promise<TeamActionState> {
  const parsed = InviteSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }

  const inviteToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await insforge.database.from("invitations").insert({
    team_id: teamId,
    invited_email: parsed.data.email,
    invited_by: userId,
    token: inviteToken,
    status: "pending",
    expires_at: expiresAt,
  });

  if (error) {
    return { message: error.message };
  }

  return {
    success: true,
    message: `Invitation sent! Share this link: ${process.env.NEXT_PUBLIC_APP_URL}/invite/${inviteToken}`,
  };
}

export async function acceptInvite(inviteToken: string) {
  const userId = await getCurrentUserId();

  const { data: invite, error: fetchError } = await insforge.database
    .from("invitations")
    .select("*")
    .eq("token", inviteToken)
    .eq("status", "pending")
    .single();

  if (fetchError || !invite) {
    return { error: "Invalid or expired invitation." };
  }

  if (new Date(invite.expires_at) < new Date()) {
    await insforge.database
      .from("invitations")
      .update({ status: "expired" })
      .eq("id", invite.id);
    return { error: "This invitation has expired." };
  }

  if (!userId) {
    // User needs to sign up or log in first
    return { needsAuth: true, inviteToken };
  }

  // Add user to team
  const { error: joinError } = await insforge.database.from("team_members").insert({
    team_id: invite.team_id,
    user_id: userId,
  });

  if (joinError) {
    return { error: joinError.message };
  }

  // Mark invitation as accepted
  await insforge.database
    .from("invitations")
    .update({ status: "accepted" })
    .eq("id", invite.id);

  // Get team slug for redirect
  const { data: team } = await insforge.database
    .from("teams")
    .select("slug")
    .eq("id", invite.team_id)
    .single();

  return { success: true, teamSlug: team?.slug };
}
