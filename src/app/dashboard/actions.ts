"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createNotificationAction, recordUserActionAction } from "@/lib/actions";

// ── Project type suggestions ───────────────────────────────────────────────────
/**
 * Returns the top-10 most-used project type names for autocomplete suggestions.
 * Falls back gracefully if the project_types table doesn't exist yet.
 */
export async function getTopProjectTypes(): Promise<string[]> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("project_types")
      .select("name")
      .order("usage_count", { ascending: false })
      .limit(10);
    if (error) return [];
    return (data ?? []).map((r: { name: string }) => r.name);
  } catch {
    return [];
  }
}

/**
 * Tracks usage of a project type: increments count if it exists, inserts if new.
 * Silent on failure — project creation must not be blocked by type tracking.
 */
async function trackProjectType(platform: string): Promise<void> {
  if (!platform || platform === "General") return;
  try {
    const admin = createAdminClient();
    const { data: existing } = await admin
      .from("project_types")
      .select("id, usage_count")
      .eq("name", platform)
      .maybeSingle();

    if (existing) {
      await admin
        .from("project_types")
        .update({ usage_count: existing.usage_count + 1 })
        .eq("id", existing.id);
    } else {
      await admin
        .from("project_types")
        .insert({ name: platform, usage_count: 1 });
    }
  } catch (e) {
    console.warn("[trackProjectType] failed (non-blocking):", e);
  }
}

export async function createProject(formData: FormData): Promise<{ success: true } | { success: false; error: string }> {
  // Helper: safe serializable error message (defined first — used in all branches)
  function safeMsg(err: unknown): string {
    if (!err) return "Unknown error";
    if (typeof err === "object") {
      const e = err as Record<string, unknown>;
      return [e.message, e.details, e.hint, e.code]
        .filter(Boolean)
        .join(" | ") || "Database error";
    }
    return String(err);
  }

  let supabase;
  let user;
  try {
    supabase = await createClient();
    const { data: { user: u }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !u) {
      redirect("/auth/login");
      return { success: false, error: "Oturum bulunamadı." };
    }
    user = u;
  } catch (e) {
    // redirect() throws internally in Next.js — re-throw so it works correctly
    throw e;
  }

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string) || "";
  const progress_percentage = Number(formData.get("progress_percentage")) || 0;
  const priority = (formData.get("priority") as string) || "Medium";
  const platform = (formData.get("platform") as string) || "General";

  const tagsRaw = formData.get("tags") as string | null;
  let tags: string[] = [];
  try { tags = tagsRaw ? (JSON.parse(tagsRaw) as string[]) : []; } catch { tags = []; }

  if (!title) {
    return { success: false, error: "Proje başlığı boş olamaz." };
  }

  // Attempt 1: insert with priority + platform + tags columns
  // (these columns may not exist in older DB schemas — the fallback handles that)
  const { error } = await supabase.from("projects").insert({
    student_id: user.id,
    title,
    description,
    progress_percentage,
    priority,
    platform,
    ...(tags.length > 0 ? { tags } : {}),
  });

  if (error) {
    const msg = safeMsg(error);
    const isMissingColumn =
      msg.toLowerCase().includes("priority") ||
      msg.toLowerCase().includes("platform") ||
      msg.toLowerCase().includes("tags") ||
      (error as any).code === "PGRST204" ||
      (error as any).code === "42703";

    if (isMissingColumn) {
      // priority/platform/tags columns not yet in DB schema —
      // embed metadata into description as fallback, insert only core columns
      const augmentedDesc = [
        description,
        `[Priority: ${priority}]`,
        platform && platform !== "General" ? `[Platform: ${platform}]` : "",
        tags.length > 0 ? `[Tags: ${tags.join(", ")}]` : "",
      ]
        .filter(Boolean)
        .join("\n");

      const { error: error2 } = await supabase.from("projects").insert({
        student_id: user.id,
        title,
        description: augmentedDesc,
        progress_percentage,
      });

      if (error2) {
        console.error("[createProject] FALLBACK_INSERT_ERROR:", error2);
        return { success: false, error: safeMsg(error2) };
      }
    } else {
      console.error("[createProject] INSERT_ERROR:", error);
      return { success: false, error: msg };
    }
  }

  // Track project type usage (non-blocking — silent on failure)
  await trackProjectType(platform);

  // Log weighted activity (10 pts for project creation) — non-blocking
  recordUserActionAction('create_project').catch(() => {});

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard/analytics");
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function updateProgress(formData: FormData) {
  const supabase = await createClient();
  const projectId = formData.get("id") as string;
  const newProgress = parseInt(formData.get("progress") as string);

  const updatePayload: Record<string, unknown> = { progress_percentage: newProgress };
  if (newProgress === 100) {
    updatePayload.end_date = new Date().toISOString().split("T")[0];
  } else {
    updatePayload.end_date = null;
  }

  const { error } = await supabase.from("projects")
    .update(updatePayload)
    .eq('id', projectId);

  if (error) {
    console.error("Update error", error);
  }

  if (newProgress === 100) {
    recordUserActionAction('complete_project').catch(() => {});
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard/analytics");
  revalidatePath('/', 'layout');
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

export async function deleteReviewAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/auth/login");

  const reviewId = formData.get("id") as string;
  const projectId = formData.get("project_id") as string;

  const { error } = await supabase.from("reviews").delete().match({ id: reviewId, reviewer_id: user.id });

  if (error) {
    console.error("Error deleting review:", error);
    return redirect(`/dashboard/projects/${projectId}?error=Could not delete review.`);
  }

  revalidatePath(`/dashboard/projects/${projectId}`);
  return redirect(`/dashboard/projects/${projectId}`);
}

export async function updateProjectDetails(formData: FormData): Promise<{ success: true } | { error: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Oturum bulunamadı. Lütfen tekrar giriş yapın." };

    const projectId   = formData.get("project_id") as string;
    const title       = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();
    const start_date  = (formData.get("start_date") as string) || null;
    const end_date    = (formData.get("end_date") as string) || null;
    const teamRaw     = formData.get("team_members") as string | null;

    let team_members: { id: string; full_name: string }[] | undefined;
    try {
      team_members = teamRaw ? JSON.parse(teamRaw) : undefined;
    } catch {
      return { error: "Geçersiz üye listesi formatı." };
    }

    // Verify ownership using admin client to avoid RLS policy failures during select
    const admin = createAdminClient();
    const { data: existing, error: selectError } = await admin
      .from("projects")
      .select("student_id, description")
      .eq("id", projectId)
      .single();

    if (selectError) return { error: `Proje sorgu hatası: ${selectError.message}` };
    if (!existing) return { error: "Proje bulunamadı." };
    if (existing.student_id !== user.id) return { error: "Bu proje için yetkiniz yok." };

    // Preserve any embedded metadata tags ([Priority: ...], [Platform: ...], etc.)
    const metaTags = ((existing.description ?? "").match(/\[[^\]]+\]/g) || []).join("\n");
    const finalDescription = [description, metaTags].filter(Boolean).join("\n");

    const updatePayload: Record<string, unknown> = {
      title,
      description: finalDescription,
      start_date,
      end_date,
    };

    const { error: updateError } = await admin
      .from("projects")
      .update(updatePayload)
      .eq("id", projectId);

    if (updateError) return { error: `Güncelleme hatası: ${updateError.message}` };

    // Sync project_members relational table when team changes
    if (team_members !== undefined) {
      const { error: deleteError } = await admin
        .from("project_members")
        .delete()
        .eq("project_id", projectId);

      if (deleteError) {
        return { error: `Üye silme hatası: ${deleteError.message} [${deleteError.code}]` };
      }

      if (team_members.length > 0) {
        const rows = team_members.map((m) => ({
          project_id: projectId,
          user_id: m.id,
          role: "member",
        }));
        const { error: insertError } = await admin
          .from("project_members")
          .insert(rows);

        if (insertError) {
          return { error: `Üye ekleme hatası: ${insertError.message} [${insertError.code}]` };
        }
      }
    }

    revalidatePath(`/dashboard/projects/${projectId}`);
    revalidatePath("/dashboard");
    return { success: true };

  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[updateProjectDetails] UNCAUGHT EXCEPTION:", e);
    return { error: `Beklenmedik bir sunucu hatası: ${msg}` };
  }
}

