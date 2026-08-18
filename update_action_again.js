const fs = require('fs');
let content = fs.readFileSync('src/lib/social-actions.ts', 'utf8');

const oldAction = /export async function getUnreadChatCountAction\(\): Promise<\{ count: number; error\?: string \}> \{[\s\S]*?catch \(err: any\) \{[\s\S]*?return \{ count: 0, error: err\.message \};\s*\}\s*\}/;

const newAction = `export async function getUnreadChatCountAction(): Promise<{ count: number; error?: string }> {
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
}`;

content = content.replace(oldAction, newAction);

fs.writeFileSync('src/lib/social-actions.ts', content, 'utf8');
console.log("Updated getUnreadChatCountAction in social-actions.ts");
