const fs = require('fs');
let content = fs.readFileSync('src/lib/social-actions.ts', 'utf8');

const replacement = `export async function markMessagesAsReadAction(senderId: string): Promise<{success: boolean, error?: string}> {
  if (!senderId) return { success: false, error: "Sender ID is required." };
  
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
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

content = content.replace(/export async function markMessagesAsReadAction[\s\S]*?return \{ success\: true \};\n\}/, replacement);

fs.writeFileSync('src/lib/social-actions.ts', content, 'utf8');
console.log("Updated markMessagesAsReadAction to only update is_read");
