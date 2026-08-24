import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { classifyEmail } from "@/lib/email-classification";

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const formData = await request.formData();
  const email = String(formData.get("email")).trim();
  const password = String(formData.get("password"));
  const fullName = String(formData.get("fullName"));
  const requestedRole = String(formData.get("role")); // 'student' or 'teacher'
  const institution = formData.get("institution") ? String(formData.get("institution")) : null;
  const cookieStore = await cookies();

  // 1. E-posta domain siniflandirmasi
  const classification = classifyEmail(email);

  // 2. SERT DOMAIN VE ROL DOGRULAMASI (Guvenlik Kilidi)
  if (requestedRole === "teacher" && classification.role === "student") {
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/register?error=${encodeURIComponent("Ogrenci e-posta adresi ile Ogretmen hesabi olusturulamaz! Lutfen kurumsal ogretmen e-postanizi giriniz.")}`,
      { status: 303 }
    );
  }

  if (requestedRole === "student" && classification.role === "teacher") {
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/register?error=${encodeURIComponent("Ogretmen e-posta adresi ile Ogrenci hesabi olusturulamaz!")}`,
      { status: 303 }
    );
  }

  // 3. Rol Atamasi
  const finalRole = classification.role ?? requestedRole ?? "student";
  const teacherStatus =
    finalRole === "teacher"
      ? (classification.role === "teacher" ? "verified" : "pending")
      : null;

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
      `${requestUrl.origin}/auth/register?error=${encodeURIComponent(error.message)}`,
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

  // GUVENLIK: Otomatik oturum acilmasini KESIN OLARAK engelle! (Zero Bypass)
  // Eger supabase session dondurduyse, aninda cikis yap (cunku OTP onaylanmadi).
  if (data.session) {
    await supabase.auth.signOut();
  }

  // Kullaniciyi dogrudan ve kesin olarak verify-email sayfasina at
  return NextResponse.redirect(
    `${requestUrl.origin}/auth/verify-email?email=${encodeURIComponent(email)}`,
    { status: 303 }
  );
}
