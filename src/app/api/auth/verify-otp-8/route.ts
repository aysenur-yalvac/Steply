import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { isTeacherEmail } from "@/lib/email-validation";
import { getSiteOrigin } from "@/lib/site-url";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const normalizedEmail = String(body?.email || "").trim().toLowerCase();
    const normalizedCode = String(body?.code ?? body?.token ?? "").trim();

    if (!normalizedEmail || !normalizedCode || normalizedCode.length !== 8) {
      return NextResponse.json(
        { error: "Lütfen 8 haneli geçerli bir doğrulama kodu girin." },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // 1. Kodu veritabanından createAdminClient ile sorgula
    const { data: otpRecords, error: otpError } = await supabaseAdmin
      .from("email_otp_codes")
      .select("*")
      .ilike("email", normalizedEmail)
      .eq("code", normalizedCode)
      .order("created_at", { ascending: false });

    if (otpError || !otpRecords || otpRecords.length === 0) {
      return NextResponse.json(
        { error: "Geçersiz veya süresi dolmuş kod. Lütfen tekrar deneyin." },
        { status: 401 }
      );
    }

    // 2. Süre kontrolünü yerel saat dilimi kayması olmayacak şekilde doğrudan milisaniye üzerinden yap
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
      return !Number.isNaN(expMs) && !(expMs < nowMs);
    });

    if (!validRecord) {
      return NextResponse.json(
        { error: "Geçersiz veya süresi dolmuş kod. Lütfen tekrar deneyin." },
        { status: 401 }
      );
    }

    // Kod kullanıldı, temizle
    await supabaseAdmin.from("email_otp_codes").delete().ilike("email", normalizedEmail);

    // 3. Auth API üzerinden kullanıcıyı bul
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (userError) {
      return NextResponse.json(
        { error: "Kullanıcı veritabanına ulaşılamadı." },
        { status: 500 }
      );
    }

    const user = userData.users.find(
      (u: any) => (u.email || "").trim().toLowerCase() === normalizedEmail
    );
    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı hesabı bulunamadı." },
        { status: 404 }
      );
    }

    // 4. Doğrulama başarılı olduğunda Supabase Admin API ile kullanıcının hesabını onaylı (email_confirm: true) hale getir
    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      email_confirm: true,
      user_metadata: { ...user.user_metadata, email_verified: true },
    });

    // 5. Rol ve okul bilgisini profilde kesinleştir
    let role: string = user.user_metadata?.role || "student";

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role, institution, university")
      .eq("id", user.id)
      .maybeSingle();

    if (!user.user_metadata?.role && profile?.role) {
      role = profile.role;
    }

    const domainIsTeacher = isTeacherEmail(normalizedEmail);
    if (domainIsTeacher && role === "teacher") {
      role = "teacher";
    } else if (role === "teacher" && !domainIsTeacher) {
      console.warn(
        `[verify-otp-8] Kurumsal öğretmen e-postası olmayan ${normalizedEmail} student rolüne düşürüldü.`
      );
      role = "student";
    }

    const metaInstitution =
      user.user_metadata?.institution || user.user_metadata?.university || null;
    const savedInstitution =
      profile?.institution || (profile as any)?.university || metaInstitution;

    const updates: Record<string, any> = { role };
    if (role === "teacher") {
      updates.teacher_status = "verified";
    }
    if (savedInstitution) {
      updates.institution = savedInstitution;
    }

    await supabaseAdmin.from("profiles").update(updates).eq("id", user.id);
    if (savedInstitution) {
      await (supabaseAdmin as any)
        .from("profiles")
        .update({ university: savedInstitution })
        .eq("id", user.id);
    }

    const targetRoute = role === "teacher" ? "/dashboard/teacher" : "/dashboard/student";
    const siteOrigin = getSiteOrigin(request);
    const redirectUrl = `${siteOrigin}${targetRoute}`;

    // 6. Oturumu başlat (hem sunucu çerezi olarak doğrula hem de magicLink döndür)
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: normalizedEmail,
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (linkError || !linkData?.properties?.action_link) {
      return NextResponse.json(
        { error: "Oturum açma bağlantısı oluşturulamadı." },
        { status: 500 }
      );
    }

    if (linkData.properties.hashed_token) {
      try {
        const supabaseServer = await createClient();
        await supabaseServer.auth.verifyOtp({
          token_hash: linkData.properties.hashed_token,
          type: "magiclink",
        });
      } catch (sessionErr) {
        console.warn("[verify-otp-8] Server verifyOtp fallback:", sessionErr);
      }
    }

    return NextResponse.json({
      success: true,
      redirectUrl: targetRoute,
      magicLink: linkData.properties.action_link,
    });
  } catch (err: any) {
    console.error("[verify-otp-8] Unexpected error:", err);
    return NextResponse.json(
      { error: err?.message || "Doğrulama sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
