"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";

export type ProjectFile = {
  name: string;
  url: string;
  size: number;
  type: string;
  uploaded_at: string;
};

/**
 * Uploads a file to Supabase Storage and saves metadata to the database.
 * Accepts FormData so it can be called from a Client Component as a real Server Action.
 * Uses the admin client for storage to bypass RLS policies.
 */
export async function uploadFileAction(formData: FormData) {
  try {
    const projectId = formData.get("projectId") as string;
    const file = formData.get("file") as File;

    console.log("[uploadFileAction] Called:", { projectId, fileName: file?.name, fileSize: file?.size });

    if (!projectId || !file) {
      throw new Error("Missing projectId or file.");
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error("File size must be less than 5MB.");
    }

    // Auth check via user client
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("You must be logged in.");
    }

    console.log("[uploadFileAction] User:", user.id);

    // Ownership check
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("student_id, files")
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      throw new Error("Project not found.");
    }
    if (project.student_id !== user.id) {
      throw new Error("You do not have permission for this action.");
    }

    // Use admin client for storage upload (bypasses RLS, works even without manual policy setup)
    const admin = createAdminClient();
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${projectId}/${fileName}`;

    console.log("[uploadFileAction] Uploading to storage:", filePath);

    // Ensure the bucket exists (create if missing)
    const { data: buckets } = await admin.storage.listBuckets();
    const bucketExists = buckets?.some((b) => b.id === "project-files");
    if (!bucketExists) {
      console.log("[uploadFileAction] Creating bucket 'project-files'...");
      const { error: bucketErr } = await admin.storage.createBucket("project-files", {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024,
      });
      if (bucketErr) {
        throw new Error("Storage bucket could not be created: " + bucketErr.message);
      }
    }

    // Upload the file using the admin client
    const fileBuffer = await file.arrayBuffer();
    const { error: storageError } = await admin.storage
      .from("project-files")
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (storageError) {
      throw new Error("Storage upload failed: " + storageError.message);
    }

    console.log("[uploadFileAction] Storage upload OK.");

    // Get public URL
    const { data: { publicUrl } } = admin.storage
      .from("project-files")
      .getPublicUrl(filePath);

    // Save metadata to DB
    const newFile: ProjectFile = {
      name: file.name,
      url: publicUrl,
      size: file.size,
      type: file.type,
      uploaded_at: new Date().toISOString(),
    };

    const existingFiles = (project.files as ProjectFile[]) || [];
    const updatedFiles = [...existingFiles, newFile];

    const { error: updateError } = await supabase
      .from("projects")
      .update({ files: updatedFiles })
      .eq("id", projectId);

    if (updateError) {
      throw new Error("Database could not be updated: " + updateError.message);
    }

    console.log("[uploadFileAction] ✅ Complete.");
    revalidatePath(`/dashboard/projects/${projectId}`);
    return { success: true, file: newFile };
  } catch (error: any) {
    throw new Error(error.message || "An unexpected error occurred during file upload.");
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

  if (!id) return { error: "User ID missing" };

  const { error } = await supabase.from('profiles').update({
    full_name,
    phone_number,
    bio,
    github_url,
    linkedin_url,
    avatar_url
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
