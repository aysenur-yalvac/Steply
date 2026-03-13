"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type ProjectFile = {
  name: string;
  url: string;
  size: number;
  type: string;
  uploaded_at: string;
};

export async function uploadFileAction(
  projectId: string,
  fileName: string,
  fileUrl: string,
  fileSize: number,
  fileType: string
) {
  console.log("[uploadFileAction] Called with:", { projectId, fileName, fileSize, fileType });

  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) {
    console.error("[uploadFileAction] Auth error:", authError);
    throw new Error("Authentication failed: " + authError.message);
  }
  if (!user) {
    console.error("[uploadFileAction] No user session");
    throw new Error("You must be logged in.");
  }
  console.log("[uploadFileAction] User authenticated:", user.id);

  // Check project owner
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("student_id, files")
    .eq("id", projectId)
    .single();

  if (projectError) {
    console.error("[uploadFileAction] Project fetch error:", projectError);
    throw new Error("Project not found: " + projectError.message);
  }
  if (!project) {
    console.error("[uploadFileAction] Project not found for id:", projectId);
    throw new Error("Project not found.");
  }
  if (project.student_id !== user.id) {
    console.error("[uploadFileAction] Ownership mismatch. Project owner:", project.student_id, "Current user:", user.id);
    throw new Error("You do not have permission for this action.");
  }
  console.log("[uploadFileAction] Ownership verified.");

  const newFile: ProjectFile = {
    name: fileName,
    url: fileUrl,
    size: fileSize,
    type: fileType,
    uploaded_at: new Date().toISOString(),
  };

  const existingFiles = (project.files as ProjectFile[]) || [];
  const updatedFiles = [...existingFiles, newFile];

  console.log("[uploadFileAction] Updating DB with", updatedFiles.length, "files.");

  const { error: updateError } = await supabase
    .from("projects")
    .update({ files: updatedFiles })
    .eq("id", projectId);

  if (updateError) {
    console.error("[uploadFileAction] DB update error:", updateError);
    throw new Error("Database could not be updated: " + updateError.message);
  }

  console.log("[uploadFileAction] ✅ Success — file saved to DB.");
  revalidatePath(`/dashboard/projects/${projectId}`);
  return { success: true };
}

export async function deleteFileAction(projectId: string, fileUrl: string) {
  console.log("[deleteFileAction] Called with:", { projectId, fileUrl });

  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error("[deleteFileAction] Auth error:", authError);
    throw new Error("You must be logged in.");
  }

  // Check project owner
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("student_id, files")
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    console.error("[deleteFileAction] Project fetch error:", projectError);
    throw new Error("Project not found.");
  }
  if (project.student_id !== user.id) {
    console.error("[deleteFileAction] Ownership mismatch.");
    throw new Error("You do not have permission for this action.");
  }

  // Delete from storage (extract path from URL)
  const pathParts = fileUrl.split('project-files/');
  if (pathParts.length > 1) {
    const filePath = pathParts[1];
    console.log("[deleteFileAction] Deleting from storage:", filePath);
    const { error: storageError } = await supabase.storage.from('project-files').remove([filePath]);
    if (storageError) {
      console.error("[deleteFileAction] Storage deletion error:", storageError);
    } else {
      console.log("[deleteFileAction] Storage file deleted.");
    }
  }

  const existingFiles = (project.files as ProjectFile[]) || [];
  const updatedFiles = existingFiles.filter(f => f.url !== fileUrl);

  const { error: updateError } = await supabase
    .from("projects")
    .update({ files: updatedFiles })
    .eq("id", projectId);

  if (updateError) {
    console.error("[deleteFileAction] DB update error:", updateError);
    throw new Error("Database could not be updated: " + updateError.message);
  }

  console.log("[deleteFileAction] ✅ Success.");
  revalidatePath(`/dashboard/projects/${projectId}`);
  return { success: true };
}
