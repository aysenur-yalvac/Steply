"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

export type ProjectFile = {
  id?: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploaded_at: string;
  isPrivate?: boolean;
};

const BUCKET_ID = "project-files";

/**
 * Saves a file record to the DB after the client has already uploaded
 * the file directly to Supabase Storage (bypasses Vercel's 4.5 MB body limit).
 */
export async function saveFileRecordAction(
  projectId: string,
  fileName: string,
  fileSize: number,
  fileType: string,
  filePath: string,
  isPrivate: boolean,
): Promise<{ success: true; file: ProjectFile } | { error: string }> {
  try {
    if (!projectId || !filePath) return { error: "Kritik Hata: projectId veya filePath eksik." };

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { error: "Oturum bulunamadı. Lütfen tekrar giriş yapın." };

    const admin = createAdminClient();

    const { data: project, error: projectError } = await admin
      .from("projects")
      .select("student_id, files")
      .eq("id", projectId)
      .single();

    if (projectError) return { error: `DB Select Hatası: ${projectError.message} (Code: ${projectError.code})` };
    if (!project) return { error: `Proje bulunamadı (projectId: ${projectId})` };

    // Allow owner OR verified collaborator
    if (project.student_id !== user.id) {
      const { data: membership } = await admin
        .from("project_members")
        .select("id")
        .eq("project_id", projectId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (!membership) return { error: "Bu proje için yetkiniz yok." };
    }

    const { data: { publicUrl } } = admin.storage.from(BUCKET_ID).getPublicUrl(filePath);

    const newFile: ProjectFile = {
      id: `${Date.now()}`,
      name: fileName,
      url: publicUrl,
      size: fileSize,
      type: fileType,
      uploaded_at: new Date().toISOString(),
      isPrivate,
    };

    const existingFiles = (project.files as ProjectFile[]) || [];
    const { data: updatedRow, error: updateError } = await admin
      .from("projects")
      .update({ files: [...existingFiles, newFile] })
      .eq("id", projectId)
      .select();

    if (updateError) return { error: `DB Update Hatası: ${updateError.message} (Code: ${updateError.code})` };
    if (!updatedRow || updatedRow.length === 0) return { error: "Veritabanı güncellenmedi: Proje ID eşleşmedi." };

    revalidatePath("/dashboard/projects");
    revalidatePath(`/dashboard/projects/${projectId}`);

    return { success: true, file: newFile };

  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[saveFileRecord] UNCAUGHT EXCEPTION:", e);
    return { error: `Beklenmedik bir sunucu hatası oluştu: ${msg}` };
  }
}

export async function deleteFileAction(projectId: string, fileUrl: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("You must be logged in.");

  // Use admin client for all DB operations so RLS never blocks ownership check or update
  const admin = createAdminClient();

  const { data: project, error: projectError } = await admin
    .from("projects")
    .select("student_id, files")
    .eq("id", projectId)
    .single();

  if (projectError || !project) throw new Error("Project not found.");

  // Allow owner OR verified collaborator
  if (project.student_id !== user.id) {
    const { data: membership } = await admin
      .from("project_members")
      .select("id")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!membership) throw new Error("You do not have permission for this action.");
  }

  // Remove from Supabase Storage
  const pathParts = fileUrl.split("project-files/");
  if (pathParts.length > 1) {
    const filePath = pathParts[1];
    const { error: storageError } = await admin.storage.from("project-files").remove([filePath]);
    if (storageError) {
      console.error("[deleteFileAction] Storage removal error:", storageError);
    }
  }

  const existingFiles = (project.files as ProjectFile[]) || [];
  const updatedFiles = existingFiles.filter((f) => f.url !== fileUrl);

  const { error: updateError } = await admin
    .from("projects")
    .update({ files: updatedFiles })
    .eq("id", projectId);

  if (updateError) throw new Error("Database could not be updated: " + updateError.message);

  revalidatePath(`/dashboard/projects/${projectId}`);
  return { success: true };
}

