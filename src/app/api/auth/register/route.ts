import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const formData = await request.formData();
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const fullName = String(formData.get("fullName"));
  const role = String(formData.get("role"));
  const institution = formData.get("institution")
    ? String(formData.get("institution"))
    : null;
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

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${requestUrl.origin}/auth/callback`,
      data: {
        full_name: fullName,
        role: role,
        institution: institution,
      },
    },
  });

  if (error) {
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/register?message=${encodeURIComponent(error.message)}`,
      { status: 303 }
    );
  }

  // If Supabase returned a session directly (email confirm disabled in settings)
  if (data.session) {
    // Persist institution to profile if provided
    if (institution && data.user) {
      await supabase
        .from("profiles")
        .update({ institution })
        .eq("id", data.user.id);
    }
    return NextResponse.redirect(`${requestUrl.origin}/dashboard`, {
      status: 303,
    });
  }

  // Email confirmation required — redirect to OTP verification page
  return NextResponse.redirect(
    `${requestUrl.origin}/auth/verify-email?email=${encodeURIComponent(email)}`,
    { status: 303 }
  );
}
