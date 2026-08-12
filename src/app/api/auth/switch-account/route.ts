import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from '@/utils/supabase/admin'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const host  = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? ''
  const proto = request.headers.get('x-forwarded-proto') ?? (host.includes('localhost') ? 'http' : 'https')
  const rawOrigin = `${proto}://${host}`
  // Supabase treats redirectTo without a scheme as a relative path — ensure https://
  const origin = rawOrigin.startsWith('http') ? rawOrigin : `https://${rawOrigin}`

  // Parse body
  let linked_user_id: string | undefined
  try {
    const body = await request.json()
    linked_user_id = body.linked_user_id
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!linked_user_id) {
    return NextResponse.json({ error: 'linked_user_id is required' }, { status: 400 })
  }

  // Verify the requesting user's session
  const cookieStore = await cookies()
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

  // Verify the target belongs to the same cluster
  // 1. Find the root owner for the current user
  const { data: asLinked } = await admin
    .from('linked_accounts')
    .select('owner_user_id')
    .eq('linked_user_id', user.id)
    .maybeSingle()
    
  const rootOwnerId = asLinked?.owner_user_id || user.id;

  let targetEmail = null;

  // Case A: Target is the root owner itself
  if (linked_user_id === rootOwnerId) {
    const { data: ownerProfile } = await admin
      .from('profiles')
      .select('email')
      .eq('id', rootOwnerId)
      .maybeSingle()
    if (ownerProfile) targetEmail = ownerProfile.email;
  } else {
    // Case B: Target is a child of the root owner
    const { data: link } = await admin
      .from('linked_accounts')
      .select('id, linked_email')
      .eq('owner_user_id', rootOwnerId)
      .eq('linked_user_id', linked_user_id)
      .maybeSingle()
      
    if (link) targetEmail = link.linked_email;
  }

  if (!targetEmail) {
    return NextResponse.json({ error: 'Account not linked to your profile or email not found' }, { status: 403 })
  }

  // Generate a one-time magic link for the target account (no email is sent)
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
