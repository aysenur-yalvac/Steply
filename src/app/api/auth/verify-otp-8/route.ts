import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { classifyEmail } from "@/lib/email-classification";

export async function POST(request: Request) {
  const { email, token } = await request.json();

  if (!email || !token || token.length !== 8) {
    return NextResponse.json({ error: "Lutfen 8 haneli gecerli bir OTP kodu girin." }, { status: 400 });
  }

  const cookieStore = await cookies();
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

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "signup",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  // 1. ZORUNLU KILIDI AÇ (Zero Bypass onayi)
  await supabase.auth.updateUser({
    data: { email_verified: true }
  });

  // 2. Domain bazli profil otomasyonu
  const userId = data.user?.id;
  let targetRoute = "/dashboard";
  let role = "student";
  let teacherStatus = null;

  if (userId) {
    const classification = classifyEmail(email);
    if (classification.role) {
      const updates: Record<string, string> = { role: classification.role };
      if (classification.teacherStatus) updates.teacher_status = classification.teacherStatus;
      await supabase.from("profiles").update(updates).eq("id", userId);
      role = classification.role;
      teacherStatus = classification.teacherStatus;
    } else {
      const { data: profile } = await supabase.from("profiles").select("role, teacher_status").eq("id", userId).single();
      role = profile?.role || "student";
      teacherStatus = profile?.teacher_status;
    }
  }

  if (role === "teacher" && teacherStatus === "verified") {
    targetRoute = "/dashboard/teacher";
  } else if (role === "student") {
    targetRoute = "/dashboard/student";
  } else if (role === "teacher") {
    targetRoute = "/dashboard/teacher/pending";
  }

  return NextResponse.json({ success: true, targetRoute });
}
