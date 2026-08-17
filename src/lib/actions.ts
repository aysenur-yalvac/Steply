"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";
import { sanitizeInstitution } from "@/lib/utils";

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
    if (authError || !user) return { error: "Oturum bulunamadÄ±. LÃ¼tfen tekrar giriÅŸ yapÄ±n." };

    const admin = createAdminClient();

    const { data: project, error: projectError } = await admin
      .from("projects").select("student_id, files, status")
      .eq("id", projectId)
      .single();

    if (projectError) return { error: `DB Select HatasÄ±: ${projectError.message} (Code: ${projectError.code})` };
    if (!project) return { error: `Proje bulunamadÄ± (projectId: ${projectId})` };

    // Allow owner OR verified collaborator
    if (project.student_id !== user.id) {
      const { data: membership } = await admin
        .from("project_members")
        .select("id")
        .eq("project_id", projectId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (!membership) return { error: "Bu proje iÃ§in yetkiniz yok." };
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

    if (updateError) return { error: `DB Update HatasÄ±: ${updateError.message} (Code: ${updateError.code})` };
    if (!updatedRow || updatedRow.length === 0) return { error: "VeritabanÄ± gÃ¼ncellenmedi: Proje ID eÅŸleÅŸmedi." };

    revalidatePath("/dashboard/projects");
    revalidatePath(`/dashboard/projects/${projectId}`);

    await logProjectActivity(admin, projectId, user.id, 'file_upload', `${fileName} isimli yeni bir dosya yÃ¼klendi.`);

    if (project.status === 'todo') {
      await admin.from('projects').update({ status: 'in_review' }).eq('id', projectId);
    }

    return { success: true, file: newFile };

  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[saveFileRecord] UNCAUGHT EXCEPTION:", e);
    return { error: `Beklenmedik bir sunucu hatasÄ± oluÅŸtu: ${msg}` };
  }
}

export async function deleteFileAction(projectId: string, fileUrl: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("You must be logged in.");

  // Use admin client for all DB operations so RLS never blocks ownership check or update
  const admin = createAdminClient();

  const { data: project, error: projectError } = await admin
    .from("projects").select("student_id, files, status")
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
  const university     = sanitizeInstitution(formData.get('university') as string | null);
  const institution    = university ?? sanitizeInstitution(formData.get('institution') as string | null);
  const role           = (formData.get('role')           as string | null) || null;
  const grade          = (formData.get('grade')          as string | null)?.trim() || null;
  const school_number  = (formData.get('school_number')  as string | null)?.trim() || null;
  const school_email   = (formData.get('school_email')   as string | null)?.trim() || null;

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
    role: role as any,
    grade: grade as any,
    school_number: school_number as any,
    school_email: school_email as any,
  }).eq('id', user.id);

  if (error) {
    // company/country/location/grade/school_number/school_email may not exist yet
    // on this DB (pending migration) â€” retry with only the guaranteed-present
    // core columns so the rest of the profile (incl. institution) still saves.
    if ((error as any).code === '42703') {
      const { error: coreError } = await supabase.from('profiles').update({
        full_name,
        phone_number,
        bio,
        github_url,
        linkedin_url,
        twitter_url,
        website_url,
        avatar_url,
        institution,
        role: role as any,
      }).eq('id', user.id);
      if (coreError) return { error: coreError.message };
    } else {
      return { error: error.message };
    }
  }

  // university column may not exist if migration not yet applied â€” best-effort
  if (university !== null) {
    await (supabase as any).from('profiles').update({ university }).eq('id', user.id);
  }

  revalidatePath('/dashboard/profile', 'page');
  revalidatePath('/dashboard/settings', 'page');
  revalidatePath('/dashboard/school', 'page');
  return { success: true };
}

