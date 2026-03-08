import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const requestUrl = new URL(request.url)
  const formData = await request.formData()
  const email = String(formData.get('email'))
  const password = String(formData.get('password'))
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
          } catch (error) {
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
    let message = 'Giriş başarısız. Bilgilerinizi kontrol edip tekrar deneyin.'
    if (error.message.includes('Email not confirmed')) {
      message = 'Lütfen e-posta adresinizi doğrulayın. Gelen kutunuzu (ve spam klasörünü) kontrol edin.'
    }
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/login?message=${encodeURIComponent(message)}`,
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
  }

  return NextResponse.redirect(`${requestUrl.origin}/dashboard`, {
    status: 303,
  })
}


