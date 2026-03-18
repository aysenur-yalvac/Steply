"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProject(formData: FormData): Promise<{ success: boolean }> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const github_link = formData.get("github_link") as string;
  const start_date = formData.get("start_date") as string;
  const end_date = formData.get("end_date") as string;
  const progress_percentage = parseInt(formData.get("progress_percentage") as string) || 0;

  const { error } = await supabase.from("projects").insert({
    student_id: user.id,
    title,
    description,
    github_link: github_link === "" ? null : github_link,
    start_date: start_date === "" ? null : start_date,
    end_date: end_date === "" ? null : end_date,
    progress_percentage,
  });

  if (error) {
    console.error("FULL_DATABASE_ERROR:", error);
    throw new Error(`Database Error: ${JSON.stringify(error)}`);
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateProgress(formData: FormData) {
  const supabase = await createClient();
  const projectId = formData.get("id") as string;
  const newProgress = parseInt(formData.get("progress") as string);
  
  const { error } = await supabase.from("projects")
    .update({ progress_percentage: newProgress })
    .eq('id', projectId);
    
  if (error) {
    console.error("Update error", error);
  }
  
  revalidatePath("/dashboard");
}

export async function createReview(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/auth/login");

  const projectId = formData.get("project_id") as string;
  const rating = parseInt(formData.get("rating") as string);
  const comment = formData.get("comment") as string;

  const { error } = await supabase.from("reviews").insert({
    project_id: projectId,
    reviewer_id: user.id,
    rating,
    comment,
  });

  if (error) {
    console.error("Error adding review:", error);
    return redirect(`/dashboard/projects/${projectId}?error=Evaluation could not be sent.`);
  }

  revalidatePath(`/dashboard/projects/${projectId}`);
  return redirect(`/dashboard/projects/${projectId}`);
}

export async function deleteProjectAction(projectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const isTeacher = profile?.role === 'teacher';

  if (!isTeacher) {
    const { data: project } = await supabase.from('projects').select('student_id').eq('id', projectId).single();
    if (project?.student_id !== user.id) throw new Error("Unauthorized to delete this project.");
  }

  const { error } = await supabase.from('projects').delete().eq('id', projectId);
  if (error) throw new Error(error.message);

  revalidatePath('/dashboard');
  return { success: true };
}