export async function addAgendaTaskAction(title: string, due_date: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase.from('agenda_tasks').insert({
    user_id: user.id,
    title,
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

// â”€â”€ Notification System â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€ Project Activity Stream â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type ProjectActivity = {
  id: string;
  project_id: string;
  user_id: string;
  action_type: string;
  description: string;
  created_at: string;
  actor_name: string | null;
  actor_avatar: string | null;
};

async function logProjectActivity(
  admin: ReturnType<typeof createAdminClient>,
  projectId: string,
  userId: string,
  actionType: string,
  description: string,
): Promise<void> {
  try {
    await admin.from('project_activities').insert({
      project_id: projectId,
      user_id: userId,
      action_type: actionType,
      description,
    });
  } catch (e) {
    console.error('[logProjectActivity] error:', e);
  }
}

export async function getProjectActivitiesAction(projectId: string): Promise<ProjectActivity[]> {
  const supabase = await createClient();
  const ctx = await assertProjectAccess(supabase, projectId);
  if (!ctx) return [];

  const { data: rows } = await ctx.admin
    .from('project_activities')
    .select('id, project_id, user_id, action_type, description, created_at')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (!rows || rows.length === 0) return [];

  const userIds = [...new Set((rows as any[]).map((r) => r.user_id as string))];
  const { data: profileRows } = await ctx.admin
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', userIds);

  const profileMap = new Map((profileRows ?? []).map((p: any) => [p.id, p]));

  return (rows as any[]).map((r) => ({
    ...r,
    actor_name:   profileMap.get(r.user_id)?.full_name  ?? null,
    actor_avatar: profileMap.get(r.user_id)?.avatar_url ?? null,
  })) as ProjectActivity[];
}

// â”€â”€ Project Tasks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
  const { data: project } = await admin.from("projects").select('student_id').eq('id', projectId).single();
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
  await logProjectActivity(ctx.admin, projectId, ctx.user.id, 'task_added', `Yeni gÃ¶rev eklendi: ${title.trim()}`);
  const { data: projAdd } = await ctx.admin.from("projects").select('status').eq('id', projectId).single();
  if (projAdd?.status === 'todo') {
    await ctx.admin.from('projects').update({ status: 'in_review' }).eq('id', projectId);
  }
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

  const { data: taskRow } = await ctx.admin
    .from('project_tasks')
    .select('title')
    .eq('id', taskId)
    .single();

  const { error } = await ctx.admin
    .from('project_tasks')
    .update({ is_completed: isCompleted })
    .eq('id', taskId)
    .eq('project_id', projectId);

  if (error) {
      console.error('SUPABASE DRAWING SAVE ERROR:', error);
      return { error: error.message };
    }

  const progress = await recalculateProgress(ctx.admin, projectId);
  const taskTitle = taskRow?.title ?? taskId;
  const actionType = isCompleted ? 'task_completed' : 'task_uncompleted';
  const description = isCompleted
    ? `Görev tamamlandı: ${taskTitle}`
    : `Görev yeniden açıldı: ${taskTitle}`;
  await logProjectActivity(ctx.admin, projectId, ctx.user.id, actionType, description);
  if (isCompleted) {
    recordUserActionAction('complete_task').catch(() => {});
  }
  // Auto-advance: todo -> in_review on any task toggle
  const { data: proj } = await ctx.admin
    .from("projects").select('status')
    .eq('id', projectId)
    .single();
  if (proj?.status === 'todo') {
    await ctx.admin.from('projects').update({ status: 'in_review' }).eq('id', projectId);
  }
  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath('/dashboard/profile');
  revalidatePath('/dashboard/analytics');
  revalidatePath('/', 'layout');
  return { success: true, progress };
}

export async function deleteProjectTask(
  taskId: string,
  projectId: string,
): Promise<{ success: true; progress: number } | { error: string }> {
  const supabase = await createClient();
  const ctx = await assertProjectAccess(supabase, projectId);
  if (!ctx) return { error: 'Unauthorized' };

  const { data: taskRow } = await ctx.admin
    .from('project_tasks')
    .select('title')
    .eq('id', taskId)
    .single();

  const { error } = await ctx.admin
    .from('project_tasks')
    .delete()
    .eq('id', taskId)
    .eq('project_id', projectId);

  if (error) {
        console.error("SUPABASE ERROR:", error);
        return { error: error.message };
      }

  const progress = await recalculateProgress(ctx.admin, projectId);
  await logProjectActivity(ctx.admin, projectId, ctx.user.id, 'task_deleted', `GÃ¶rev silindi: ${taskRow?.title ?? taskId}`);
  revalidatePath(`/dashboard/projects/${projectId}`);
  return { success: true, progress };
}

// â”€â”€ Project Discussions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type ProjectNote = {
  id: string;
  project_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author_name: string | null;
  author_avatar: string | null;
};

export async function addProjectNoteAction(
  projectId: string,
  content: string,
): Promise<{ success: true; note: ProjectNote } | { error: string }> {
  const supabase = await createClient();
  const ctx = await assertProjectAccess(supabase, projectId);
  if (!ctx) return { error: 'Unauthorized' };

  const trimmed = content.trim();
  if (!trimmed) return { error: 'Not boÅŸ olamaz.' };

  const { data, error } = await ctx.admin
    .from('project_discussions')
    .insert({ project_id: projectId, user_id: ctx.user.id, content: trimmed })
    .select()
    .single();

  if (error || !data) return { error: error?.message ?? 'Insert failed' };

  const { data: profile } = await ctx.admin
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', ctx.user.id)
    .single();

  revalidatePath(`/dashboard/projects/${projectId}`);

  // Notify all other team members (fire-and-forget)
  try {
    const senderName = profile?.full_name ?? 'Bir Ã¼ye';

    const [projectRow, memberRows] = await Promise.all([
      ctx.admin.from("projects").select('title, student_id').eq('id', projectId).single(),
      ctx.admin.from('project_members').select('student_id').eq('project_id', projectId),
    ]);

    const projectTitle = projectRow.data?.title ?? 'proje';
    const ownerId: string = projectRow.data?.student_id ?? '';
    const memberIds: string[] = (memberRows.data ?? []).map((r: any) => r.user_id as string);

    const recipients = [...new Set([ownerId, ...memberIds])].filter(
      (uid) => uid && uid !== ctx.user.id,
    );

    await Promise.all(
      recipients.map((uid) =>
        createNotificationAction(
          uid,
          'message',
          `${senderName}, ${projectTitle} projesinde yeni bir mesaj paylaÅŸtÄ±.`,
          trimmed.slice(0, 120),
          projectId,
        ),
      ),
    );
  } catch (e) {
    console.error('[addProjectNoteAction] Notification error:', e);
  }

  recordUserActionAction('add_log').catch(() => {});
  revalidatePath('/dashboard/profile');
  revalidatePath('/dashboard/analytics');
  revalidatePath('/', 'layout');

  return {
    success: true,
    note: {
      ...(data as any),
      author_name:   profile?.full_name  ?? null,
      author_avatar: profile?.avatar_url ?? null,
    },
  };
}

