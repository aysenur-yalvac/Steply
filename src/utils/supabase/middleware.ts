import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/callback",
  "/auth/verify-email",
];
const PROTECTED_PREFIX = "/dashboard";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const { pathname } = request.nextUrl;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseUrl.startsWith("http") || !supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  let session: any = null;
  try {
    const result = await Promise.race([
      supabase.auth.getSession(),
      new Promise<{ data: { session: null } }>((resolve) =>
        setTimeout(() => resolve({ data: { session: null } }), 4500)
      ),
    ]);
    session = (result as any).data?.session ?? null;
  } catch {
    return supabaseResponse;
  }

  const user = session?.user ?? null;
  const isProtected = pathname.startsWith(PROTECTED_PREFIX);
  const isAuthPage = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  // ----- 1. Oturum yok → login -----
  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    if (pathname === "/auth/login") return supabaseResponse;
    return NextResponse.redirect(url);
  }

  // ----- 2. OTP Duvarı: E-posta dogrulanmamis → verify-email -----
  if (user && isProtected) {
    const emailConfirmed = !!user.email_confirmed_at;
    if (!emailConfirmed && pathname !== "/auth/verify-email") {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/verify-email";
      url.searchParams.set("email", user.email ?? "");
      return NextResponse.redirect(url);
    }
  }

  // ----- 3. Ogretmen beklemede → teacher/pending -----
  if (user && isProtected && !pathname.startsWith("/dashboard/teacher/pending") && !pathname.startsWith("/dashboard/admin")) {
    // Ogretmen kontrolu: sadece teacher rolu olanlar icin
    if (user.user_metadata?.role === "teacher" || user.app_metadata?.role === "teacher") {
      // Profile'dan teacher_status al (hafif sorgu)
      const { data: profile } = await supabase
        .from("profiles")
        .select("teacher_status, role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "teacher" && profile?.teacher_status !== "verified") {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard/teacher/pending";
        return NextResponse.redirect(url);
      }
    }
  }

  // ----- 4. Auth sayfasinda oturumu acik kullanici → dashboard -----
  if (user && isAuthPage) {
    if (request.nextUrl.searchParams.get("link_account") === "true") {
      return supabaseResponse;
    }
    const url = new URL("/dashboard", request.url);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
