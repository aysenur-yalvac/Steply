import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(request: Request) {
  const requestUrl = new URL(request.url)
  const formData = await request.formData()
  const email = String(formData.get('email'))
  const password = String(formData.get('password'))
  const linkAccount = formData.get('link_account') as string | null
  const ownerId     = formData.get('owner_id')     as string | null
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore if middleware is refreshing sessions
          }
        },
      },
    }
  )

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    let message = 'Login failed. Please check your information and try again.'
    if (error.message.includes('Email not confirmed')) {
      message = 'Please verify your email address. Check your inbox (and spam folder).'
    }
    // Keep link_account params so middleware doesn't redirect the logged-in user away.
    const base = linkAccount === 'true' && ownerId
      ? `${requestUrl.origin}/auth/login?link_account=true&owner_id=${ownerId}`
      : `${requestUrl.origin}/auth/login`
    return NextResponse.redirect(`${base}&message=${encodeURIComponent(message)}`, { status: 303 })
  }

  // Resolve owner_id: form hidden input is the primary source; cookie is the fallback
  // in case the client component failed to render the hidden inputs.
  const cookieOwnerId = cookieStore.get('_steply_link_owner')?.value ?? null
  const resolvedOwnerId  = ownerId ?? (linkAccount === 'true' ? cookieOwnerId : null) ?? cookieOwnerId
  const resolvedLinkMode = linkAccount === 'true' || (!!cookieOwnerId && !!resolvedOwnerId)

  // Link account: if owner requested linking, register new user under their linked_accounts
  // then switch back to the owner's session via magic link so the sidebar refreshes correctly
  if (resolvedLinkMode && resolvedOwnerId && data.user) {
    // Helper: build error redirect that keeps link_account=true so middleware
    // doesn't intercept the page (logged-in users are normally sent to /dashboard).
    const linkErrorUrl = (msg: string) =>
      `${requestUrl.origin}/auth/login?link_account=true&owner_id=${resolvedOwnerId}&message=${encodeURIComponent(msg)}`

    try {
      const admin = createAdminClient()

      // Check first to avoid duplicate-key errors regardless of which
      // unique constraints exist on the table.
      const { data: existingLink } = await admin
        .from('linked_accounts')
        .select('id')
        .eq('owner_id', resolvedOwnerId)
        .eq('linked_user_id', data.user.id)
        .maybeSingle()

      if (!existingLink) {
        // Fetch both profiles for enrichment columns
        const [{ data: linkedProfile }, { data: ownerAuthUser }, { data: ownerProfile }] = await Promise.all([
          admin.from('profiles').select('full_name, avatar_url').eq('id', data.user.id).maybeSingle(),
          admin.auth.admin.getUserById(resolvedOwnerId),
          admin.from('profiles').select('full_name, avatar_url').eq('id', resolvedOwnerId).maybeSingle(),
        ])

        // Forward row: owner → linked
        const { error: fwdError } = await admin
          .from('linked_accounts')
          .insert({
            owner_id: resolvedOwnerId,
            linked_user_id: data.user.id,
            email: data.user.email ?? '',
            display_name: (linkedProfile as any)?.full_name ?? null,
            avatar_url: (linkedProfile as any)?.avatar_url ?? null,
          })

        if (fwdError) {
          console.error('[link_account] forward insert failed:', fwdError)
          return NextResponse.redirect(linkErrorUrl('Hesap bağlanamadı: ' + fwdError.message), { status: 303 })
        }

        // Reverse row: linked → owner (so B can also see A in their switcher)
        const { data: revExisting } = await admin
          .from('linked_accounts')
          .select('id')
          .eq('owner_id', data.user.id)
          .eq('linked_user_id', resolvedOwnerId)
          .maybeSingle()

        if (!revExisting) {
          await admin.from('linked_accounts').insert({
            owner_id: data.user.id,
            linked_user_id: resolvedOwnerId,
            email: ownerAuthUser?.user?.email ?? '',
            display_name: (ownerProfile as any)?.full_name ?? null,
            avatar_url: (ownerProfile as any)?.avatar_url ?? null,
          })
        }
      }

      // Both rows written (or already existed) — proceed

      // Clear the helper cookie and redirect to link-complete.
      // Pass linked_uid so switch-to-owner can verify the DB row directly
      // without relying on the session cookie (which may lag after login redirect).
      const res = NextResponse.redirect(
        `${requestUrl.origin}/auth/link-complete?owner_id=${resolvedOwnerId}&linked_uid=${data.user.id}`,
        { status: 303 },
      )
      res.cookies.delete('_steply_link_owner')
      return res
    } catch (e) {
      console.error('[link_account] failed:', e)
      return NextResponse.redirect(
        linkErrorUrl('Hesap bağlama sırasında beklenmeyen bir hata oluştu.'),
        { status: 303 },
      )
    }
  }

  // Manually set cookies if session exists to ensure persistence
  if (data.session) {
    cookieStore.set('sb-access-token', data.session.access_token, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: data.session.expires_in,
    })
    cookieStore.set('sb-refresh-token', data.session.refresh_token, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })
  }

  return NextResponse.redirect(`${requestUrl.origin}/dashboard`, {
    status: 303,
  })
}


