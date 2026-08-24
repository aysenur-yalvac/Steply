import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { classifyEmail } from "@/lib/email-classification";

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const formData = await request.formData();
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const fullName = String(formData.get("fullName"));
  const requestedRole = String(formData.get("role")); // kullanicinin sectigi rol
  const institution = formData.get("institution")
    ? String(formData.get("institution"))
    : null;
  const cookieStore = await cookies();

  // E-posta domain siniflandirmasi
  const classification = classifyEmail(email);

  // Kurumsal e-posta → domain'den gelen rol override eder
  const finalRole = classification.role ?? requestedRole ?? "student";
  const teacherStatus =
    classification.role === "teacher"
      ? "verified"          // Kurumsal ogretmen: dogrudan verified
      : classification.role === null && requestedRole === "teacher"
        ? "pending"         // Kisisel mail ile ogretmen: pending (fallback)
        : null;             // Ogrenci: status gereksiz

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
      emailRedirectTo: `${requestUrl.origin}/auth/callback`,
      data: {
        full_name: fullName,
        role: finalRole,
        institution: institution,
        teacher_status: teacherStatus,
      },
    },
  });

  if (error) {
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/register?message=${encodeURIComponent(error.message)}`,
      { status: 303 }
    );
  }

  // Profil tablosunu da hemen guncelle (trigger disilik garantisi)
  if (data.user) {
    const profileUpdate: Record<string, string | null> = {
      role: finalRole,
      institution: institution,
    };
    if (teacherStatus) profileUpdate.teacher_status = teacherStatus;

    await supabase
      .from("profiles")
      .update(profileUpdate)
      .eq("id", data.user.id);
  }

  // Oturum acildiysa (email confirm kapali): dashboard'a git
  if (data.session) {
    return NextResponse.redirect(`${requestUrl.origin}/dashboard`, { status: 303 });
  }

  // Email confirm acik: OTP sayfasina git
  return NextResponse.redirect(
    `${requestUrl.origin}/auth/verify-email?email=${encodeURIComponent(email)}`,
    { status: 303 }
  );
}
