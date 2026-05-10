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
  teamSlug: string,
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

  // Look up team and inviter info
  const { data: team, error: teamError } = await insforge.database
    .from("teams")
    .select("id, name")
    .eq("slug", teamSlug)
    .single();

  if (teamError || !team) {
    return { message: "Team not found." };
  }

  const inviteToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await insforge.database.from("invitations").insert({
    team_id: team.id,
    invited_email: parsed.data.email,
    invited_by: userId,
    token: inviteToken,
    status: "pending",
    expires_at: expiresAt,
  });

  if (error) {
    return { message: error.message };
  }

  // Get inviter's name
  const { data: inviterProfile } = await insforge.auth.getProfile(userId);
  const inviterName = inviterProfile?.profile?.name ?? "Someone";

  // Send invite email
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${inviteToken}`;
  await insforge.emails.send({
    to: parsed.data.email,
    subject: `${inviterName} invited you to join ${team.name} on Seedbase`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 40px;">
          <div style="margin-bottom: 24px;">
            <span style="font-size: 18px; font-weight: 600; color: #111827;">🌱 Seedbase</span>
          </div>
          <h1 style="font-size: 24px; color: #111827; margin: 0 0 12px 0;">
            <strong>${inviterName}</strong> invited you to join <strong>${team.name}</strong> on Seedbase
          </h1>
          <p style="color: #6b7280; font-size: 16px; line-height: 1.5; margin: 0 0 24px 0;">
            Use Seedbase to plant ideas, grow progress, and harvest finished work across your team.
          </p>
          <a href="${inviteUrl}" style="display: inline-block; background: #7ba65e; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 6px;">
            Join your team
          </a>
        </div>
        <p style="color: #9ca3af; font-size: 13px; text-align: center; margin-top: 24px;">
          Seedbase
        </p>
      </div>
    `,
  });

  return {
    success: true,
    message: `Invitation sent to ${parsed.data.email}!`,
  };
}

export async function getInviteDetails(inviteToken: string) {
  const { data: invite, error } = await insforge.database
    .from("invitations")
    .select("*")
    .eq("token", inviteToken)
    .eq("status", "pending")
    .single();

  if (error || !invite) {
    return { error: "Invalid or expired invitation." };
  }

  const { data: team } = await insforge.database
    .from("teams")
    .select("name, slug")
    .eq("id", invite.team_id)
    .single();

  return {
    teamName: team?.name ?? "Unknown Garden",
    teamSlug: team?.slug,
    invitedEmail: invite.invited_email,
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
