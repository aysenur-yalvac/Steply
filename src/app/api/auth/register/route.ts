import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { validateRoleAndEmail, TEACHER_EMAIL_ERROR_MESSAGE } from "@/lib/email-validation";
import { sanitizeInstitution } from "@/lib/utils";
import { getSiteOrigin } from "@/lib/site-url";

export async function POST(request: Request) {
  const origin = getSiteOrigin(request);
  const formData = await request.formData();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const fullName = String(formData.get("fullName") || "").trim();
  const requestedRole = String(formData.get("role") || "student").trim();
  const rawInstitution = formData.get("institution")
    ? String(formData.get("institution")).trim()
    : "";
  const institution = sanitizeInstitution(rawInstitution) || (rawInstitution ? rawInstitution : null);
  const cookieStore = await cookies();
  // Normal yeni kayıt işleminde olası eski hesap bağlama çerezlerini temizle (bağımsız hesap izolasyonu)
  try {
    cookieStore.delete("_steply_link_owner");
    cookieStore.delete("_Must-b Academy_link_owner");
  } catch {}

  // 1. E-posta ve Rol Doğrulaması (Öğretmen kaydında öğrenci ve kişisel mailleri engelle)
  const validation = validateRoleAndEmail(email, requestedRole);
  if (!validation.valid) {
    return NextResponse.redirect(
      `${origin}/auth/register?error=${encodeURIComponent(
        validation.error || TEACHER_EMAIL_ERROR_MESSAGE
      )}`,
      { status: 303 }
    );
  }

  if (password.length < 6) {
    return NextResponse.redirect(
      `${origin}/auth/register?error=${encodeURIComponent("Şifre en az 6 karakter olmalıdır.")}`,
      { status: 303 }
    );
  }

  // 2. Rol Ataması
  const finalRole = requestedRole === "teacher" ? "teacher" : "student";
  const teacherStatus = finalRole === "teacher" ? "verified" : null;

  let createdUserId: string | null = null;

  // 3. Kullanıcıyı oluştur: SUPABASE_SERVICE_ROLE_KEY varsa Admin API ile oluştur
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = createAdminClient();

    // Kullanıcının sistemde gerçekten kayıtlı olup olmadığını kontrol et
    const { data: usersData } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    const existingUser = usersData?.users?.find(
      (u) => (u.email || "").toLowerCase() === email.toLowerCase()
    );

    const { data: profileRow } = await admin
      .from("profiles")
      .select("id")
      .ilike("email", email)
      .maybeSingle();

    const isConfirmedInAuth = !!(existingUser && existingUser.email_confirmed_at);
    const isConfirmedInProfile = !!(profileRow && existingUser?.email_confirmed_at);

    // Yalnızca kullanıcı gerçekten onaylanmış ve kayıtlıysa giriş sayfasına yönlendir
    if (isConfirmedInAuth || isConfirmedInProfile) {
      return NextResponse.redirect(
        `${origin}/auth/login?email=${encodeURIComponent(
          email
        )}&error=${encodeURIComponent(
          "Bu e-posta adresi zaten kayıtlı. Lütfen Giriş Yap sayfasını kullanın."
        )}`,
        { status: 303 }
      );
    }

    // Daha önce yarım kalmış (onaylanmamış) bir kayıt denemesi varsa şifresini ve profilini güncelle
    if (existingUser) {
      const { error: updateError } = await admin.auth.admin.updateUserById(
        existingUser.id,
        {
          password,
          email_confirm: false,
          user_metadata: {
            full_name: fullName,
            role: finalRole,
            institution: institution,
            university: institution,
            teacher_status: teacherStatus,
            email_verified: false,
          },
        }
      );

      if (updateError) {
        return NextResponse.redirect(
          `${origin}/auth/register?error=${encodeURIComponent(updateError.message)}`,
          { status: 303 }
        );
      }
      createdUserId = existingUser.id;
    } else {
      // Yeni kullanıcı oluştur
      const { data: adminData, error: adminError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: false,
        user_metadata: {
          full_name: fullName,
          role: finalRole,
          institution: institution,
          university: institution,
          teacher_status: teacherStatus,
          email_verified: false,
        },
      });

      if (adminError) {
        const rawMsg = adminError.message || "";
        const lowerMsg = rawMsg.toLowerCase();
        let trError = rawMsg;

        if (
          lowerMsg.includes("already registered") ||
          lowerMsg.includes("already been registered") ||
          lowerMsg.includes("user already registered") ||
          lowerMsg.includes("exists")
        ) {
          trError = "Bu e-posta adresi zaten kayıtlı. Lütfen Giriş Yap sayfasını kullanın.";
          return NextResponse.redirect(
            `${origin}/auth/login?email=${encodeURIComponent(email)}&error=${encodeURIComponent(trError)}`,
            { status: 303 }
          );
        } else if (lowerMsg.includes("password should be")) {
          trError = "Şifre en az 6 karakter olmalıdır.";
        } else if (
          lowerMsg.includes("for security purposes") ||
          lowerMsg.includes("rate limit") ||
          lowerMsg.includes("too many requests") ||
          (adminError as any).status === 429
        ) {
          trError = "Güvenlik nedeniyle lütfen 1 dakika bekleyip tekrar deneyin.";
        }

        return NextResponse.redirect(
          `${origin}/auth/register?error=${encodeURIComponent(trError)}`,
          { status: 303 }
        );
      }

      createdUserId = adminData.user?.id ?? null;
    }

    // Profil tablosuna seçilen okul/üniversite bilgisini RLS'e takılmadan eksiksiz kaydet
    if (createdUserId) {
      const profileUpdate: Record<string, any> = {
        full_name: fullName,
        email,
        role: finalRole,
        institution: institution,
      };
      if (teacherStatus) profileUpdate.teacher_status = teacherStatus;

      await admin.from("profiles").upsert({
        id: createdUserId,
        ...profileUpdate,
      });
      if (institution) {
        await (admin as any)
          .from("profiles")
          .update({ university: institution })
          .eq("id", createdUserId);
      }
    }
  } else {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {}
          },
        },
      }
    );

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        data: {
          full_name: fullName,
          role: finalRole,
          institution: institution,
          university: institution,
          teacher_status: teacherStatus,
          email_verified: false,
        },
      },
    });

    if (error) {
      const rawMsg = error.message || "";
      const lowerMsg = rawMsg.toLowerCase();
      const lowerCode = ((error as any).code || "").toLowerCase();
      let trError = rawMsg;

      if (lowerMsg.includes("already registered") || lowerMsg.includes("user already registered")) {
        trError = "Bu e-posta adresi zaten kayıtlı.";
      } else if (lowerMsg.includes("password should be")) {
        trError = "Şifre en az 6 karakter olmalıdır.";
      } else if (
        lowerMsg.includes("for security purposes") ||
        lowerMsg.includes("rate limit") ||
        lowerMsg.includes("over_email_send_rate_limit") ||
        lowerMsg.includes("too many requests") ||
        lowerCode === "over_email_send_rate_limit" ||
        (error as any).status === 429
      ) {
        trError = "Güvenlik nedeniyle lütfen 1 dakika bekleyip tekrar deneyin.";
      }

      return NextResponse.redirect(
        `${origin}/auth/register?error=${encodeURIComponent(trError)}`,
        { status: 303 }
      );
    }

    // Supabase returns identities: [] if user already exists
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      const { data: profileCheck } = await supabase
        .from("profiles")
        .select("id")
        .ilike("email", email)
        .maybeSingle();

      if (profileCheck) {
        return NextResponse.redirect(
          `${origin}/auth/login?email=${encodeURIComponent(
            email
          )}&error=${encodeURIComponent(
            "Bu e-posta adresi zaten kayıtlı. Lütfen Giriş Yap sayfasını kullanın."
          )}`,
          { status: 303 }
        );
      }
    }

    createdUserId = data.user?.id ?? null;

    if (createdUserId) {
      const profileUpdate: Record<string, any> = {
        full_name: fullName,
        role: finalRole,
        institution: institution,
      };
      if (teacherStatus) profileUpdate.teacher_status = teacherStatus;
      await supabase.from("profiles").update(profileUpdate).eq("id", createdUserId);
    }

    if (data.session) {
      await supabase.auth.signOut();
    }
  }

  // 4. Tek bir 6 haneli OTP üretip Must-b Academy <noreply@mustbacademy.com> üzerinden gönder
  try {
    await fetch(`${origin}/api/auth/send-otp-8`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role: finalRole }),
    });
  } catch (err) {
    console.error("Ilk OTP gonderimi basarisiz:", err);
  }

  return NextResponse.redirect(
    `${origin}/auth/verify-email?email=${encodeURIComponent(email)}&role=${finalRole}`,
    { status: 303 }
  );
}
