import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_BYPASS_PATHS = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/verify-email",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/callback",
  "/auth/link-complete",
  "/auth/logout",
];
const PROTECTED_PREFIX = "/dashboard";

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Completely bypass middleware auth & session checks on /, /auth/*, and all non-protected routes
  // so RSC (_rsc) payloads and client-side transitions never stall or enter redirect loops.
  const isPublicOrAuth =
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    PUBLIC_BYPASS_PATHS.some((p) => pathname === p || (p !== "/" && pathname.startsWith(p)));

  const isProtected = pathname.startsWith(PROTECTED_PREFIX);

  if (isPublicOrAuth || !isProtected) {
    return NextResponse.next({ request });
  }

  const isPrefetch =
    request.headers.get("next-router-prefetch") === "1" ||
    request.headers.get("purpose") === "prefetch";

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

  return supabaseResponse;
}
