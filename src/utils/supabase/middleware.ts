import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/verify-email",
];
const PROTECTED_PREFIX = "/dashboard";

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Fast-path: do not block static assets or Next.js internal prefetches on public routes
  const isProtected = pathname.startsWith(PROTECTED_PREFIX);
  const isAuthPage = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const isPrefetch =
    request.headers.get("next-router-prefetch") === "1" ||
    request.headers.get("purpose") === "prefetch";

  if (!isProtected && !isAuthPage) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

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
        setTimeout(() => resolve({ data: { session: null } }), 3500)
      ),
    ]);
    session = (result as any).data?.session ?? null;
  } catch {
    return supabaseResponse;
  }

  const user = session?.user ?? null;

  // OTP Duvari (Zero Bypass) — no redundant DB queries on standard navigations
  if (isProtected) {
    const isVerified = user && (!!user.email_confirmed_at || user.user_metadata?.email_verified === true);

    if (!isVerified) {
      if (isPrefetch) return supabaseResponse;
      if (pathname !== "/auth/verify-email") {
        const url = request.nextUrl.clone();
        url.pathname = "/auth/verify-email";
        if (user?.email) url.searchParams.set("email", user.email);
        const userRole = user?.user_metadata?.role || user?.app_metadata?.role;
        if (userRole) url.searchParams.set("role", userRole);
        return NextResponse.redirect(url);
      }
    } else if (pathname.startsWith("/dashboard/teacher") || pathname.startsWith("/dashboard/admin")) {
      // Only query role from DB when entering teacher/admin restricted paths
      const metaRole = user.user_metadata?.role || user.app_metadata?.role;
      let dbRole = metaRole;
      if (!dbRole || dbRole === "student") {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        dbRole = profile?.role || "student";
      }

      if (dbRole === "student") {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard/student";
        return NextResponse.redirect(url);
      }
    }
  }

  // Auth sayfasinda oturumu acik, onayi tamamlanmis kullanici -> dashboard
  if (user && isAuthPage && !isPrefetch && (!!user.email_confirmed_at || user.user_metadata?.email_verified === true)) {
    if (request.nextUrl.searchParams.get("link_account") === "true") {
      return supabaseResponse;
    }
    const url = new URL("/dashboard", request.url);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
