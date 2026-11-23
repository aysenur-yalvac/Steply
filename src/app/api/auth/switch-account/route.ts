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
  if (!bodyResult) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  if (!linked_user_id) {
    return NextResponse.json({ error: 'linked_user_id is required' }, { status: 400 })
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()

  // Parallel lookup: check if current user is linked + fetch direct link or target profile
  const [asLinkedRes, directLinkRes, targetProfileRes] = await Promise.all([
    admin
      .from('linked_accounts')
      .select('owner_user_id')
      .eq('linked_user_id', user.id)
      .maybeSingle(),
    admin
      .from('linked_accounts')
      .select('id, linked_email')
      .eq('owner_user_id', user.id)
      .eq('linked_user_id', linked_user_id)
      .maybeSingle(),
    admin
      .from('profiles')
      .select('email')
      .eq('id', linked_user_id)
      .maybeSingle(),
  ])

  const rootOwnerId = asLinkedRes.data?.owner_user_id || user.id
  let targetEmail: string | null = null

  if (linked_user_id === rootOwnerId) {
    targetEmail = targetProfileRes.data?.email ?? null
  } else if (rootOwnerId === user.id && directLinkRes.data?.linked_email) {
    targetEmail = directLinkRes.data.linked_email
  } else {
    const { data: link } = await admin
      .from('linked_accounts')
      .select('id, linked_email')
      .eq('owner_user_id', rootOwnerId)
      .eq('linked_user_id', linked_user_id)
      .maybeSingle()
    if (link) targetEmail = link.linked_email
  }

  if (!targetEmail) {
    return NextResponse.json({ error: 'Account not linked to your profile or email not found' }, { status: 403 })
  }

  const { data: linkData, error: genError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: targetEmail,
    options: {
      redirectTo: `${origin}/dashboard`,
    },
  })

  if (genError || !linkData?.properties?.action_link) {
    console.error('[switch-account] generateLink error:', genError)
    return NextResponse.json(
      { error: genError?.message ?? 'Failed to generate switch link' },
      { status: 500 },
    )
  }

  return NextResponse.json({ url: linkData.properties.action_link })
}
