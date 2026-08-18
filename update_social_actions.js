const fs = require('fs');
let content = fs.readFileSync('src/lib/social-actions.ts', 'utf8');

// Replace markMessagesAsReadAction
const markRegex = /export async function markMessagesAsReadAction\([\s\S]*?return \{ success: true \};\n\}/;
const markReplacement = `export async function markMessagesAsReadAction(senderId: string): Promise<{success: boolean, error?: string}> {
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
}`;
content = content.replace(markRegex, markReplacement);

// Replace getRecentConversationsAction
const getRecentRegex = /export async function getRecentConversationsAction\(\): Promise<Conversation\[\]> \{[\s\S]*?return Array\.from\(convMap\.values\(\)\);\n\}/;
const getRecentReplacement = `export async function getRecentConversationsAction(): Promise<Conversation[]> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Not logged in");

  // Fetch all messages involving the user, order by created_at DESC
  const { data: messages, error } = await supabase
    .from("messages")
    .select(\`
      *,
      sender:profiles!messages_sender_id_fkey(id, full_name, email),
      receiver:profiles!messages_receiver_id_fkey(id, full_name, email)
    \`)
    .or(\`sender_id.eq.\${user.id},receiver_id.eq.\${user.id}\`)
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) {
    console.error("[getRecentConversationsAction] Error:", error);
    throw new Error("Failed to fetch conversations.");
  }

  // Fetch UNREAD messages explicitly for this user (where they are the receiver)
  const { data: unreadMessages } = await supabase
    .from("messages")
    .select("sender_id")
    .eq("receiver_id", user.id)
    .eq("is_read", false);

  const unreadCountMap = new Map<string, number>();
  if (unreadMessages) {
    for (const msg of unreadMessages) {
      unreadCountMap.set(msg.sender_id, (unreadCountMap.get(msg.sender_id) || 0) + 1);
    }
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
        unread_count: unreadCountMap.get(otherId) || 0, // Set directly from explicit unread count
      });
    }
  }

  return Array.from(convMap.values());
}`;
content = content.replace(getRecentRegex, getRecentReplacement);

fs.writeFileSync('src/lib/social-actions.ts', content, 'utf8');
console.log("Updated social-actions.ts");
