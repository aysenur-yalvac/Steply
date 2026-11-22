import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { classifyEmail, validateRoleAndEmail } from "@/lib/email-classification";
import { getSiteOrigin } from "@/lib/site-url";

export async function POST(request: Request) {
  const origin = getSiteOrigin(request);
  const formData = await request.formData();
  const email = String(formData.get("email")).trim();
  const password = String(formData.get("password"));
  const fullName = String(formData.get("fullName"));
  const requestedRole = String(formData.get("role")); // 'student' or 'teacher'
  const institution = formData.get("institution") ? String(formData.get("institution")) : null;
  const cookieStore = await cookies();

  // 1. E-posta domain siniflandirmasi
  const validation = validateRoleAndEmail(email, requestedRole);

  // 2. SERT DOMAIN VE ROL DOGRULAMASI (Guvenlik Kilidi)
  if (!validation.valid) {
    return NextResponse.redirect(
      `${origin}/auth/register?error=${encodeURIComponent(validation.error || "Geçersiz e-posta veya rol.")}`,
      { status: 303 }
    );
  }

  // 3. Rol Atamasi
  const finalRole = requestedRole === "teacher" ? "teacher" : "student";
  const teacherStatus = finalRole === "teacher" ? "verified" : null;

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
        teacher_status: teacherStatus,
        email_verified: false, // Explicitly set custom metadata for zero-bypass
      },
    },
  });

  if (error) {
    return NextResponse.redirect(
      `${origin}/auth/register?error=${encodeURIComponent(error.message.includes('already registered') || error.message.includes('User already registered') ? 'Bu e-posta adresi zaten kayıtlı.' : (error.message.includes('Password should be') ? 'Şifre en az 6 karakter olmalıdır.' : error.message))}`,
      { status: 303 }
    );
  }

  // Profil tablosunu aninda guncelle
  if (data.user) {
    const profileUpdate: Record<string, string | null> = {
      role: finalRole,
      institution: institution,
    };
    if (teacherStatus) profileUpdate.teacher_status = teacherStatus;

    await supabase.from("profiles").update(profileUpdate).eq("id", data.user.id);
  }

  // Ilk 8 haneli custom OTP gonderimini tetikle
  try {
    await fetch(`${origin}/api/auth/send-otp-8`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  } catch (err) {
    console.error("Ilk OTP gonderimi basarisiz:", err);
  }

  // GUVENLIK: Otomatik oturum acilmasini KESIN OLARAK engelle! (Zero Bypass)
  if (data.session) {
    await supabase.auth.signOut();
  }

  // Kullaniciyi dogrudan ve kesin olarak verify-email sayfasina at
  return NextResponse.redirect(
    `${origin}/auth/verify-email?email=${encodeURIComponent(email)}&role=${finalRole}`,
    { status: 303 }
  );
}