// â”€â”€ Project Tags â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function updateProjectTagsAction(
  projectId: string,
  tags: string[]
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const ctx = await assertProjectAccess(supabase, projectId);
  if (!ctx) return { error: 'Unauthorized' };

  const sanitized = tags
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0 && t.length <= 32)
    .slice(0, 10);

  const { error } = await ctx.admin
    .from('projects')
    .update({ tags: sanitized })
    .eq('id', projectId);

  if (error) {
        console.error("SUPABASE ERROR:", error);
        return { error: error.message };
      }
  revalidatePath(`/dashboard/projects/${projectId}`);
  return { success: true };
}

export async function getProjectNotesAction(projectId: string): Promise<ProjectNote[]> {
  const supabase = await createClient();
  const ctx = await assertProjectAccess(supabase, projectId);
  if (!ctx) return [];

  const { data: rows } = await ctx.admin
    .from('project_discussions')
    .select('id, project_id, user_id, content, created_at')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (!rows || rows.length === 0) return [];

  const userIds = [...new Set((rows as any[]).map((r) => r.user_id as string))];
  const { data: profiles } = await ctx.admin
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', userIds);

  const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));

  return (rows as any[]).map((r) => ({
    ...r,
    author_name:   profileMap.get(r.user_id)?.full_name  ?? null,
    author_avatar: profileMap.get(r.user_id)?.avatar_url ?? null,
  })) as ProjectNote[];
}

// â”€â”€ Trending Tags â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function getTrendingTagsAction(
  limit = 20
): Promise<{ tag: string; count: number }[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("projects").select('tags')
    .not('tags', 'is', null);

  if (!data) return [];

  const freq: Record<string, number> = {};
  for (const row of data) {
    for (const tag of ((row as any).tags ?? []) as string[]) {
      if (tag) freq[tag] = (freq[tag] ?? 0) + 1;
    }
  }

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }));
}

// â”€â”€ User Activity (Heatmap + Score) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type ActivityDay = { date: string; activity_count: number; daily_score?: number };

export type LeaderboardEntry = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  total_score: number;
  badges: string[];
  country: string | null;
  university: string | null;
  rank: number;
};

async function awardBadgesInternal(userId: string, admin: ReturnType<typeof createAdminClient>): Promise<void> {
  try {
    const { data: profile } = await admin
      .from('profiles')
      .select('badges, total_score')
      .eq('id', userId)
      .single();

    const current = new Set<string>((profile?.badges ?? []) as string[]);
    const toAdd: string[] = [];

    // project count badges
    const { count: projectCount } = await admin
      .from("projects").select('id', { count: 'exact', head: true })
      .eq('student_id', userId);

    if ((projectCount ?? 0) >= 1  && !current.has('first_project')) toAdd.push('first_project');
    if ((projectCount ?? 0) >= 10 && !current.has('prolific'))      toAdd.push('prolific');

    // streak badge â€” need activity for 7 consecutive days ending today
    const last7: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      last7.push(d.toISOString().split('T')[0]);
    }
    const { data: streakRows } = await admin
      .from('user_activities')
      .select('date')
      .eq('user_id', userId)
      .in('date', last7);
    const activeDates = new Set((streakRows ?? []).map((r: any) => r.date as string));
    if (last7.every(d => activeDates.has(d)) && !current.has('streak_7')) toAdd.push('streak_7');

    // ranking badges â€” only if total_score > 0
    const score = profile?.total_score ?? 0;
    if (score > 0) {
      const { count: higherGlobal } = await admin
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gt('total_score', score);
      if ((higherGlobal ?? 0) < 50 && !current.has('top_50_global')) toAdd.push('top_50_global');
    }

    if (toAdd.length > 0) {
      await admin
        .from('profiles')
        .update({ badges: [...Array.from(current), ...toAdd] })
        .eq('id', userId);
    }
  } catch (e) {
    console.warn('[awardBadgesInternal] non-blocking failure:', e);
  }
}

export type ActionType = 'create_project' | 'complete_project' | 'complete_task' | 'add_comment' | 'add_log';