export async function toggleWatchlistAction(projectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: existing } = await supabase
    .from("mentored_projects")
    .select("id")
    .eq("teacher_id", user.id)
    .eq("project_id", projectId)
    .single();

  if (existing) {
    await supabase.from("mentored_projects").delete().eq("id", existing.id);
  } else {
    await supabase.from("mentored_projects").insert({
      teacher_id: user.id,
      project_id: projectId
    });
  }

  // Revalidate so dashboard UI updates immediately
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/projects/${projectId}`);
  return { success: true, isWatched: !existing };
}

export async function addQuickNoteAction(projectId: string, content: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Upsert pattern requires the constrained uniqueness. In initial schema, project_notes lacks UNIQUE constraint, so let's delete existing first or just use a combo.
  await supabase.from("project_notes").delete().eq("project_id", projectId).eq("teacher_id", user.id);

  const { error } = await supabase.from("project_notes").insert({
    teacher_id: user.id,
    project_id: projectId,
    content
  });

  if (error) throw new Error("Failed to add note: " + error.message);

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteQuickNoteAction(projectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from("project_notes").delete().eq("project_id", projectId).eq("teacher_id", user.id);
  if (error) throw new Error("Failed to delete note: " + error.message);

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Unauthorized" };

  const full_name = formData.get('full_name') as string;
  const phone_number = formData.get('phone_number') as string;
  const bio = formData.get('bio') as string;
  const company = formData.get('company') as string;
  const country = formData.get('country') as string;
  const location = formData.get('location') as string;
  const github_url = formData.get('github_url') as string;
  const linkedin_url = formData.get('linkedin_url') as string;
  const twitter_url = formData.get('twitter_url') as string;
  const website_url = formData.get('website_url') as string;
  const avatar_url = formData.get('avatar_url') as string;
  const institution = formData.get('institution') as string;

  const { error } = await supabase.from('profiles').update({
    full_name,
    phone_number,
    bio,
    company,
    country,
    location,
    github_url,
    linkedin_url,
    twitter_url,
    website_url,
    avatar_url,
    institution,
  }).eq('id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/dashboard/profile', 'page');
  revalidatePath('/dashboard/settings', 'page');
  return { success: true };
}

export async function addAgendaTaskAction(title: string, due_date: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase.from('agenda_tasks').insert({
    user_id: user.id,
    task_title: title,
    due_date
  }).select().single();

  if (error) return { success: false, error: `Agenda Error [${error.code}]: ${error.message}` };

  revalidatePath('/dashboard/agenda');
  return { success: true, task: data };
}

export async function toggleAgendaTaskAction(taskId: string, is_completed: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from('agenda_tasks').update({
    is_completed
  }).eq('id', taskId).eq('user_id', user.id);

  if (error) throw new Error(error.message);

  revalidatePath('/dashboard/agenda');
  return { success: true };
}

export async function deleteAgendaTaskAction(taskId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from('agenda_tasks').delete().eq('id', taskId).eq('user_id', user.id);

  if (error) throw new Error(error.message);

  revalidatePath('/dashboard/agenda');
  return { success: true };
}

export async function updateSocialLinksAction(data: {
  github_url: string;
  linkedin_url: string;
  twitter_url: string;
  website_url: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from('profiles')
    .update({
      github_url:   data.github_url   || null,
      linkedin_url: data.linkedin_url || null,
      twitter_url:  data.twitter_url  || null,
      website_url:  data.website_url  || null,
    })
    .eq('id', user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/dashboard/settings', 'page');
  revalidatePath('/dashboard/profile', 'page');
  return { success: true };
}

export async function updateUserPrivacyAction(isPublic: boolean): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from('profiles')
    .update({ is_public: isPublic })
    .eq('id', user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/dashboard/settings', 'page');
  return { success: true };
}

export async function getWatchlistAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, data: [] };

  const { data, error } = await supabase
    .from('mentored_projects')
    .select('project_id, projects(id, title, profiles!student_id(full_name, is_public))')
    .eq('teacher_id', user.id);

  if (error) return { success: false, data: [] };

  const formattedData = data
    .filter((item: any) => item.projects?.profiles?.is_public !== false)
    .map((item: any) => ({
       id: item.projects?.id,
       title: item.projects?.title,
       studentName: item.projects?.profiles?.full_name || 'Unknown'
    })).filter((i: any) => i.id);

  return { success: true, data: formattedData };
}

// ── Notification System ──────────────────────────────────────────────────────

export type Notification = {
  id: string;
  type: 'message' | 'project' | 'task';
  title: string;
  body: string | null;
  is_read: boolean;
  related_id: string | null;
  created_at: string;
};

export async function createNotificationAction(
  userId: string,
  type: Notification['type'],
  title: string,
  body?: string,
  relatedId?: string,
): Promise<void> {
  try {
    const admin = createAdminClient();
    const { error } = await admin.from('notifications').insert({
      user_id: userId,
      type,
      title,
      body: body || null,
      related_id: relatedId || null,
    });
    if (error) {
      console.error('[createNotificationAction] DB insert error:', error.message, error.code, { userId, type, title });
    }
  } catch (e) {
    console.error('[createNotificationAction] Unexpected error:', e);
  }
}

export async function getNotificationsAction(): Promise<Notification[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('notifications')
    .select('id, type, title, body, is_read, related_id, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(30);

  if (error) return [];
  return (data || []) as Notification[];
}

export async function markNotificationAsReadAction(
  id: string,
): Promise<{ success: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false };

  await supabase.from('notifications').update({ is_read: true }).eq('id', id).eq('user_id', user.id);
  return { success: true };
}

export async function markAllNotificationsReadAction(): Promise<{ success: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false };

  await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
  return { success: true };
}

// ── Project Tasks ────────────────────────────────────────────────────────────

export type ProjectTask = {
  id: string;
  project_id: string;
  title: string;
  is_completed: boolean;
  created_at: string;
};

async function recalculateProgress(admin: ReturnType<typeof createAdminClient>, projectId: string) {
  const { data: allTasks } = await admin
    .from('project_tasks')
    .select('is_completed')
    .eq('project_id', projectId);

  const total = allTasks?.length ?? 0;
  const completed = (allTasks ?? []).filter((t: any) => t.is_completed).length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  await admin.from('projects').update({ progress_percentage: progress }).eq('id', projectId);
  return progress;
}

async function assertProjectAccess(supabase: Awaited<ReturnType<typeof createClient>>, projectId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const admin = createAdminClient();
  const { data: project } = await admin.from('projects').select('student_id').eq('id', projectId).single();
  if (!project) return null;
  if (project.student_id === user.id) return { user, admin, role: 'owner' as const };
  const { data: membership } = await admin.from('project_members').select('id').eq('project_id', projectId).eq('user_id', user.id).maybeSingle();
  if (membership) return { user, admin, role: 'collaborator' as const };
  return null;
}

export async function addProjectTask(
  projectId: string,
  title: string,
): Promise<{ success: true; task: ProjectTask } | { error: string }> {
  const supabase = await createClient();
  const ctx = await assertProjectAccess(supabase, projectId);
  if (!ctx) return { error: 'Unauthorized' };

  const { data, error } = await ctx.admin
    .from('project_tasks')
    .insert({ project_id: projectId, title: title.trim(), is_completed: false })
    .select()
    .single();

  if (error || !data) return { error: error?.message ?? 'Insert failed' };

  await recalculateProgress(ctx.admin, projectId);
  revalidatePath(`/dashboard/projects/${projectId}`);
  return { success: true, task: data as ProjectTask };
}

export async function toggleTaskCompletion(
  taskId: string,
  projectId: string,
  isCompleted: boolean,
): Promise<{ success: true; progress: number } | { error: string }> {
  const supabase = await createClient();
  const ctx = await assertProjectAccess(supabase, projectId);
  if (!ctx) return { error: 'Unauthorized' };

  const { error } = await ctx.admin
    .from('project_tasks')
    .update({ is_completed: isCompleted })
    .eq('id', taskId)
    .eq('project_id', projectId);

  if (error) return { error: error.message };

  const progress = await recalculateProgress(ctx.admin, projectId);
  revalidatePath(`/dashboard/projects/${projectId}`);
  return { success: true, progress };
}

export async function deleteProjectTask(
  taskId: string,
  projectId: string,
): Promise<{ success: true; progress: number } | { error: string }> {
  const supabase = await createClient();
  const ctx = await assertProjectAccess(supabase, projectId);
  if (!ctx) return { error: 'Unauthorized' };

  const { error } = await ctx.admin
    .from('project_tasks')
    .delete()
    .eq('id', taskId)
    .eq('project_id', projectId);

  if (error) return { error: error.message };

  const progress = await recalculateProgress(ctx.admin, projectId);
  revalidatePath(`/dashboard/projects/${projectId}`);
  return { success: true, progress };
}

