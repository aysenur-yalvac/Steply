const fs = require('fs');
let content = fs.readFileSync('src/lib/actions.ts', 'utf8');

// 1. Soft delete, Restore, Permanent delete PROJECT
const deleteProjectCode = `export async function softDeleteProjectAction(projectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in");
  const admin = createAdminClient();
  
  const { data: project } = await admin.from('projects').select('user_id').eq('id', projectId).single();
  if (project?.user_id !== user.id) throw new Error("Unauthorized");

  const { error } = await admin.from('projects').update({ deleted_at: new Date().toISOString() }).eq('id', projectId);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard');
  return { success: true };
}

export async function restoreProjectAction(projectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in");
  const admin = createAdminClient();
  
  const { data: project } = await admin.from('projects').select('user_id').eq('id', projectId).single();
  if (project?.user_id !== user.id) throw new Error("Unauthorized");

  const { error } = await admin.from('projects').update({ deleted_at: null }).eq('id', projectId);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/trash/projects');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function permanentDeleteProjectAction(projectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in");
  const admin = createAdminClient();
  
  const { data: project } = await admin.from('projects').select('user_id').eq('id', projectId).single();
  if (project?.user_id !== user.id) throw new Error("Unauthorized");

  const { error } = await admin.from('projects').delete().eq('id', projectId);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/trash/projects');
  return { success: true };
}
`;
if (!content.includes('softDeleteProjectAction')) {
  content = content + "\n\n" + deleteProjectCode;
}

// 2. Add .is('deleted_at', null) to select queries for projects
content = content.replace(/\.from\(\s*["']projects["']\s*\)\s*\.select\(/g, '.from("projects").select(');
// We need to be careful. I'll just append it after .from("projects").select(...)
// Actually, it's safer to just grep the file for the places where projects are listed.
fs.writeFileSync('src/lib/actions.ts', content, 'utf8');
console.log('Added project delete actions');
