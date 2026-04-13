"use server";

import { createClient } from "@/utils/supabase/server";

export type UserSearchResult = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  steply_score: number;
  institution: string | null;
};

export type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  metadata: {
    mentioned_project_id?: string;
  } | null;
  created_at: string;
};

/**
 * Searches users by name or email using the search_users RPC.
 */
export async function searchUsersAction(query: string): Promise<UserSearchResult[]> {
  if (!query || query.length < 2) return [];

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be logged in to search users.");
  }

  const { data, error } = await supabase.rpc("search_users", {
    search_query: query,
  });

  if (error) {
    console.error("[searchUsersAction] Error:", error);
    throw new Error("Failed to search users.");
  }

  // Filter out the current user
  return (data as UserSearchResult[]).filter((u) => u.id !== user.id);
}

/**
 * Sends a message to another user.
 */
export async function sendMessageAction(receiverId: string, content: string, mentionedProjectId?: string) {
  if (!receiverId || !content.trim()) {
    throw new Error("Receiver ID and content are required.");
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be logged in to send a message.");
  }

  const metadata = mentionedProjectId ? { mentioned_project_id: mentionedProjectId } : {};

  const { data, error } = await supabase
    .from("messages")
    .insert({
      sender_id: user.id,
      receiver_id: receiverId,
      content: content.trim(),
      metadata: metadata,
    })
    .select()
    .single();

  if (error) {
    console.error("[sendMessageAction] Error:", error);
    throw new Error("Failed to send message: " + error.message);
  }

  return { success: true, message: data as Message };
}

/**
 * Retrieves the history of messages between the current user and another user.
 */
export async function getMessagesAction(otherUserId: string): Promise<Message[]> {
  if (!otherUserId) {
    throw new Error("Other user ID is required.");
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be logged in to fetch messages.");
  }

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) {
    console.error("[getMessagesAction] Error:", error);
    throw new Error("Failed to fetch messages.");
  }

  return data as Message[];
}

/**
 * Retrieves the projects owned by the current user for the mention feature.
 */
export async function getUserProjectsAction() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be logged in to fetch projects.");
  }

  const { data, error } = await supabase
    .from("projects")
    .select("id, title")
    .eq("student_id", user.id);

  if (error) {
    console.error("[getUserProjectsAction] Error:", error);
    throw new Error("Failed to fetch user projects.");
  }

  return data;
}

export type Conversation = {
  other_user: {
    id: string;
    full_name: string;
    email: string;
  };
  last_message: Message;
};

/**
 * Retrieves recent conversations for the current user.
 */
export async function getRecentConversationsAction(): Promise<Conversation[]> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Not logged in");

  // Fetch all messages involving the user, order by created_at DESC
  const { data: messages, error } = await supabase
    .from("messages")
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(id, full_name, email),
      receiver:profiles!messages_receiver_id_fkey(id, full_name, email)
    `)
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getRecentConversationsAction] Error:", error);
    throw new Error("Failed to fetch conversations.");
  }

  const convMap = new Map<string, Conversation>();

  for (const msg of (messages as any[])) {
    const isSender = msg.sender_id === user.id;
    const otherUser = isSender ? msg.receiver : msg.sender;
    const otherId = otherUser.id;

    if (!convMap.has(otherId)) {
      convMap.set(otherId, {
        other_user: otherUser,
        last_message: msg as Message,
      });
    }
  }

  return Array.from(convMap.values());
}
