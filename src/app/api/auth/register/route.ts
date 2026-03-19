import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const requestUrl = new URL(request.url)
  const formData = await request.formData()
  const email = String(formData.get('email'))
  const password = String(formData.get('password'))
  const fullName = String(formData.get('fullName'))
  const role = String(formData.get('role'))
  const institution = formData.get('institution') ? String(formData.get('institution')) : null
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
            // This can be ignored if middleware is refreshing sessions
          }
        },
      },
    }
  )

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
        institution: institution,
      },
    },
  })

  if (error) {
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/register?message=${encodeURIComponent('Registration failed. Email might be in use.')}`,
      { status: 303 }
    )
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
    // Persist institution to profile if provided
    if (institution && data.user) {
      await supabase
        .from('profiles')
        .update({ institution })
        .eq('id', data.user.id)
    }
    return NextResponse.redirect(`${requestUrl.origin}/dashboard`, {
      status: 303,
    })
  }

  // If no session, it means email confirmation is likely required
  return NextResponse.redirect(
    `${requestUrl.origin}/auth/login?message=${encodeURIComponent('Registration successful! Please check your inbox to verify your email address.')}`,
    { status: 303 }
  )
}



