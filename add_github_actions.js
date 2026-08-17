const fs = require('fs');
const content = `
// ==========================================
// GITHUB INTEGRATION ACTIONS
// ==========================================

export async function connectGitHubRepoAction(projectId: string, repoUrl: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Oturum bulunamadi." };

    const admin = createAdminClient();

    // Verify ownership
    const { data: project } = await admin.from("projects").select("student_id").eq("id", projectId).single();
    if (project?.student_id !== user.id) return { error: "Yetkiniz yok." };

    // Basic URL parsing (https://github.com/owner/repo)
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return { error: "Geçersiz GitHub URL'si." };
    const repoOwner = match[1];
    const repoName = match[2].replace('.git', '');

    const crypto = require('crypto');
    const webhookSecret = crypto.randomBytes(32).toString('hex');

    const { error } = await admin.from("project_github_repos").upsert({
      project_id: projectId,
      repo_url: repoUrl,
      repo_owner: repoOwner,
      repo_name: repoName,
      webhook_secret: webhookSecret,
    }, { onConflict: 'project_id' });

    if (error) return { error: error.message };

    revalidatePath(\`/dashboard/projects/\${projectId}\`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function removeGitHubRepoAction(projectId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Oturum bulunamadi." };

    const admin = createAdminClient();
    const { data: project } = await admin.from("projects").select("student_id").eq("id", projectId).single();
    if (project?.student_id !== user.id) return { error: "Yetkiniz yok." };

    await admin.from("project_github_repos").delete().eq("project_id", projectId);
    // Also delete commits
    await admin.from("project_commits").delete().eq("project_id", projectId);

    revalidatePath(\`/dashboard/projects/\${projectId}\`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getGitHubRepoAction(projectId: string) {
  const admin = createAdminClient();
  const { data } = await admin.from("project_github_repos").select("*").eq("project_id", projectId).single();
  return data;
}

export async function getProjectCommitsAction(projectId: string) {
  const admin = createAdminClient();
  const { data } = await admin.from("project_commits").select("*").eq("project_id", projectId).order("pushed_at", { ascending: false }).limit(20);
  return data || [];
}
`;

fs.appendFileSync('src/lib/actions.ts', content, 'utf8');
console.log("Appended GitHub actions");
