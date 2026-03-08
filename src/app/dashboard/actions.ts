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

  const { error } = await supabase.from("projects").insert({
    student_id: user.id,
    title,
    description,
    github_link,
    start_date,
    end_date,
    progress_percentage,
  });

  if (error) {
    console.error("Proje ekleme hatası:", error);
    return { error: "Proje eklenirken bir hata oluştu." };
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
    console.error("Güncelleme hatası", error);
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
    console.error("Yorum ekleme hatası:", error);
    return redirect(`/dashboard/projects/${projectId}?error=Değerlendirme gönderilemedi.`);
  }

  revalidatePath(`/dashboard/projects/${projectId}`);
  return redirect(`/dashboard/projects/${projectId}`);
}
