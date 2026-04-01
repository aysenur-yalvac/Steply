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

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
const BUCKET_ID = "project-files";

/**
 * Self-healing, crash-resistant file upload server action.
 * Never throws. Always returns { success, file } or { error }.
 */
export async function uploadFileAction(
  formData: FormData,
): Promise<{ success: true; file: ProjectFile } | { error: string }> {
  try {
    // ── Step 1: Input validation ─────────────────────────────────────────
    const projectId = formData.get("projectId") as string;
    const file = formData.get("file") as File;

    console.log(`[upload] STEP 1 — projectId="${projectId}" file="${file?.name}" size=${file?.size}`);

    if (!projectId || projectId.trim() === "") {
      return { error: "Kritik Hata: Proje ID forma ulaşmadı." };
    }
    if (!file || typeof file.arrayBuffer !== "function") {
      return { error: "Kritik Hata: Dosya forma ulaşmadı." };
    }
    if (file.size > MAX_FILE_SIZE) {
      return { error: `Dosya boyutu 100MB'ı geçemez. (${(file.size / 1024 / 1024).toFixed(1)} MB)` };
    }

    // ── Step 2: Env check ────────────────────────────────────────────────
    console.log(`[upload] STEP 2 — env check. SERVICE_ROLE_KEY present: ${!!process.env.SUPABASE_SERVICE_ROLE_KEY}`);
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { error: "Sunucu Hatası: Vercel üzerinde SUPABASE_SERVICE_ROLE_KEY eksik!" };
    }

    // ── Step 3: Auth ─────────────────────────────────────────────────────
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log(`[upload] STEP 3 — auth. userId="${user?.id}" authError="${authError?.message ?? "none"}"`);
    if (authError || !user) return { error: "Oturum bulunamadı. Lütfen tekrar giriş yapın." };

    // ── Step 4: Ownership check (admin bypasses RLS) ──────────────────────
    const admin = createAdminClient();
    const { data: project, error: projectError } = await admin
      .from("projects")
      .select("student_id, files")
      .eq("id", projectId)
      .single();
    console.log(`[upload] STEP 4 — db select. found=${!!project} error="${projectError?.message ?? "none"} code="${projectError?.code ?? ""}"`);
    if (projectError) return { error: `DB Select Hatası: ${projectError.message} (Code: ${projectError.code})` };
    if (!project) return { error: `Proje bulunamadı (projectId: ${projectId})` };
    if (project.student_id !== user.id) return { error: "Bu proje için yetkiniz yok." };

    // ── Step 5: Filename sanitisation ────────────────────────────────────
    const safeName = file.name
      .replace(/ğ/g, "g").replace(/Ğ/g, "G")
      .replace(/ü/g, "u").replace(/Ü/g, "U")
      .replace(/ş/g, "s").replace(/Ş/g, "S")
      .replace(/ı/g, "i").replace(/İ/g, "I")
      .replace(/ö/g, "o").replace(/Ö/g, "O")
      .replace(/ç/g, "c").replace(/Ç/g, "C")
      .replace(/[^a-zA-Z0-9.-]/g, "_");
    const filePath = `${projectId}/${Date.now()}-${safeName}`;
    console.log(`[upload] STEP 5 — sanitised path: "${filePath}"`);

    // ── Step 6: Self-healing bucket ──────────────────────────────────────
    console.log(`[upload] STEP 6 — checking bucket "${BUCKET_ID}"`);
    const { data: buckets, error: listErr } = await admin.storage.listBuckets();
    if (listErr) {
      console.error(`[upload] STEP 6 — listBuckets error:`, listErr);
      return { error: `Storage listBuckets Hatası: ${listErr.message}` };
    }
    const bucketExists = buckets?.some((b) => b.id === BUCKET_ID);
    console.log(`[upload] STEP 6 — bucketExists=${bucketExists}`);

    if (!bucketExists) {
      console.log(`[upload] STEP 6 — creating bucket...`);
      const { error: createErr } = await admin.storage.createBucket(BUCKET_ID, {
        public: true,
        fileSizeLimit: MAX_FILE_SIZE,
        allowedMimeTypes: ["image/*", "application/pdf", "application/zip", "text/*", "video/*", "audio/*"],
      });
      if (createErr) {
        console.error(`[upload] STEP 6 — createBucket error:`, createErr);
        return { error: `Bucket oluşturulamadı: ${createErr.message}` };
      }
      console.log(`[upload] STEP 6 — bucket created successfully.`);
    }

    // ── Step 7: Upload to storage ─────────────────────────────────────────
    console.log(`[upload] STEP 7 — uploading to storage...`);
    const fileBuffer = await file.arrayBuffer();
    const { error: storageError } = await admin.storage
      .from(BUCKET_ID)
      .upload(filePath, fileBuffer, {
        contentType: file.type || "application/octet-stream",
        cacheControl: "3600",
        upsert: false,
      });
    if (storageError) {
      console.error(`[upload] STEP 7 — storage upload error:`, storageError);
      return { error: `Storage Upload Hatası: ${storageError.message}` };
    }
    console.log(`[upload] STEP 7 — storage upload success.`);

    // ── Step 8: Get public URL ────────────────────────────────────────────
    const { data: { publicUrl } } = admin.storage.from(BUCKET_ID).getPublicUrl(filePath);
    console.log(`[upload] STEP 8 — publicUrl: "${publicUrl}"`);

    // ── Step 9: Persist to DB ─────────────────────────────────────────────
    const isPrivate = formData.get("isPrivate") === "true";
    const newFile: ProjectFile = {
      id: `${Date.now()}`,
      name: file.name,
      url: publicUrl,
      size: file.size,
      type: file.type,
      uploaded_at: new Date().toISOString(),
      isPrivate,
    };
    const existingFiles = (project.files as ProjectFile[]) || [];

    console.log(`[upload] STEP 9 — updating db. existingCount=${existingFiles.length}`);
    const { data: updatedRow, error: updateError } = await admin
      .from("projects")
      .update({ files: [...existingFiles, newFile] })
      .eq("id", projectId)
      .select();
    if (updateError) {
      console.error(`[upload] STEP 9 — db update error:`, updateError);
      return { error: `DB Update Hatası: ${updateError.message} (Code: ${updateError.code})` };
    }
    if (!updatedRow || updatedRow.length === 0) {
      console.error(`[upload] STEP 9 — updatedRow empty, projectId mismatch?`);
      return { error: "Veritabanı güncellenmedi: Proje ID eşleşmedi." };
    }
    console.log(`[upload] STEP 9 — db update success.`);

    // ── Step 10: Cache invalidation ───────────────────────────────────────
    revalidatePath("/dashboard/projects");
    revalidatePath(`/dashboard/projects/${projectId}`);
    console.log(`[upload] STEP 10 — cache revalidated. DONE ✅`);

    return { success: true, file: newFile };

  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[upload] UNCAUGHT EXCEPTION:", e);
    return { error: `Beklenmedik bir sunucu hatası oluştu: ${msg}` };
  }
}

