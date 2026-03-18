"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProject(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/auth/login");
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const github_link = formData.get("github_link") as string;
  const start_date = formData.get("start_date") as string;
  const end_date = formData.get("end_date") as string;
  const progress_percentage = parseInt(formData.get("progress_percentage") as string) || 0;

  // Dynamic fallback strategy for user_id vs student_id drifts
  let { error } = await supabase.from("projects").insert({
    user_id: user.id,
    title,
    description,
    progress_percentage,
  });

  if (error && error.code === '42703') {
    console.log("Fallback to student_id insert...");
    const retryInsert = await supabase.from("projects").insert({
      student_id: user.id,
      title,
      description,
      progress_percentage,
    });
    error = retryInsert.error;
  }

  if (error) {
    console.error("FULL_DATABASE_ERROR:", error);
    return { error: `Database Error [${error.code}]: ${error.message} (Verify column name for user_id/student_id)` };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
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
