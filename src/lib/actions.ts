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
  const id = formData.get('id') as string;
  const full_name = formData.get('full_name') as string;
  const phone_number = formData.get('phone_number') as string;
  const bio = formData.get('bio') as string;
  const github_url = formData.get('github_url') as string;
  const linkedin_url = formData.get('linkedin_url') as string;
  const twitter_url = formData.get('twitter_url') as string;
  const website_url = formData.get('website_url') as string;
  const avatar_url = formData.get('avatar_url') as string;
  const institution = formData.get('institution') as string;

  if (!id) return { error: "User ID missing" };

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Unauthorized" };
  if (user.id !== id) return { error: "Forbidden: cannot modify another user's profile" };

  const { error } = await supabase.from('profiles').update({
    full_name,
    phone_number,
    bio,
    github_url,
    linkedin_url,
    twitter_url,
    website_url,
    avatar_url,
    institution,
  }).eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/dashboard/profile');
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

