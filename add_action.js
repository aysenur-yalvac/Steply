const fs = require('fs');
let content = fs.readFileSync('src/lib/social-actions.ts', 'utf8');

const newAction = `
export async function getUnreadChatCountAction(): Promise<{ count: number; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { count: 0 };

    // RLS engellerini asmak icin adminClient veya yetkili server client kullan
    const { createAdminClient } = await import('@/utils/supabase/admin');
    const adminClient = createAdminClient();
    
    const { data, error } = await adminClient
      .from("messages")
      .select("sender_id")
      .eq("receiver_id", user.id)
      .eq("is_read", false);

    if (error) {
      console.error("[getUnreadChatCountAction SQL Error]:", error);
      return { count: 0, error: error.message };
    }

    const uniqueSenders = new Set(data?.map((m) => m.sender_id)).size;
    return { count: uniqueSenders };
  } catch (err: any) {
    console.error("[getUnreadChatCountAction Server Error]:", err);
    return { count: 0, error: err.message };
  }
}
`;

content = content + "\n" + newAction;

fs.writeFileSync('src/lib/social-actions.ts', content, 'utf8');
console.log("Added getUnreadChatCountAction to social-actions.ts");
