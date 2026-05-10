"use server";

import { insforge } from "@/lib/insforge";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export interface ChatMessage {
  id: string;
  project_id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

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

export async function getChatMessages(projectId: string): Promise<ChatMessage[]> {
  const token = await getAuthToken();
  if (!token) return [];
  insforge.setAccessToken(token);

  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await insforge.database
    .from("chat_messages")
    .select("*")
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(100);

  if (error || !data) return [];
  return data as ChatMessage[];
}

export async function saveChatMessage(
  projectId: string,
  role: "user" | "assistant",
  content: string
): Promise<ChatMessage | null> {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const { data, error } = await insforge.database
    .from("chat_messages")
    .insert({
      project_id: projectId,
      user_id: userId,
      role,
      content,
    })
    .select()
    .single();

  if (error || !data) return null;
  return data as ChatMessage;
}

export async function clearChatMessages(projectId: string): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  await insforge.database
    .from("chat_messages")
    .delete()
    .eq("project_id", projectId)
    .eq("user_id", userId);
}
