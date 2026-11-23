import { createAdminClient } from '@/utils/supabase/admin'
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

  const { data: linkData, error: genError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: ownerRes.data.user.email,
    options: { redirectTo: `${origin}/dashboard` },
  })

  if (genError || !linkData?.properties?.action_link) {
    console.error('[switch-to-owner] generateLink error:', genError)
    return NextResponse.json(
      { error: genError?.message ?? 'Failed to generate switch link' },
      { status: 500 },
    )
  }

  return NextResponse.json({ url: linkData.properties.action_link })
}
