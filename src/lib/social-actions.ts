"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export type SearchUsersResult = {
  users: UserSearchResult[];
  error: string | null;
};

export type UserSearchResult = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  steply_score: number;
  institution: string | null;
  avatar_url?: string | null;
};

export type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  metadata: {
    mentioned_project_id?: string;
    attachment?: {
      url: string;
      name: string;
      type: string;
      size?: number;
    };
  } | null;
  created_at: string;
};

/**
 * Searches users by name or email using the search_users RPC.
 */
export async function searchUsersAction(query: string): Promise<SearchUsersResult> {
  const cleanQuery = (query || "").trim();
  if (!cleanQuery) {
    return { users: [], error: null };
  }

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("[searchUsersAction] Auth error or user not found:", authError);
      return { users: [], error: "Oturum açmanız gerekiyor." };
    }

    let client: any = supabase;
    try {
      client = createAdminClient();
    } catch (adminErr) {
      console.warn("[searchUsersAction] createAdminClient fallback to standard supabase client:", adminErr);
      client = supabase;
    }

    const { data, error } = await client
      .from('profiles')
      .select('*')
      .ilike('full_name', `%${cleanQuery}%`)
      .neq('id', user.id)
      .limit(20);

    if (error) {
      console.error("[searchUsersAction] Supabase query error:", error);
      return { users: [], error: error.message || "Arama sırasında veritabanı hatası oluştu." };
    }

    const users: UserSearchResult[] = (data || []).map((row: any) => ({
      id: row.id,
      full_name: row.full_name || 'İsimsiz Kullanıcı',
      email: row.email || row.school_email || '',
      role: row.role || 'student',
      steply_score: row.steply_score ?? row.total_score ?? 0,
      institution: row.institution || row.university || row.school || '',
      avatar_url: row.avatar_url || null,
    }));

    return { users, error: null };
  } catch (err: any) {
    console.error("[searchUsersAction] Unexpected error:", err);
    return { users: [], error: err?.message || "Arama sırasında beklenmedik bir hata oluştu." };
  }
}

/**
 * Sends a message to another user.
 */
export async function sendMessageAction(
  receiverId: string,
  content: string,
  mentionedProjectId?: string,
  attachment?: { url: string; name: string; type: string; size?: number } | null
) {
  if (!receiverId || (!content.trim() && !attachment)) {
    throw new Error("Receiver ID and content are required.");
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be logged in to send a message.");
  }

  const metadata: Record<string, any> = {};
  if (mentionedProjectId) metadata.mentioned_project_id = mentionedProjectId;
  if (attachment) metadata.attachment = attachment;

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
    avatar_url?: string | null;
    role?: string | null;
    institution?: string | null;
    university?: string | null;
  };
  last_message: Message;
  unread_count: number;
};

/**
 * Retrieves recent conversations for the current user.
 */
