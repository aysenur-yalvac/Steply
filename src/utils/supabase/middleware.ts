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

  // GUVENLIK KILIDI: OTP Duvari (Zero Bypass)
  if (isProtected) {
    // 1. Oturum yok VEYA e-posta dogrulanmamissa (8 haneli OTP asilmamissa) ANINDA geri yolla
    const isVerified = user && (!!user.email_confirmed_at || user.user_metadata?.email_verified === true);
    
    if (!isVerified) {
      if (pathname !== "/auth/verify-email") {
        const url = request.nextUrl.clone();
        url.pathname = "/auth/verify-email";
        if (user?.email) url.searchParams.set("email", user.email);
        return NextResponse.redirect(url);
      }
    } else {
      // 2. E-posta dogrulanmis ancak Ogretmen (pending) kontrolu
      if (!pathname.startsWith("/dashboard/teacher/pending") && !pathname.startsWith("/dashboard/admin")) {
        const userRole = user.user_metadata?.role || user.app_metadata?.role;
        if (userRole === "teacher") {
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
    }
  }

  // Auth sayfasinda oturumu acik, onayi tamamlanmis kullanici -> dashboard
  if (user && isAuthPage && (!!user.email_confirmed_at || user.user_metadata?.email_verified === true)) {
    if (request.nextUrl.searchParams.get("link_account") === "true") {
      return supabaseResponse;
    }
    const url = new URL("/dashboard", request.url);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