export async function recordUserActionAction(actionType: ActionType): Promise<void> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const admin = createAdminClient();

    const { error: rpcErr } = await admin.rpc('record_user_action', {
      p_user_id: user.id,
      p_action_type: actionType,
    });

    if (rpcErr) {
      console.error('Puanlama HatasÄ± (RPC):', rpcErr.message, { actionType, code: rpcErr.code });
      // RPC not yet deployed â€” manual fallback with weighted points
      const POINTS: Record<ActionType, number> = {
        create_project: 10,
        complete_project: 20,
        complete_task: 5,
        add_comment: 2,
        add_log: 2,
      };
      const points = POINTS[actionType] ?? 1;
      const today = new Date().toISOString();

      const { data: existing } = await admin
        .from('user_activities')
        .select('id, activity_count, daily_score')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (existing) {
        await admin.from('user_activities').update({
          activity_count: (existing as any).activity_count + 1,
          daily_score: ((existing as any).daily_score ?? 0) + points,
        }).eq('id', (existing as any).id);
      } else {
        await admin.from('user_activities').insert({
          user_id: user.id, date: today, activity_count: 1, daily_score: points,
        });
      }

      const { data: prof } = await admin.from('profiles').select('total_score').eq('id', user.id).single();
      await admin.from('profiles').update({
        total_score: ((prof as any)?.total_score ?? 0) + points,
      }).eq('id', user.id);
    }

    // Award badges â€” non-blocking
    awardBadgesInternal(user.id, admin).catch(() => {});
  } catch (e) {
    console.error('Puanlama HatasÄ± (exception):', e);
  }
}

/** @deprecated Use recordUserActionAction instead */
export async function logUserActivityAction(): Promise<void> {
  return recordUserActionAction('add_log');
}

export async function getUserActivitiesAction(userId: string): Promise<ActivityDay[]> {
  const admin = createAdminClient();

  const { data } = await admin
    .from('user_activities')
    .select('date, activity_count, daily_score')
    .eq('user_id', userId)
    .order('date', { ascending: true });

  return (data ?? []) as ActivityDay[];
}

// â”€â”€ Linked Accounts (Multi-Account Switcher) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type LinkedAccount = {
  id: string;
  linked_user_id: string | null;
  linked_email: string;
  linked_name: string | null;
  linked_avatar: string | null;
};

export async function getLinkedAccountsAction(): Promise<LinkedAccount[]> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const admin = createAdminClient();

    // 1. Check if current user is a linked user (child)
    const { data: asLinked } = await admin
      .from('linked_accounts')
      .select('owner_user_id')
      .eq('linked_user_id', user.id)
      .maybeSingle();

    const rootOwnerId = asLinked?.owner_user_id || user.id;

    // 2. Fetch all linked accounts for this cluster
    const { data: clusterLinks } = await admin
      .from('linked_accounts')
      .select('id, linked_user_id, linked_email, linked_name, linked_avatar')
      .eq('owner_user_id', rootOwnerId)
      .order('created_at', { ascending: true });

    let results = (clusterLinks ?? []).map((row: any) => ({
      id: row.id,
      linked_user_id: row.linked_user_id,
      linked_email: row.linked_email,
      linked_name: row.linked_name,
      linked_avatar: row.linked_avatar,
    }));

    // 3. If current user is a child, the OWNER should also be listed as a switchable target!
    if (rootOwnerId !== user.id) {
      const { data: ownerProfile } = await admin
        .from('profiles')
        .select('id, email, full_name, avatar_url')
        .eq('id', rootOwnerId)
        .maybeSingle();
      
      if (ownerProfile) {
        results.push({
          id: 'owner-' + ownerProfile.id,
          linked_user_id: ownerProfile.id,
          linked_email: ownerProfile.email || '',
          linked_name: ownerProfile.full_name || 'Ana Hesap',
          linked_avatar: ownerProfile.avatar_url || null,
        });
      }
    }

    // Filter out the currently active user from the switch list
    return results.filter(r => r.linked_user_id !== user.id);
  } catch (e) {
    console.error("getLinkedAccountsAction error:", e);
    return [];
  }
}