export async function getRecentConversationsAction(): Promise<Conversation[]> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return [];

  let client: any = supabase;
  try {
    client = createAdminClient();
  } catch {
    client = supabase;
  }

  // Fetch all messages involving the user, with full profile information
  const { data: messages, error } = await client
    .from("messages")
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(*),
      receiver:profiles!messages_receiver_id_fkey(*)
    `)
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getRecentConversationsAction] Error:", error);
    return [];
  }

  const convMap = new Map<string, Conversation>();

  for (const msg of (messages as any[])) {
    const isSender = msg.sender_id === user.id;
    const otherUserRaw = isSender ? msg.receiver : msg.sender;
    if (!otherUserRaw) continue;
    const otherId = otherUserRaw.id;

    if (!convMap.has(otherId)) {
      convMap.set(otherId, {
        other_user: {
          id: otherUserRaw.id,
          full_name: otherUserRaw.full_name || 'İsimsiz Kullanıcı',
          email: otherUserRaw.email || otherUserRaw.school_email || '',
          avatar_url: otherUserRaw.avatar_url || null,
          role: otherUserRaw.role || 'student',
          institution: otherUserRaw.institution || otherUserRaw.university || '',
          university: otherUserRaw.university || null,
        },
        last_message: msg as Message,
        unread_count: 0,
      });
    }

    // If it's a received message and not read, increment count
    if (!isSender && !msg.is_read) {
      const conv = convMap.get(otherId)!;
      conv.unread_count += 1;
    }
  }

  return Array.from(convMap.values());
}

export async function markMessagesAsReadAction(senderId: string): Promise<{success: boolean, error?: string}> {
  if (!senderId) return { success: false, error: "Sender ID is required." };
  
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return { success: false, error: "Unauthorized" };

  // Use Admin Client to bypass any RLS that might prevent UPDATEs
  const { createAdminClient } = await import('@/utils/supabase/admin');
  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("messages")
    .update({ is_read: true })
    .eq("sender_id", senderId)
    .eq("receiver_id", user.id)
    .eq("is_read", false);

  if (error) {
    console.error("[markMessagesAsReadAction] Error:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}


export async function getUnreadChatCountAction(): Promise<{ count: number; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { count: 0, error: "Kullanıcı oturumu bulunamadı" };
    }

    // Kullanıcının kendi aldığı ve okunmamış olan mesajlar
    const { data, error } = await supabase
      .from("messages")
      .select("sender_id")
      .eq("receiver_id", user.id)
      .eq("is_read", false);

    if (error) {
      console.error("[getUnreadChatCountAction Error]:", error);
      return { count: 0, error: error.message };
    }

    const uniqueSenders = new Set(data?.map((m) => m.sender_id)).size;
    return { count: uniqueSenders };
  } catch (err: any) {
    console.error("[getUnreadChatCountAction Catch]:", err);
    return { count: 0, error: err.message };
  }
}

export type AppNotificationItem = {
  id: string;
  type: 'message' | 'notification';
  title: string;
  body: string;
  is_read: boolean;
  sender_avatar?: string | null;
  sender_name?: string | null;
  created_at: string;
  link: string;
  pendingProjectId?: string | null;
};

export async function getUserNotificationsAndMessagesAction(): Promise<{
  notifications: AppNotificationItem[];
  unreadCount: number;
}> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { notifications: [], unreadCount: 0 };
    }

    let client: any = supabase;
    try {
      client = createAdminClient();
    } catch {
      client = supabase;
    }

    const items: AppNotificationItem[] = [];

    // 1. Fetch recent messages sent to the current user
    try {
      const { data: incomingMessages } = await client
        .from('messages')
        .select(`
          id,
          content,
          is_read,
          created_at,
          sender_id,
          sender:profiles!messages_sender_id_fkey(*)
        `)
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (incomingMessages) {
        for (const msg of incomingMessages) {
          const sender = (msg as any).sender || {};
          const senderName = sender.full_name || 'Bir kullanıcı';
          items.push({
            id: `msg-${msg.id}`,
            type: 'message',
            title: `${senderName} sana mesaj gönderdi`,
            body: msg.content || '',
            is_read: Boolean(msg.is_read),
            sender_avatar: sender.avatar_url || null,
            sender_name: senderName,
            created_at: msg.created_at,
            link: `/dashboard/messages?userId=${msg.sender_id}`,
          });
        }
      }
    } catch (e) {
      console.error("[getUserNotificationsAndMessagesAction] Messages fetch error:", e);
    }

    // 2. Fetch notifications from notifications table if it exists
    try {
      const [{ data: notifs }, { data: pendingMemberships }] = await Promise.all([
        client
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20),
        client
          .from('project_members')
          .select('project_id')
          .eq('user_id', user.id)
          .eq('status', 'pending'),
      ]);

      const pendingProjectIdSet = new Set(
        (pendingMemberships ?? []).map((r: any) => r.project_id as string)
      );

      if (notifs) {
        for (const n of notifs) {
          let link = n.link || '/dashboard';
          if (!n.link && n.related_id) {
            link = `/dashboard/projects/${n.related_id}`;
          }

          let pendingProjectId: string | null = null;
          if (n.type === 'project_invite') {
            const match = typeof link === 'string' ? link.match(/[?&]invite=([0-9a-f-]+)/i) : null;
            const candidateId = match?.[1] || n.related_id || null;
            if (candidateId && pendingProjectIdSet.has(candidateId)) {
              pendingProjectId = candidateId;
            }
          }

          items.push({
            id: `notif-${n.id}`,
            type: 'notification',
            title: n.title || 'Yeni bildirim',
            body: n.content || n.body || '',
            is_read: Boolean(n.is_read),
            sender_avatar: null,
            sender_name: null,
            created_at: n.created_at,
            link,
            pendingProjectId,
          });
        }
      }
    } catch (e) {
      // notifications table might be empty or optional
    }

    // Sort by created_at DESC
    items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const unreadCount = items.filter(i => !i.is_read).length;
    return { notifications: items.slice(0, 30), unreadCount };
  } catch (err) {
    console.error("[getUserNotificationsAndMessagesAction] Unexpected error:", err);
    return { notifications: [], unreadCount: 0 };
  }
}

export async function markAllNotificationsAndMessagesReadAction(): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) return { success: false };

    let client: any = supabase;
    try {
      client = createAdminClient();
    } catch {
      client = supabase;
    }

    // Mark messages as read
    await client
      .from('messages')
      .update({ is_read: true })
      .eq('receiver_id', user.id)
      .eq('is_read', false);

    // Mark notifications as read
    try {
      await client
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
    } catch {}

    return { success: true };
  } catch (err) {
    console.error("[markAllNotificationsAndMessagesReadAction] Error:", err);
    return { success: false };
  }
}
