const fs = require('fs');
let content = fs.readFileSync('src/lib/actions.ts', 'utf8');
content = content.replace(/select\('user_id'\)/g, "select('student_id')");
content = content.replace(/project\?\.user_id/g, "project?.student_id");

// Also add File delete actions
const fileDeleteCode = `
export async function softDeleteFileAction(projectId: string, fileUrl: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in");
  const admin = createAdminClient();
  
  const { data: project } = await admin.from('projects').select('student_id, files').eq('id', projectId).single();
  if (project?.student_id !== user.id) throw new Error("Unauthorized");

  const files = (project.files as any[]) || [];
  const updatedFiles = files.map((f: any) => 
    f.url === fileUrl ? { ...f, deleted_at: new Date().toISOString() } : f
  );

  const { error } = await admin.from('projects').update({ files: updatedFiles }).eq('id', projectId);
  if (error) throw new Error(error.message);
  revalidatePath(\`/dashboard/projects/\${projectId}\`);
  return { success: true };
}

export async function restoreFileAction(projectId: string, fileUrl: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in");
  const admin = createAdminClient();
  
  const { data: project } = await admin.from('projects').select('student_id, files').eq('id', projectId).single();
  if (project?.student_id !== user.id) throw new Error("Unauthorized");

  const files = (project.files as any[]) || [];
  const updatedFiles = files.map((f: any) => {
    if (f.url === fileUrl) {
      const { deleted_at, ...rest } = f;
      return rest;
    }
    return f;
  });

  const { error } = await admin.from('projects').update({ files: updatedFiles }).eq('id', projectId);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/trash/files');
  revalidatePath(\`/dashboard/projects/\${projectId}\`);
  return { success: true };
}

export async function permanentDeleteFileAction(projectId: string, fileUrl: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in");
  const admin = createAdminClient();
  
  const { data: project } = await admin.from('projects').select('student_id, files').eq('id', projectId).single();
  if (project?.student_id !== user.id) throw new Error("Unauthorized");

  const files = (project.files as any[]) || [];
  const updatedFiles = files.filter((f: any) => f.url !== fileUrl);

  const { error } = await admin.from('projects').update({ files: updatedFiles }).eq('id', projectId);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/trash/files');
  
  // Actually remove from storage
  const pathParts = fileUrl.split("project-files/");
  if (pathParts.length > 1) {
    const filePath = pathParts[1];
    await admin.storage.from("project-files").remove([filePath]);
  }

  return { success: true };
}
`;

if (!content.includes('softDeleteFileAction')) {
  content = content + "\n\n" + fileDeleteCode;
}

fs.writeFileSync('src/lib/actions.ts', content, 'utf8');
console.log('Fixed actions');