export async function addLinkedAccountAction(
  email: string,
): Promise<{ success: true; account: LinkedAccount } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };
  if (email.toLowerCase() === user.email?.toLowerCase())
    return { error: 'Kendi hesabÄ±nÄ±zÄ± ekleyemezsiniz.' };

  const admin = createAdminClient();

  const { data: foundUserId, error: lookupErr } = await admin.rpc('get_user_id_by_email', { p_email: email.toLowerCase() });
  if (lookupErr || !foundUserId) return { error: 'Bu e-posta adresine sahip bir hesap bulunamadÄ±.' };

  // Fetch both sides' enrichment data.
  const [{ data: authUser }, { data: profile }, { data: ownerAuthUser }, { data: ownerProfile }] = await Promise.all([
    admin.auth.admin.getUserById(foundUserId as string),
    admin.from('profiles').select('full_name, avatar_url').eq('id', foundUserId as string).maybeSingle(),
    admin.auth.admin.getUserById(user.id),
    admin.from('profiles').select('full_name, avatar_url').eq('id', user.id).maybeSingle(),
  ]);

  const linkedEmail   = authUser?.user?.email ?? email.toLowerCase();
  const linkedName    = (profile as any)?.full_name  ?? null;
  const linkedAvatar  = (profile as any)?.avatar_url ?? null;

  // Forward row: current user â†’ target
  const { data: existing } = await admin
    .from('linked_accounts')
    .select('id')
    .eq('owner_user_id', user.id)
    .eq('linked_user_id', foundUserId as string)
    .maybeSingle();

  let linkedId: string;
  if (existing) {
    linkedId = existing.id;
  } else {
    const { data: inserted, error: insertErr } = await admin
      .from('linked_accounts')
      .insert({
        owner_user_id: user.id,
        linked_user_id: foundUserId as string,
        linked_email: linkedEmail,
        linked_name: linkedName,
        linked_avatar: linkedAvatar,
      })
      .select('id')
      .single();
    if (insertErr || !inserted) return { error: insertErr?.message ?? 'Insert failed' };
    linkedId = inserted.id;
  }

  // Reverse row: target â†’ current user (bidirectional so both sides see each other)
  const { data: revExisting } = await admin
    .from('linked_accounts')
    .select('id')
    .eq('owner_user_id', foundUserId as string)
    .eq('linked_user_id', user.id)
    .maybeSingle();

  if (!revExisting) {
    await admin.from('linked_accounts').insert({
      owner_user_id: foundUserId as string,
      linked_user_id: user.id,
      linked_email: ownerAuthUser?.user?.email ?? user.email ?? '',
      linked_name: (ownerProfile as any)?.full_name ?? null,
      linked_avatar: (ownerProfile as any)?.avatar_url ?? null,
    });
  }

  return {
    success: true,
    account: {
      id: linkedId,
      linked_user_id: foundUserId as string,
      linked_email: linkedEmail,
      linked_name:  linkedName,
      linked_avatar: linkedAvatar,
    },
  };
}

export async function removeLinkedAccountAction(
  linkedId: string,
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };
  const admin = createAdminClient();

  // Fetch the row to get both sides' IDs and the stored email of A
  const { data: row, error: fetchErr } = await admin
    .from('linked_accounts')
    .select('owner_user_id, linked_user_id, linked_email')
    .eq('id', linkedId)
    .eq('owner_user_id', user.id)
    .maybeSingle();

  if (fetchErr) return { error: fetchErr.message };
  if (!row) return { error: 'BaÄŸlantÄ± bulunamadÄ±.' };

  const ownerUserId  = user.id;            // A's uuid
  const ownerEmail   = user.email ?? '';   // A's email (fallback key for B's row)
  const targetUserId = row.linked_user_id; // B's uuid (may be null on legacy rows)

  // Delete Aâ†’B (forward row)
  const { error: fwdErr } = await admin
    .from('linked_accounts')
    .delete()
    .eq('owner_user_id', ownerUserId)
    .eq('linked_user_id', targetUserId);
  if (fwdErr) return { error: fwdErr.message };

  // Delete Bâ†’A (reverse row).
  // Some legacy rows may have linked_user_id=null and only store A's email in the
  // `linked_email` column, so we match on either the uuid OR the stored email as fallback.
  if (targetUserId) {
    const { error: revErr } = await admin
      .from('linked_accounts')
      .delete()
      .eq('owner_user_id', targetUserId)
      .or(`linked_user_id.eq.${ownerUserId},linked_email.eq.${ownerEmail}`);
    if (revErr) console.error('[removeLinkedAccount] reverse delete failed:', revErr.message);
  }

  return { success: true };
}

export async function getLeaderboardAction(
  scope: 'global' | 'turkey' | 'university',
  userUniversity?: string | null
): Promise<LeaderboardEntry[]> {
  const admin = createAdminClient();

  let query = admin
    .from('profiles')
    .select('id, full_name, avatar_url, total_score, badges, country, university')
    .order('total_score', { ascending: false })
    .limit(50);

  if (scope === 'turkey') {
    query = (query as any).or('country.ilike.%tÃ¼rkiye%,country.ilike.%turkey%,country.ilike.%turkiye%');
  }
  if (scope === 'university' && userUniversity) {
    query = query.eq('university', userUniversity);
  }

  const { data } = await query;
  return ((data ?? []) as any[]).map((p, i) => ({
    id:          p.id,
    full_name:   p.full_name   ?? 'Anonymous',
    avatar_url:  p.avatar_url  ?? null,
    total_score: p.total_score ?? 0,
    badges:      p.badges      ?? [],
    country:     p.country     ?? null,
    university:  p.university  ?? null,
    rank: i + 1,
  }));
}

// â”€â”€ Follow system â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type FollowUser = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};

export async function followUserAction(
  targetId: string,
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };
  if (user.id === targetId) return { error: 'Cannot follow yourself' };

  // Use admin client to bypass RLS â€” auth check already done above
  const admin = createAdminClient();
  const { error } = await admin
    .from('follows')
    .insert({ follower_id: user.id, following_id: targetId });

  if (error) {
    console.error('[followUserAction] insert failed:', error.code, error.message);
    return { error: error.message };
  }
  revalidatePath(`/user/${targetId}`);
  revalidatePath('/dashboard');
  return { success: true };
}

