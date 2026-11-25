import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from '@/utils/supabase/admin'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { getSiteOrigin } from '@/lib/site-url'

export async function POST(request: NextRequest) {
  const origin = getSiteOrigin(request)

  let owner_id: string | undefined
  let linked_uid: string | undefined
  try {
    const body = await request.json()
    owner_id   = body.owner_id
    linked_uid = body.linked_uid
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!owner_id || !linked_uid) {
    return NextResponse.json({ error: 'owner_id and linked_uid are required' }, { status: 400 })
  }

  const cookieStore = await cookies()
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
          } catch {}
        },
      },
    }
  )

  const admin = createAdminClient()

  // Parallel lookup: verify link + fetch owner user email simultaneously
  const [linkRes, ownerRes] = await Promise.all([
    admin
      .from('linked_accounts')
      .select('id')
      .eq('owner_user_id', owner_id)
      .eq('linked_user_id', linked_uid)
      .maybeSingle(),
    admin.auth.admin.getUserById(owner_id),
  ])

  if (linkRes.error) {
    console.error('[switch-to-owner] DB error:', linkRes.error)
    return NextResponse.json({ error: 'Database error: ' + linkRes.error.message }, { status: 500 })
  }

  if (!linkRes.data) {
    return NextResponse.json({ error: 'Link not found. The account may not have been saved correctly.' }, { status: 403 })
  }

  if (ownerRes.error || !ownerRes.data?.user?.email) {
    console.error('[switch-to-owner] owner lookup error:', ownerRes.error)
    return NextResponse.json({ error: 'Owner account not found' }, { status: 404 })
  }

  const ownerEmail = ownerRes.data.user.email

  const { data: linkData, error: genError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: ownerEmail,
    options: { redirectTo: `${origin}/dashboard` },
  })

  if (genError || !linkData?.properties) {
    console.error('[switch-to-owner] generateLink error:', genError)
    return NextResponse.json(
      { error: genError?.message ?? 'Failed to generate switch link' },
      { status: 500 },
    )
  }

  if (linkData.properties.hashed_token) {
    const { data: otpData, error: otpError } = await supabase.auth.verifyOtp({
      token_hash: linkData.properties.hashed_token,
      type: 'magiclink',
    })

    if (!otpError && otpData?.session) {
      const response = NextResponse.json({
        url: `${origin}/dashboard`,
        session: {
          access_token: otpData.session.access_token,
          refresh_token: otpData.session.refresh_token,
        },
      })
      pendingCookies.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options)
      })
      return response
    }
  }

  return NextResponse.json({ url: linkData.properties.action_link || `${origin}/dashboard` })
}
