const fs = require('fs');
let path = 'src/app/dashboard/actions.ts';
let content = fs.readFileSync(path, 'utf8');

const newAction = `
export async function generateProjectInviteAction(projectId: string): Promise<{ success: true, invite_code: string, invite_token: string } | { error: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Oturum bulunamadı." };

    // Generate code and token
    const randomCode = 'STP-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const randomToken = crypto.randomUUID();

    const { error } = await supabase
      .from('projects')
      .update({ invite_code: randomCode, invite_token: randomToken })
      .eq('id', projectId)
      .eq('student_id', user.id); // ensure owner

    if (error) {
      console.error("[generateProjectInviteAction] Database Error:", error);
      return { error: "Davet kodu üretilemedi." };
    }

    return { success: true, invite_code: randomCode, invite_token: randomToken };
  } catch (e: any) {
    console.error("[generateProjectInviteAction] Exception:", e);
    return { error: "Beklenmedik bir hata oluştu." };
  }
}
`;

fs.writeFileSync(path, content + '\n' + newAction, 'utf8');
console.log('Added generateProjectInviteAction to actions.ts');
