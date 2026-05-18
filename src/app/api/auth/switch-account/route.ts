import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from '@/utils/supabase/admin'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const origin = new URL(request.url).origin

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

  // Verify the target is actually in this user's linked_accounts and fetch stored email
  const { data: link, error: linkError } = await admin
    .from('linked_accounts')
    .select('id, email')
    .eq('owner_id', user.id)
    .eq('linked_user_id', linked_user_id)
    .maybeSingle()

  if (linkError || !link) {
    return NextResponse.json({ error: 'Account not linked to your profile' }, { status: 403 })
  }

  if (!link.email) {
    return NextResponse.json({ error: 'Target account email not found' }, { status: 404 })
  }

  // Generate a one-time magic link for the target account (no email is sent)
  const { data: linkData, error: genError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: link.email,
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
