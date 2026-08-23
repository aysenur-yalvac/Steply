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
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  let user: any = null;
  let emailConfirmed = true; // default safe
  try {
    const { data } = await Promise.race([
      supabase.auth.getSession(),
      new Promise<{ data: { session: null } }>((resolve) =>
        setTimeout(() => resolve({ data: { session: null } }), 4500)
      ),
    ]);
    user = data.session?.user ?? null;
    // email_confirmed_at is null when unverified
    emailConfirmed = !!data.session?.user?.email_confirmed_at;
  } catch {
    return supabaseResponse;
  }

  const isProtected = pathname.startsWith(PROTECTED_PREFIX);
  const isAuthPage = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  // Unauthenticated user → login
  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    if (pathname === url.pathname) return supabaseResponse;
    return NextResponse.redirect(url);
  }

  // Authenticated but email NOT confirmed → verify-email wall
  // (Allow them on /auth/verify-email itself)
  if (user && !emailConfirmed && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/verify-email";
    url.searchParams.set("email", user.email ?? "");
    return NextResponse.redirect(url);
  }

  // Authenticated user on auth pages → dashboard
  if (user && isAuthPage) {
    if (request.nextUrl.searchParams.get("link_account") === "true") {
      return supabaseResponse;
    }
    const url = new URL("/dashboard", request.url);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
