const fs = require('fs');
let content = fs.readFileSync('src/lib/social-actions.ts', 'utf8');

const replacement = `export async function getRecentConversationsAction(): Promise<Conversation[]> {
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
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getRecentConversationsAction] Error:", error);
    throw new Error("Failed to fetch conversations.");
  }

  // Fetch unread counts accurately
  const { data: unreadData } = await supabase
    .from("messages")
    .select("sender_id")
    .eq("receiver_id", user.id)
    .eq("is_read", false);

  const unreadCountsMap = new Map<string, number>();
  if (unreadData) {
    for (const row of unreadData) {
      unreadCountsMap.set(row.sender_id, (unreadCountsMap.get(row.sender_id) || 0) + 1);
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
        unread_count: unreadCountsMap.get(otherId) || 0,
      });
    }
  }

  return Array.from(convMap.values());
}`;

content = content.replace(/export async function getRecentConversationsAction\(\)\: Promise<Conversation\[\]> \{[\s\S]*?return Array\.from\(convMap\.values\(\)\);\n\}/, replacement);

fs.writeFileSync('src/lib/social-actions.ts', content, 'utf8');
console.log("Updated getRecentConversationsAction");
