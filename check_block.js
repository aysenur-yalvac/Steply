const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/actions.ts', 'utf8');

const oldBlock = `export async function deleteProjectAction(projectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const isTeacher = profile?.role === 'teacher';

  if (!isTeacher) {
    const { data: project } = await supabase.from('projects').select('student_id').eq('id', projectId).single();
    if (project?.student_id !== user.id) throw new Error("Unauthorized to delete this project.");
  }

  const { error } = await supabase.from('projects').delete().eq('id', projectId);
  if (error) throw new Error(error.message);

  revalidatePath('/dashboard');
  return { success: true };
}`;

if (!content.includes(oldBlock)) {
  console.log('BLOCK NOT FOUND exactly - trying normalized search');
  const idx = content.indexOf("export async function deleteProjectAction");
  console.log('Found at idx:', idx);
  console.log(content.substring(idx, idx + 500));
} else {
  console.log('BLOCK FOUND - replacing');
}