export async function addProjectMemberAction(
  projectId: string,
  userId: string,
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const admin = createAdminClient();

  // Only the project owner can add members
  const { data: project } = await admin
    .from("projects")
    .select("student_id")
    .eq("id", projectId)
    .single();

  if (!project) return { error: "Project not found." };
  if (project.student_id !== user.id) return { error: "Only the project owner can add members." };

  const { error } = await admin
    .from("project_members")
    .upsert({ project_id: projectId, user_id: userId, role: "member" }, { onConflict: "project_id,user_id" });

  if (error) return { error: error.message };

  // Notify the added member — wrapped so it never blocks the success response
  try {
    const { data: projectRow } = await admin
      .from("projects")
      .select("title, profiles!student_id(full_name)")
      .eq("id", projectId)
      .single();
    const projectTitle = (projectRow as any)?.title ?? "a project";
    const ownerName = (projectRow as any)?.profiles?.full_name ?? "A user";
    await createNotificationAction(
      userId,
      'project',
      'Yeni Proje Daveti',
      `${ownerName} sizi "${projectTitle}" projesine ekledi.`,
      projectId,
    );
  } catch (e) {
    console.error('[addProjectMemberAction] Notification error:', e);
  }

  revalidatePath(`/dashboard/projects/${projectId}`);
  return { success: true };
}

export async function removeProjectMemberAction(
  projectId: string,
  userId: string,
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const admin = createAdminClient();

  const { data: project } = await admin
    .from("projects")
    .select("student_id")
    .eq("id", projectId)
    .single();

  if (!project) return { error: "Project not found." };
  if (project.student_id !== user.id) return { error: "Only the project owner can remove members." };

  const { error } = await admin
    .from("project_members")
    .delete()
    .eq("project_id", projectId)
    .eq("user_id", userId);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/projects/${projectId}`);
  return { success: true };
}

export async function searchProfilesAction(
  query: string,
): Promise<{ id: string; full_name: string; avatar_url: string | null; role: string | null }[]> {
  if (!query || query.length < 2) return [];
  // Use the admin (service-role) client so RLS never blocks profile reads.
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("id, full_name, avatar_url, role")
    .ilike("full_name", `%${query}%`)
    .limit(10);
  if (error) console.error("searchProfilesAction error:", error);
  return (data ?? []).map((p) => ({
    id:         p.id,
    full_name:  p.full_name  ?? "",
    avatar_url: p.avatar_url ?? null,
    role:       p.role       ?? null,
  }));
}

export async function toggleProjectPrivacyAction(projectId: string, isPrivate: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: project } = await supabase
    .from("projects")
    .select("student_id")
    .eq("id", projectId)
    .single();

  if (!project || project.student_id !== user.id) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("projects")
    .update({ is_private: isPrivate })
    .eq("id", projectId);

  if (error) {
    if ((error as any).code === "42703" || error.message.toLowerCase().includes("is_private")) {
      console.warn("is_private column not found — skipping privacy toggle.");
      return { success: false, columnMissing: true };
    }
    throw new Error(error.message);
  }

  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath("/dashboard");
  return { success: true };
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
