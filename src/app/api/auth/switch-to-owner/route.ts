import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from '@/utils/supabase/admin'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const origin = new URL(request.url).origin

  let owner_id: string | undefined
  try {
    const body = await request.json()
    owner_id = body.owner_id
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!owner_id) {
    return NextResponse.json({ error: 'owner_id is required' }, { status: 400 })
  }

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

  // Verify current user (linked account) belongs to the owner
  const { data: link, error: linkError } = await admin
    .from('linked_accounts')
    .select('linked_email')
    .eq('owner_user_id', owner_id)
    .eq('linked_user_id', user.id)
    .maybeSingle()

  if (linkError || !link) {
    return NextResponse.json({ error: 'Not a linked account of the specified owner' }, { status: 403 })
  }

  // Fetch owner's email to generate magic link
  const { data: ownerUser, error: ownerError } = await admin.auth.admin.getUserById(owner_id)
  if (ownerError || !ownerUser?.user?.email) {
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
