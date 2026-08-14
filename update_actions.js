const fs = require("fs");
let content = fs.readFileSync("src/app/dashboard/actions.ts", "utf8");

// Find and replace from deleteProjectAction to end of file
const startIdx = content.indexOf("export async function deleteProjectAction(projectId: string)");
if (startIdx === -1) { console.log("NOT FOUND"); process.exit(1); }

const newContent = content.substring(0, startIdx) + `export async function deleteProjectAction(projectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single();
  const isTeacher = profile?.role === "teacher";

  if (!isTeacher) {
    const { data: project } = await admin.from("projects").select("student_id").eq("id", projectId).single();
    if (project?.student_id !== user.id) throw new Error("Unauthorized to delete this project.");
  }

  const { error } = await admin.from("projects").update({ deleted_at: new Date().toISOString() }).eq("id", projectId);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/trash");
  return { success: true };
}

// ============================================================
// SOFT DELETE / TRASH ACTIONS
// ============================================================

export async function restoreProjectAction(projectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const admin = createAdminClient();
  const { error } = await admin.from("projects").update({ deleted_at: null }).eq("id", projectId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/trash");
  return { success: true };
}

export async function permanentDeleteProjectAction(projectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const admin = createAdminClient();
  const { error } = await admin.from("projects").delete().eq("id", projectId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/trash");
  return { success: true };
}

export async function softDeleteFileAction(projectId: string, fileUrl: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const admin = createAdminClient();
  const { data: project } = await admin.from("projects").select("student_id, files").eq("id", projectId).single();
  if (!project) throw new Error("Project not found.");
  const existingFiles = (project.files as any[]) || [];
  const fileToDelete = existingFiles.find((f: any) => f.url === fileUrl);
  if (!fileToDelete) throw new Error("File not found.");
  await admin.from("deleted_files").insert({ project_id: projectId, file_data: fileToDelete, deleted_by: user.id });
  const updatedFiles = existingFiles.filter((f: any) => f.url !== fileUrl);
  const { error } = await admin.from("projects").update({ files: updatedFiles }).eq("id", projectId);
  if (error) throw new Error(error.message);
  revalidatePath(\`/dashboard/projects/\${projectId}\`);
  revalidatePath("/dashboard/trash");
  return { success: true };
}

export async function restoreFileAction(deletedFileId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const admin = createAdminClient();
  const { data: deletedFile } = await admin.from("deleted_files").select("*").eq("id", deletedFileId).single();
  if (!deletedFile) throw new Error("Deleted file not found.");
  const { data: project } = await admin.from("projects").select("files").eq("id", deletedFile.project_id).single();
  const existingFiles = (project?.files as any[]) || [];
  await admin.from("projects").update({ files: [...existingFiles, deletedFile.file_data] }).eq("id", deletedFile.project_id);
  await admin.from("deleted_files").delete().eq("id", deletedFileId);
  revalidatePath(\`/dashboard/projects/\${deletedFile.project_id}\`);
  revalidatePath("/dashboard/trash");
  return { success: true };
}

export async function permanentDeleteFileAction(deletedFileId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const admin = createAdminClient();
  const { error } = await admin.from("deleted_files").delete().eq("id", deletedFileId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/trash");
  return { success: true };
}

export async function getDeletedProjectsAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single();
  const isTeacher = profile?.role === "teacher";
  let query = admin.from("projects").select("*").not("deleted_at", "is", null).order("deleted_at", { ascending: false });
  if (!isTeacher) query = (query as any).eq("student_id", user.id);
  const { data } = await query;
  return data ?? [];
}

export async function getDeletedFilesAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const admin = createAdminClient();
  const { data } = await admin
    .from("deleted_files")
    .select("*, projects(title, student_id)")
    .eq("deleted_by", user.id)
    .order("deleted_at", { ascending: false });
  return data ?? [];
}
`;

fs.writeFileSync("src/app/dashboard/actions.ts", newContent, "utf8");
console.log("Done! File length:", newContent.split("\n").length);
