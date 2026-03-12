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

export async function uploadFileAction(projectId: string, fileName: string, fileUrl: string, fileSize: number, fileType: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in.");

  // Proje sahibini kontrol et
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("student_id, files")
    .eq("id", projectId)
    .single();

  if (projectError || !project) throw new Error("Project not found.");
  if (project.student_id !== user.id) throw new Error("You do not have permission for this action.");

  const newFile: ProjectFile = {
    name: fileName,
    url: fileUrl,
    size: fileSize,
    type: fileType,
    uploaded_at: new Date().toISOString(),
  };

  const existingFiles = (project.files as ProjectFile[]) || [];
  const updatedFiles = [...existingFiles, newFile];

  const { error: updateError } = await supabase
    .from("projects")
    .update({ files: updatedFiles })
    .eq("id", projectId);

  if (updateError) throw new Error("Veritabanı güncellenemedi.");

  revalidatePath(`/dashboard/projects/${projectId}`);
  return { success: true };
}

export async function deleteFileAction(projectId: string, fileUrl: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in.");

  // Proje sahibini kontrol et
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("student_id, files")
    .eq("id", projectId)
    .single();

  if (projectError || !project) throw new Error("Project not found.");
  if (project.student_id !== user.id) throw new Error("You do not have permission for this action.");

  // Delete from storage (extract path from URL)
  // Example URL: .../storage/v1/object/public/project-files/project-id/filename
  const pathParts = fileUrl.split('project-files/');
  if (pathParts.length > 1) {
    const filePath = pathParts[1];
    const { error: storageError } = await supabase.storage.from('project-files').remove([filePath]);
    if (storageError) console.error("Storage deletion error:", storageError);
  }

  // Delete from database
  const existingFiles = (project.files as ProjectFile[]) || [];
  const updatedFiles = existingFiles.filter(f => f.url !== fileUrl);

  const { error: updateError } = await supabase
    .from("projects")
    .update({ files: updatedFiles })
    .eq("id", projectId);

  if (updateError) throw new Error("Veritabanı güncellenemedi.");

  revalidatePath(`/dashboard/projects/${projectId}`);
  return { success: true };
}