export async function unfollowUserAction(
  targetId: string,
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  // Use admin client to bypass RLS â€” auth check already done above
  const admin = createAdminClient();
  const { error } = await admin
    .from('follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', targetId);

  if (error) {
    console.error('[unfollowUserAction] delete failed:', error.code, error.message);
    return { error: error.message };
  }
  revalidatePath(`/user/${targetId}`);
  revalidatePath('/dashboard');
  return { success: true };
}

export async function getFollowDataAction(userId: string): Promise<{
  followers: FollowUser[];
  following: FollowUser[];
}> {
  const admin = createAdminClient();

  const [followersRes, followingRes] = await Promise.all([
    admin
      .from('follows')
      .select('follower_id, profiles!follower_id(id, full_name, avatar_url)')
      .eq('following_id', userId),
    admin
      .from('follows')
      .select('following_id, profiles!following_id(id, full_name, avatar_url)')
      .eq('follower_id', userId),
  ]);

  const followers: FollowUser[] = (followersRes.data ?? []).map((r: any) => ({
    id:         r.profiles?.id         ?? r.follower_id,
    full_name:  r.profiles?.full_name  ?? null,
    avatar_url: r.profiles?.avatar_url ?? null,
  }));

  const following: FollowUser[] = (followingRes.data ?? []).map((r: any) => ({
    id:         r.profiles?.id         ?? r.following_id,
    full_name:  r.profiles?.full_name  ?? null,
    avatar_url: r.profiles?.avatar_url ?? null,
  }));

  return { followers, following };
}

export async function removeFollowerAction(
  followerId: string,
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const admin = createAdminClient();
  const { error } = await admin
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', user.id);

  if (error) {
    console.error('[removeFollowerAction]', error.code, error.message);
    return { error: error.message };
  }
  revalidatePath('/dashboard');
  revalidatePath(`/user/${followerId}`);
  revalidatePath(`/user/${user.id}`);
  return { success: true };
}

// â”€â”€ Block system â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function blockUserAction(
  targetId: string,
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };
  if (user.id === targetId) return { error: 'Cannot block yourself' };

  const admin = createAdminClient();

  const { error: blockErr } = await admin
    .from('blocks')
    .insert({ blocker_id: user.id, blocked_id: targetId });

  if (blockErr && blockErr.code !== '23505') {
    console.error('[blockUserAction] insert failed:', blockErr.code, blockErr.message);
    return { error: blockErr.message };
  }

  // Remove all follow relationships between the two users
  await Promise.all([
    admin.from('follows').delete().eq('follower_id', user.id).eq('following_id', targetId),
    admin.from('follows').delete().eq('follower_id', targetId).eq('following_id', user.id),
  ]);

  revalidatePath(`/user/${targetId}`);
  revalidatePath('/dashboard');
  return { success: true };
}

export async function unblockUserAction(
  targetId: string,
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const admin = createAdminClient();
  const { error } = await admin
    .from('blocks')
    .delete()
    .eq('blocker_id', user.id)
    .eq('blocked_id', targetId);

  if (error) {
    console.error('[unblockUserAction]', error.code, error.message);
    return { error: error.message };
  }
  revalidatePath(`/user/${targetId}`);
  revalidatePath('/dashboard/settings');
  return { success: true };
}

// â”€â”€ Project favorites â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function toggleProjectFavoriteAction(
  projectId: string,
): Promise<{ success: true; favorited: boolean } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const admin = createAdminClient();

  const { data: existing } = await admin
    .from('project_favorites')
    .select('student_id')
    .eq('user_id', user.id)
    .eq('project_id', projectId)
    .maybeSingle();

  if (existing) {
    const { error } = await admin
      .from('project_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('project_id', projectId);
    if (error) { console.error('[toggleFavorite] delete:', error.message); return { error: error.message }; }
    revalidatePath('/dashboard/favorites');
    return { success: true, favorited: false };
  } else {
    const { error } = await admin
      .from('project_favorites')
      .insert({ user_id: user.id, project_id: projectId });
    if (error) { console.error('[toggleFavorite] insert:', error.message); return { error: error.message }; }
    revalidatePath('/dashboard/favorites');
    return { success: true, favorited: true };
  }
}

// â”€â”€ Universities â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function searchUniversitiesAction(
  query: string,
): Promise<{ results: { name: string; country: string }[]; error?: string }> {
  if (!query || query.trim().length < 2) return { results: [] };
  const admin = createAdminClient();
  // Uses search_universities() RPC which applies unaccent() on both sides,
  // ensuring Turkish chars like Ä°/Ä±, Å/ÅŸ, Ä/ÄŸ match regardless of case/diacritics.
  const { data, error } = await admin.rpc('search_universities', {
    q: query.trim(),
    lim: 12,
  });
  if (error) {
    console.error('[searchUniversities]', error.message);
    return { results: [], error: error.message };
  }
  return { results: (data ?? []) as { name: string; country: string }[] };
}

