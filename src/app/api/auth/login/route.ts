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
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/login?message=${encodeURIComponent(message)}`,
      { status: 303 }
    )
  }

  // Link account: if owner requested linking, register new user under their linked_accounts
  if (linkAccount === 'true' && ownerId && data.user) {
    try {
      const admin = createAdminClient()
      const { data: profile } = await admin
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', data.user.id)
        .maybeSingle()
      await admin.from('linked_accounts').upsert(
        {
          owner_user_id:  ownerId,
          linked_user_id: data.user.id,
          linked_email:   email.toLowerCase(),
          linked_name:    (profile as any)?.full_name  ?? null,
          linked_avatar:  (profile as any)?.avatar_url ?? null,
        },
        { onConflict: 'owner_user_id,linked_email' },
      )
    } catch (e) {
      console.error('[link_account] failed (non-blocking):', e)
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


