const fs = require('fs');
let content = fs.readFileSync('src/lib/actions.ts', 'utf8');

// Replace softDeleteFileAction
content = content.replace(
  `const { data: project } = await admin.from('projects').select('student_id, files').eq('id', projectId).single();
    if (project?.student_id !== user.id) throw new Error("Unauthorized");`,
  `const { data: project } = await admin.from('projects').select('student_id, files').eq('id', projectId).single();
    if (!project) throw new Error("Project not found");
    if (project.student_id !== user.id) {
      const { data: isMember } = await admin.from('project_members').select('id').eq('project_id', projectId).eq('student_id', user.id).maybeSingle();
      if (!isMember) throw new Error("Unauthorized");
    }`
);

// We need to do the same for restoreFileAction and permanentDeleteFileAction
content = content.replace(
  /const \{ data: project \} = await admin\.from\('projects'\)\.select\('student_id, files'\)\.eq\('id', projectId\)\.single\(\);\s+if \(project\?\.student_id !== user\.id\) throw new Error\("Unauthorized"\);/g,
  `const { data: project } = await admin.from('projects').select('student_id, files').eq('id', projectId).single();
    if (!project) throw new Error("Project not found");
    if (project.student_id !== user.id) {
      const { data: isMember } = await admin.from('project_members').select('id').eq('project_id', projectId).eq('student_id', user.id).maybeSingle();
      if (!isMember) throw new Error("Unauthorized");
    }`
);

// Add bulk actions at the end
const bulkActions = `
export async function bulkRestoreProjectsAction(projectIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in");
  const admin = createAdminClient();

  const { data: projects } = await admin.from("projects").select('id, student_id').in('id', projectIds);
  const ownedIds = projects?.filter(p => p.student_id === user.id).map(p => p.id) || [];
  
  if (ownedIds.length > 0) {
    await admin.from('projects').update({ deleted_at: null }).in('id', ownedIds);
  }
  revalidatePath('/dashboard/trash/projects');
  return { success: true, restoredCount: ownedIds.length };
}

export async function bulkPermanentDeleteProjectsAction(projectIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in");
  const admin = createAdminClient();

  const { data: projects } = await admin.from("projects").select('id, student_id').in('id', projectIds);
  const ownedIds = projects?.filter(p => p.student_id === user.id).map(p => p.id) || [];
  
  if (ownedIds.length > 0) {
    await admin.from('projects').delete().in('id', ownedIds);
  }
  revalidatePath('/dashboard/trash/projects');
  return { success: true, deletedCount: ownedIds.length };
}

export async function bulkRestoreFilesAction(filesToRestore: {projectId: string, url: string}[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in");
  const admin = createAdminClient();

  // Group by project
  const projectMap: Record<string, string[]> = {};
  filesToRestore.forEach(f => {
    if(!projectMap[f.projectId]) projectMap[f.projectId] = [];
    projectMap[f.projectId].push(f.url);
  });

  for (const [projectId, urls] of Object.entries(projectMap)) {
    const { data: project } = await admin.from('projects').select('student_id, files').eq('id', projectId).single();
    if (!project) continue;
    
    // Auth check
    if (project.student_id !== user.id) {
      const { data: isMember } = await admin.from('project_members').select('id').eq('project_id', projectId).eq('student_id', user.id).maybeSingle();
      if (!isMember) continue;
    }

    const files = (project.files as any[]) || [];
    const updatedFiles = files.map((f: any) => 
      urls.includes(f.url) ? { ...f, deleted_at: null } : f
    );
    await admin.from('projects').update({ files: updatedFiles }).eq('id', projectId);
  }
  revalidatePath('/dashboard/trash/files');
  return { success: true };
}

export async function bulkPermanentDeleteFilesAction(filesToDelete: {projectId: string, url: string}[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in");
  const admin = createAdminClient();

  const projectMap: Record<string, string[]> = {};
  filesToDelete.forEach(f => {
    if(!projectMap[f.projectId]) projectMap[f.projectId] = [];
    projectMap[f.projectId].push(f.url);
  });

  for (const [projectId, urls] of Object.entries(projectMap)) {
    const { data: project } = await admin.from('projects').select('student_id, files').eq('id', projectId).single();
    if (!project) continue;
    
    if (project.student_id !== user.id) {
      const { data: isMember } = await admin.from('project_members').select('id').eq('project_id', projectId).eq('student_id', user.id).maybeSingle();
      if (!isMember) continue;
    }

    const files = (project.files as any[]) || [];
    const updatedFiles = files.filter((f: any) => !urls.includes(f.url));
    await admin.from('projects').update({ files: updatedFiles }).eq('id', projectId);
  }
  revalidatePath('/dashboard/trash/files');
  return { success: true };
}
`;

content = content + bulkActions;
fs.writeFileSync('src/lib/actions.ts', content, 'utf8');
console.log('Fixed actions.ts for bulk and security');