export async function getBlockedUsersAction(): Promise<FollowUser[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const admin = createAdminClient();
  const { data } = await admin
    .from('blocks')
    .select('blocked_id, profiles!blocked_id(id, full_name, avatar_url)')
    .eq('blocker_id', user.id);

  return (data ?? []).map((r: any) => ({
    id:         r.profiles?.id         ?? r.blocked_id,
    full_name:  r.profiles?.full_name  ?? null,
    avatar_url: r.profiles?.avatar_url ?? null,
  }));
}

// ── Project Status Management ────────────────────────────────────────────────

export type ProjectStatus = 'todo' | 'in_progress' | 'in_review' | 'completed';

/**
 * Manually mark a project as completed. Only the project owner can do this.
 * Sets status = 'completed' and records end_date.
 */
export async function markProjectCompletedAction(
  projectId: string,
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const ctx = await assertProjectAccess(supabase, projectId);
  if (!ctx) return { error: 'Unauthorized' };
  if (ctx.role !== 'owner') return { error: 'Only the project owner can mark a project as completed.' };

  const today = new Date().toISOString().split('T')[0];
  const { error } = await ctx.admin
    .from('projects')
    .update({ status: 'completed', end_date: today })
    .eq('id', projectId);

  if (error) {
        console.error("SUPABASE ERROR:", error);
        return { error: error.message };
      }

  await logProjectActivity(ctx.admin, projectId, ctx.user.id, 'project_completed', 'Proje tamamlandı olarak işaretlendi.');
  recordUserActionAction('complete_project').catch(() => {});
  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/profile');
  revalidatePath('/', 'layout');
  return { success: true };
}

/**
 * Update the kanban status of a project (owner only).
 * Does NOT touch progress_percentage — that is milestone-only.
 */
export async function updateProjectStatusAction(
  projectId: string,
  status: ProjectStatus,
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const ctx = await assertProjectAccess(supabase, projectId);
  if (!ctx) return { error: 'Unauthorized' };
  if (ctx.role !== 'owner') return { error: 'Only the project owner can change the project status.' };

  const { error } = await ctx.admin
    .from('projects')
    .update({ status })
    .eq('id', projectId);

  if (error) {
        console.error("SUPABASE ERROR:", error);
        return { error: error.message };
      }

  await logProjectActivity(ctx.admin, projectId, ctx.user.id, 'status_changed', `Proje durumu güncellendi: ${status}`);
  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath('/dashboard');
  return { success: true };
}


// ==========================================
// Smart File Annotations
// ==========================================

