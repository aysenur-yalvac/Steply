import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from '@/utils/supabase/admin'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { getSiteOrigin } from '@/lib/site-url'

export async function POST(request: NextRequest) {
  const origin = getSiteOrigin(request)

  // Parse body & read cookies in parallel
  const [bodyResult, cookieStore] = await Promise.all([
    request.json().catch(() => null),
    cookies(),
  ])

  const linked_user_id: string | undefined = bodyResult?.linked_user_id
  const provided_email: string | undefined = bodyResult?.linked_email
  const saved_refresh_token: string | undefined = bodyResult?.refresh_token

  if (!bodyResult) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  if (!linked_user_id && !provided_email) {
    return NextResponse.json({ error: 'linked_user_id or linked_email is required' }, { status: 400 })
  }

  let pendingCookies: { name: string; value: string; options: any }[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          pendingCookies = cookiesToSet
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // handled on response cookies below
          }
        },
      },
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Oturum bulunamadı. Lütfen tekrar giriş yapın.' }, { status: 401 })
  }

  const admin = createAdminClient()

  // Parallel lookup: check if current user is linked + fetch direct link or target profile
  const [asLinkedRes, directLinkRes, targetProfileRes] = await Promise.all([
    admin
      .from('linked_accounts')
      .select('owner_user_id')
      .eq('linked_user_id', user.id)
      .maybeSingle(),
    linked_user_id
      ? admin
          .from('linked_accounts')
          .select('id, linked_email')
          .eq('owner_user_id', user.id)
          .eq('linked_user_id', linked_user_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    linked_user_id
      ? admin
          .from('profiles')
          .select('email')
          .eq('id', linked_user_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const rootOwnerId = asLinkedRes.data?.owner_user_id || user.id
  let targetEmail: string | null = null

  if (linked_user_id === rootOwnerId) {
    targetEmail = targetProfileRes.data?.email ?? null
  } else if (rootOwnerId === user.id && directLinkRes.data?.linked_email) {
    targetEmail = directLinkRes.data.linked_email
  } else if (linked_user_id) {
    const { data: link } = await admin
      .from('linked_accounts')
      .select('id, linked_email')
      .eq('owner_user_id', rootOwnerId)
      .eq('linked_user_id', linked_user_id)
      .maybeSingle()
    if (link) targetEmail = link.linked_email
  }

  if (!targetEmail && linked_user_id) {
    // Also check if target is in auth.users and linked in either direction
    const { data: reverseLink } = await admin
      .from('linked_accounts')
      .select('id, linked_email')
      .or(`and(owner_user_id.eq.${user.id},linked_user_id.eq.${linked_user_id}),and(owner_user_id.eq.${linked_user_id},linked_user_id.eq.${user.id})`)
      .maybeSingle()

    if (reverseLink) {
      const { data: targetAuth } = await admin.auth.admin.getUserById(linked_user_id)
      targetEmail = targetAuth?.user?.email || targetProfileRes.data?.email || reverseLink.linked_email || null
    }
  }

  // Fallback to provided_email if the user has a valid saved_refresh_token in localStorage
  if (!targetEmail && provided_email && saved_refresh_token) {
    targetEmail = provided_email
  }

  if (!targetEmail) {
    return NextResponse.json(
      {
        error: 'Bu hesabın oturum süresi dolmuş, lütfen şifrenizle tekrar giriş yapın.',
        code: 'SESSION_EXPIRED',
        email: provided_email || '',
      },
      { status: 403 }
    )
  }

  // Strategy 1: If client passed a saved refresh_token from localStorage, try refreshing directly first
  if (saved_refresh_token) {
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
      refresh_token: saved_refresh_token,
    })

    if (
      !refreshError &&
      refreshData?.session &&
      refreshData.user?.email?.toLowerCase() === targetEmail.toLowerCase()
    ) {
      const response = NextResponse.json({
        success: true,
        url: `${origin}/dashboard`,
        session: {
          access_token: refreshData.session.access_token,
          refresh_token: refreshData.session.refresh_token,
        },
        email: targetEmail,
      })
      pendingCookies.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options)
      })
      return response
    }
  }

  // Strategy 2: Generate a fresh server-side magiclink token_hash and immediately exchange it via verifyOtp
  // so SSR auth cookies are set right here on the server without redirecting through /auth/login#access_token
  const { data: linkData, error: genError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: targetEmail,
    options: {
      redirectTo: `${origin}/dashboard`,
    },
  })

  if (genError || !linkData?.properties) {
    console.error('[switch-account] generateLink error:', genError)
    return NextResponse.json(
      {
        error: 'Bu hesabın oturum süresi dolmuş, lütfen şifrenizle tekrar giriş yapın.',
        code: 'SESSION_EXPIRED',
        email: targetEmail,
      },
      { status: 401 }
    )
  }

  const hashedToken = linkData.properties.hashed_token
  if (hashedToken) {
    const { data: otpData, error: otpError } = await supabase.auth.verifyOtp({
      token_hash: hashedToken,
      type: 'magiclink',
    })

    if (!otpError && otpData?.session) {
      const response = NextResponse.json({
        success: true,
        url: `${origin}/dashboard`,
        session: {
          access_token: otpData.session.access_token,
          refresh_token: otpData.session.refresh_token,
        },
        email: targetEmail,
      })
      pendingCookies.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options)
      })
      return response
    }
  }

  // Fallback if action_link is returned
  if (linkData.properties.action_link) {
    return NextResponse.json({
      success: true,
      url: linkData.properties.action_link,
      email: targetEmail,
    })
  }

  return NextResponse.json(
    {
      error: 'Bu hesabın oturum süresi dolmuş, lütfen şifrenizle tekrar giriş yapın.',
      code: 'SESSION_EXPIRED',
      email: targetEmail,
    },
    { status: 401 }
  )
}
