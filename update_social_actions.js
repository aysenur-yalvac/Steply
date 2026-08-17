const fs = require('fs');
let content = fs.readFileSync('src/lib/social-actions.ts', 'utf8');

const newAction = `
export async function markMessagesAsReadAction(senderId: string): Promise<{success: boolean, error?: string}> {
  if (!senderId) return { success: false, error: "Sender ID is required." };
  
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("messages")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("sender_id", senderId)
    .eq("receiver_id", user.id)
    .eq("is_read", false);

  if (error) {
    console.error("[markMessagesAsReadAction] Error:", error);
    return { success: false, error: "Failed to mark as read." };
  }

  return { success: true };
}
`;

content += newAction;

fs.writeFileSync('src/lib/social-actions.ts', content, 'utf8');
console.log("Added markMessagesAsReadAction to social-actions.ts");