export async function getFileAnnotationsAction(fileUrl: string) {
  try {
    const supabase = await createClient();
    const admin = createAdminClient();
    const { data: annotations, error } = await admin
      .from('file_annotations')
      .select('*')
      .eq('file_url', fileUrl)
      .order('created_at', { ascending: true });
      
    if (annotations && annotations.length > 0) {
      const authorIds = [...new Set(annotations.map((a: any) => a.author_id))];
      const { data: profiles } = await admin
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', authorIds);
        
      if (profiles) {
        annotations.forEach((a: any) => {
          a.author = profiles.find((p: any) => p.id === a.author_id);
        });
      }
    }

    if (error) {
      console.error('Error fetching annotations:', error);
      return { error: error.message };
    }
    return { data: annotations };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function saveFileAnnotationAction(
  projectId: string,
  fileUrl: string,
  annotationData: any
) {
  try {
    const supabase = await createClient();
    const ctx = await assertProjectAccess(supabase, projectId);
    if (!ctx) return { error: 'Unauthorized' };

    
      const fileName = fileUrl.split('/').pop() || 'Dosya';
      const isNote = annotationData?.type === 'sticky_note';
      await logProjectActivity(ctx.admin, projectId, ctx.user.id, isNote ? 'file_noted' : 'file_annotated', `${ctx.user.user_metadata?.full_name || 'Kullanıcı'} '${fileName}' isimli dosyaya yeni ${isNote ? 'not' : 'işaretleme'} ekledi.`);

      const { data, error } = await ctx.admin
      .from('file_annotations')
      .insert({
        project_id: projectId,
        file_url: fileUrl,
        author_id: ctx.user.id,
        annotation_data: annotationData
      })
      .select('*')
      .single();

    if (error) {
        console.error('Error saving annotation:', error);
        return { error: error.message };
      }

      if (data) {
        const { data: profile } = await ctx.admin
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', ctx.user.id)
          .single();
        if (profile) {
          data.author = profile;
        }
      }
  
      return { data };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteFileAnnotationAction(projectId: string, annotationId: string) {
  try {
    const supabase = await createClient();
    const ctx = await assertProjectAccess(supabase, projectId);
    if (!ctx) return { error: 'Unauthorized' };

    // Delete if the user is the author or project owner
    // First fetch the annotation to check author
    const { data: annotation, error: fetchError } = await ctx.admin
      .from('file_annotations')
      .select('author_id')
      .eq('id', annotationId)
      .single();
      
    if (fetchError || !annotation) return { error: 'Annotation not found' };
    
    if (annotation.author_id !== ctx.user.id && ctx.role !== 'owner') {
      return { error: 'Sadece kendi notunuzu veya proje sahibi silebilir' };
    }

    const { error } = await ctx.admin
      .from('file_annotations')
      .delete()
      .eq('id', annotationId);

    if (error) {
        console.error("SUPABASE ERROR:", error);
        return { error: error.message };
      }
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}


export async function saveFileDrawingsAction(
  projectId: string,
  fileUrl: string,
  drawingData: any
) {
  try {
    const supabase = await createClient();
    const ctx = await assertProjectAccess(supabase, projectId);
    if (!ctx) return { error: 'Unauthorized' };

    // First, check if a drawing record already exists for this file_url
    const { data: existing } = await ctx.admin
      .from('file_annotations')
      .select('id')
      .eq('file_url', fileUrl)
      .eq('annotation_data->>type', 'drawing')
      .maybeSingle();

    let data, error;

    if (existing?.id) {
      // OVERWRITE: Update the existing drawing record completely
      const res = await ctx.admin
        .from('file_annotations')
        .update({
          annotation_data: { type: 'drawing', lines: drawingData },
          author_id: ctx.user.id,
        })
        .eq('id', existing.id)
        .select('*')
        .single();
      data = res.data; error = res.error;
    } else {
      // INSERT: First time saving for this file
      const res = await ctx.admin
        .from('file_annotations')
        .insert({
          project_id: projectId,
          file_url: fileUrl,
          author_id: ctx.user.id,
          annotation_data: { type: 'drawing', lines: drawingData }
        })
        .select('*')
        .single();
      data = res.data; error = res.error;
    }

    if (error) {
      console.error("SUPABASE DRAWING SAVE ERROR:", error);
      return { error: error.message };
    }

    // Activity log
    const fileName = fileUrl.split('/').pop() || 'Dosya';
    await logProjectActivity(ctx.admin, projectId, ctx.user.id, 'file_annotated', `${ctx.user.user_metadata?.full_name || 'Kullanıcı'} '${fileName}' isimli dosyaya çizim/işaretleme güncelledi.`);

    if (data) {
      const { data: profile } = await ctx.admin
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('id', ctx.user.id)
        .single();
      if (profile) data.author = profile;
    }

    return { data };
  } catch (error: any) {
    return { error: error.message };
  }
}


export async function softDeleteProjectAction(projectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in");
  const admin = createAdminClient();
  
  const { data: project } = await admin.from("projects").select('student_id').eq('id', projectId).single();
  if (project?.student_id !== user.id) throw new Error("Unauthorized");

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
  
  const { data: project } = await admin.from("projects").select('student_id').eq('id', projectId).single();
  if (project?.student_id !== user.id) throw new Error("Unauthorized");

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
  
  const { data: project } = await admin.from("projects").select('student_id').eq('id', projectId).single();
  if (project?.student_id !== user.id) throw new Error("Unauthorized");

  const { error } = await admin.from('projects').delete().eq('id', projectId);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/trash/projects');
  return { success: true };
}



export async function softDeleteFileAction(projectId: string, fileUrl: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in");
  const admin = createAdminClient();
  
  const { data: project } = await admin.from('projects').select('student_id, files').eq('id', projectId).single();
    if (!project) throw new Error("Project not found");
    if (project.student_id !== user.id) {
      const { data: isMember } = await admin.from('project_members').select('id').eq('project_id', projectId).eq('student_id', user.id).maybeSingle();
      if (!isMember) throw new Error("Unauthorized");
    }

  const files = (project.files as any[]) || [];
  const updatedFiles = files.map((f: any) => 
    f.url === fileUrl ? { ...f, deleted_at: new Date().toISOString() } : f
  );

  const { error } = await admin.from('projects').update({ files: updatedFiles }).eq('id', projectId);
  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/projects/${projectId}`);
  return { success: true };
}

export async function restoreFileAction(projectId: string, fileUrl: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in");
  const admin = createAdminClient();
  
  const { data: project } = await admin.from('projects').select('student_id, files').eq('id', projectId).single();
    if (!project) throw new Error("Project not found");
    if (project.student_id !== user.id) {
      const { data: isMember } = await admin.from('project_members').select('id').eq('project_id', projectId).eq('student_id', user.id).maybeSingle();
      if (!isMember) throw new Error("Unauthorized");
    }

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
  revalidatePath(`/dashboard/projects/${projectId}`);
  return { success: true };
}

export async function permanentDeleteFileAction(projectId: string, fileUrl: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in");
  const admin = createAdminClient();
  
  const { data: project } = await admin.from('projects').select('student_id, files').eq('id', projectId).single();
    if (!project) throw new Error("Project not found");
    if (project.student_id !== user.id) {
      const { data: isMember } = await admin.from('project_members').select('id').eq('project_id', projectId).eq('student_id', user.id).maybeSingle();
      if (!isMember) throw new Error("Unauthorized");
    }

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

    revalidatePath(`/dashboard/projects/${projectId}`);
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

    revalidatePath(`/dashboard/projects/${projectId}`);
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
