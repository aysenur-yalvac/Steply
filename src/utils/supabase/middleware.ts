import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/auth/login', '/auth/register', '/auth/callback']
const PROTECTED_PREFIX = '/dashboard'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const { pathname } = request.nextUrl

  // Skip Supabase calls if env vars are not configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseUrl.startsWith('http') || !supabaseKey) {
    return supabaseResponse
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  // getSession() with 4.5s timeout - much faster for middleware as it reads local cookie — if Supabase is slow/unreachable, pass through
  // instead of hanging until Vercel's 25s wall-clock limit is hit.
  let user: any = null
  try {
    const { data } = await Promise.race([
      supabase.auth.getSession(),
      new Promise<{ data: { session: null } }>(resolve =>
        setTimeout(() => resolve({ data: { session: null } }), 4500)
      ),
    ])
    user = data.session?.user ?? null
  } catch {
    // Network error or unexpected throw — never block the request
    return supabaseResponse
  }

  const isProtected = pathname.startsWith(PROTECTED_PREFIX)
  const isAuthPage  = PUBLIC_PATHS.some(p => pathname.startsWith(p))

  // Unauthenticated user trying to access a protected route → login
  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    // Avoid redirect loop: if we're already going to /auth/login, pass through
    if (pathname === url.pathname) return supabaseResponse
    return NextResponse.redirect(url)
  }

  // Authenticated user visiting login/register → dashboard
  // Exception: link_account flow keeps the user on the auth page
  if (user && isAuthPage) {
    if (request.nextUrl.searchParams.get('link_account') === 'true') {
      return supabaseResponse
    }
    const url = new URL('/dashboard', request.url)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
