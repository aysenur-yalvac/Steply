import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user || !user.email) {
      return NextResponse.json(
        { error: "Oturumunuz doğrulanamadı. Lütfen tekrar giriş yapın." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const normalizedCode = String(body?.code || "").trim();

    if (!/^\d{6}$/.test(normalizedCode)) {
      return NextResponse.json(
        { error: "Lütfen e-postanıza gönderilen 6 haneli doğrulama kodunu eksiksiz girin." },
        { status: 400 }
      );
    }

    const userId = user.id;
    const email = user.email.trim().toLowerCase();
    const otpLookupKey = `delete:${email}`;
    const supabaseAdmin = createAdminClient();

    // 1. 6 haneli kodu veritabanından kontrol et
    const { data: otpRecords, error: otpError } = await supabaseAdmin
      .from("email_otp_codes")
      .select("*")
      .ilike("email", otpLookupKey)
      .eq("code", normalizedCode)
      .order("created_at", { ascending: false });

    if (otpError || !otpRecords || otpRecords.length === 0) {
      return NextResponse.json(
        { error: "Girdiğiniz doğrulama kodu hatalı veya geçersiz. Lütfen kontrol edip tekrar deneyin." },
        { status: 400 }
      );
    }

    // 2. 10 dakikalık süre kontrolü (saat dilimi bağımsız milisaniye hesabı)
    const nowMs = Date.now();
    const validRecord = otpRecords.find((rec: any) => {
      if (!rec.expires_at) return true;
      const rawExp = String(rec.expires_at).trim();
      const isoExp =
        rawExp.endsWith("Z") || /[+-]\d{2}:?\d{2}$/.test(rawExp)
          ? rawExp
          : `${rawExp.replace(" ", "T")}Z`;
      const expMsUtc = new Date(isoExp).getTime();
      const expMsDirect = new Date(rawExp).getTime();
      const expMs = !Number.isNaN(expMsUtc) ? expMsUtc : expMsDirect;
      return !Number.isNaN(expMs) && expMs >= nowMs;
    });

    if (!validRecord) {
      return NextResponse.json(
        { error: "Doğrulama kodunun süresi dolmuş (10 dakika). Lütfen yeni bir kod isteyin." },
        { status: 400 }
      );
    }

    // 3. Kullanılan OTP kodlarını temizle
    await supabaseAdmin.from("email_otp_codes").delete().ilike("email", otpLookupKey);
    await supabaseAdmin.from("email_otp_codes").delete().ilike("email", email);

    // 4. Kullanıcının sahip olduğu projeleri ve ilişkili kayıtları Foreign Key sırasına uygun olarak temizle
    const safeRun = async (fn: () => PromiseLike<any>) => {
      try {
        await fn();
      } catch (e) {
        console.warn("[delete-account/confirm] non-fatal cleanup warning:", e);
      }
    };

    const { data: ownedProjects } = await supabaseAdmin
      .from("projects")
      .select("id")
      .eq("student_id", userId);

    const ownedProjectIds = (ownedProjects ?? []).map((p: any) => p.id as string).filter(Boolean);

    if (ownedProjectIds.length > 0) {
      await Promise.all([
        safeRun(() => supabaseAdmin.from("project_tasks").delete().in("project_id", ownedProjectIds)),
        safeRun(() => supabaseAdmin.from("project_members").delete().in("project_id", ownedProjectIds)),
        safeRun(() => supabaseAdmin.from("project_discussions").delete().in("project_id", ownedProjectIds)),
        safeRun(() => supabaseAdmin.from("project_activities").delete().in("project_id", ownedProjectIds)),
        safeRun(() => supabaseAdmin.from("project_notes").delete().in("project_id", ownedProjectIds)),
        safeRun(() => supabaseAdmin.from("project_commits").delete().in("project_id", ownedProjectIds)),
        safeRun(() => supabaseAdmin.from("project_github_repos").delete().in("project_id", ownedProjectIds)),
        safeRun(() => supabaseAdmin.from("project_favorites").delete().in("project_id", ownedProjectIds)),
        safeRun(() => supabaseAdmin.from("deleted_files").delete().in("project_id", ownedProjectIds)),
        safeRun(() => supabaseAdmin.from("reviews").delete().in("project_id", ownedProjectIds)),
      ]);

      await safeRun(() => supabaseAdmin.from("projects").delete().eq("student_id", userId));
    }

    // 5. Kullanıcının diğer projelerdeki üyeliklerini ve tüm kullanıcı tablolarındaki kayıtlarını temizle
    await Promise.all([
      safeRun(() => supabaseAdmin.from("project_members").delete().eq("user_id", userId)),
      safeRun(() => supabaseAdmin.from("project_tasks").update({ assigned_to: null }).eq("assigned_to", userId)),
      safeRun(() => supabaseAdmin.from("project_discussions").delete().eq("user_id", userId)),
      safeRun(() => supabaseAdmin.from("project_activities").delete().eq("user_id", userId)),
      safeRun(() => supabaseAdmin.from("project_notes").delete().eq("teacher_id", userId)),
      safeRun(() => supabaseAdmin.from("project_favorites").delete().eq("user_id", userId)),
      safeRun(() => supabaseAdmin.from("reviews").delete().eq("reviewer_id", userId)),
      safeRun(() => supabaseAdmin.from("notifications").delete().eq("user_id", userId)),
      safeRun(() => supabaseAdmin.from("messages").delete().or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)),
      safeRun(() => supabaseAdmin.from("follows").delete().or(`follower_id.eq.${userId},following_id.eq.${userId}`)),
      safeRun(() => supabaseAdmin.from("blocks").delete().or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`)),
      safeRun(() => supabaseAdmin.from("linked_accounts").delete().or(`owner_user_id.eq.${userId},linked_user_id.eq.${userId}`)),
      safeRun(() => supabaseAdmin.from("user_activities").delete().eq("user_id", userId)),
      safeRun(() => supabaseAdmin.from("agenda_tasks").delete().eq("user_id", userId)),
      safeRun(() => supabaseAdmin.from("deleted_files").delete().eq("deleted_by", userId)),
      safeRun(() => (supabaseAdmin as any).from("assignment_submissions").delete().eq("student_id", userId)),
      safeRun(() => (supabaseAdmin as any).from("assignments").delete().eq("teacher_id", userId)),
      safeRun(() => (supabaseAdmin as any).from("class_members").delete().eq("student_id", userId)),
      safeRun(() => (supabaseAdmin as any).from("classes").delete().eq("teacher_id", userId)),
    ]);

    // 6. Kullanıcının profiles kaydını sil
    await safeRun(() => supabaseAdmin.from("profiles").delete().eq("id", userId));

    // 7. Supabase Auth hesabını tamamen sil (aynı e-posta ile yeniden kayıt olabilmesi için)
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteAuthError) {
      console.error("[delete-account/confirm] auth.admin.deleteUser error:", deleteAuthError);
      return NextResponse.json(
        { error: "Hesap kimlik kaydı silinirken bir hata oluştu: " + deleteAuthError.message },
        { status: 500 }
      );
    }

    // 8. Mevcut oturumu ve çerezleri temizle
    try {
      await supabase.auth.signOut();
    } catch {}

    const response = NextResponse.json({
      success: true,
      message: "Hesabınız ve tüm verileriniz kalıcı olarak silindi.",
    });

    try {
      const cookieStore = await cookies();
      cookieStore.getAll().forEach((c) => {
        if (
          c.name.startsWith("sb-") ||
          c.name.includes("supabase") ||
          c.name.includes("auth-token") ||
          c.name.includes("_link_owner")
        ) {
          response.cookies.delete(c.name);
        }
      });
    } catch {}

    return response;
  } catch (err: any) {
    console.error("[delete-account/confirm] Exception:", err);
    return NextResponse.json(
      { error: err?.message || "Hesap silme işlemi sırasında beklenmeyen bir hata oluştu." },
      { status: 500 }
    );
  }
}
