import { createAdminClient } from '@/utils/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const origin = new URL(request.url).origin

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

  // Verify the link exists in the DB — the row was written by the login route
  // immediately before this call, so we trust the DB as the source of truth.
  const { data: link, error: linkError } = await admin
    .from('linked_accounts')
    .select('id')
    .eq('owner_id', owner_id)
    .eq('linked_user_id', linked_uid)
    .maybeSingle()

  if (linkError) {
    console.error('[switch-to-owner] DB error:', linkError)
    return NextResponse.json({ error: 'Database error: ' + linkError.message }, { status: 500 })
  }

  if (!link) {
    return NextResponse.json({ error: 'Link not found. The account may not have been saved correctly.' }, { status: 403 })
  }

  // Fetch owner's email to generate magic link
  const { data: ownerUser, error: ownerError } = await admin.auth.admin.getUserById(owner_id)
  if (ownerError || !ownerUser?.user?.email) {
    console.error('[switch-to-owner] owner lookup error:', ownerError)
    return NextResponse.json({ error: 'Owner account not found' }, { status: 404 })
  }

  const { data: linkData, error: genError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: ownerUser.user.email,
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