export async function deleteFileAction(projectId: string, fileUrl: string) {
  console.log("[deleteFileAction] Called:", { projectId });

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("You must be logged in.");
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("student_id, files")
    .eq("id", projectId)
    .single();

  if (projectError || !project) throw new Error("Project not found.");
  if (project.student_id !== user.id) throw new Error("You do not have permission for this action.");

  // Delete from storage using admin client (bypasses RLS)
  const admin = createAdminClient();
  const pathParts = fileUrl.split("project-files/");
  if (pathParts.length > 1) {
    const filePath = pathParts[1];
    console.log("[deleteFileAction] Removing from storage:", filePath);
    const { error: storageError } = await admin.storage.from("project-files").remove([filePath]);
    if (storageError) {
      console.error("[deleteFileAction] Storage removal error:", storageError);
    }
  }

  const existingFiles = (project.files as ProjectFile[]) || [];
  const updatedFiles = existingFiles.filter((f) => f.url !== fileUrl);

  const { error: updateError } = await supabase
    .from("projects")
    .update({ files: updatedFiles })
    .eq("id", projectId);

  if (updateError) {
    throw new Error("Database could not be updated: " + updateError.message);
  }

  console.log("[deleteFileAction] ✅ Complete.");
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

export async function getWatchlistAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, data: [] };

  const { data, error } = await supabase
    .from('mentored_projects')
    .select('project_id, projects(id, title, profiles(full_name))')
    .eq('teacher_id', user.id);
  
  if (error) return { success: false, data: [] };
  
  const formattedData = data.map((item: any) => ({
     id: item.projects?.id,
     title: item.projects?.title,
     studentName: item.projects?.profiles?.full_name || 'Unknown'
  })).filter((i: any) => i.id);

  return { success: true, data: formattedData };
}
