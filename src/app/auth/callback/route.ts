import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { classifyEmail } from '@/lib/email-classification';
import { getSiteOrigin } from '@/lib/site-url';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = getSiteOrigin(request);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const nextParam = searchParams.get('next');
  const next = (!nextParam || nextParam === '/') ? '/dashboard' : nextParam;
  const destination = next.startsWith('/') ? next : `/${next}`;
  const intent = searchParams.get('intent');
  const isLinkAccount = searchParams.get('link_account') === 'true';
  const isPasswordRecovery = type === 'recovery' || destination.startsWith('/auth/reset-password');

  // 0. Şifre sıfırlama veya e-posta OTP token_hash akışı
  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as 'recovery' | 'email' | 'signup' | 'magiclink' | 'invite' | 'email_change',
    });

    if (!error) {
      return NextResponse.redirect(
        `${origin}${isPasswordRecovery ? '/auth/reset-password' : destination}`
      );
    }

    if (isPasswordRecovery) {
      return NextResponse.redirect(`${origin}/auth/reset-password?error=invalid_link`);
    }
  }

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && isPasswordRecovery) {
      return NextResponse.redirect(`${origin}/auth/reset-password`);
    }

    if (error && isPasswordRecovery) {
      return NextResponse.redirect(`${origin}/auth/reset-password?error=invalid_link`);
    }

    if (!error && data?.user?.email) {
      // 1. GİRİŞ KONTROLÜ (intent === 'login')
      // Kullanıcı Login sayfasından Google ile giriş yapmaya çalışmışsa ancak daha önce kayıtlı bir hesabı yoksa:
      if (intent === 'login' && !isLinkAccount) {
        const createdAt = new Date(data.user.created_at).getTime();
        const lastSignInAt = data.user.last_sign_in_at
          ? new Date(data.user.last_sign_in_at).getTime()
          : createdAt;
        const diffInSeconds = Math.abs((lastSignInAt - createdAt) / 1000);

        // Fark 10 saniyeden azsa hesap az önce otomatik olarak oluşturulmuştur
        const isRecentlyCreated = diffInSeconds < 10;

        // Ayrıca profiles tablosunda kullanıcının geçerli bir kaydı/kurulumu var mı kontrol et
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id, role")
          .eq("id", data.user.id)
          .maybeSingle();

        if (isRecentlyCreated || !existingProfile) {
          console.warn(`[OAuth Callback] Yetkisiz giriş: ${data.user.email} kullanıcısı için kayıt bulunamadı. Otomatik hesap siliniyor.`);

          // A. Supabase'deki delete_self_unregistered RPC fonksiyonunu çağırarak yetkisiz kaydı sil
          try {
            const { error: rpcError } = await supabase.rpc('delete_self_unregistered');
            if (rpcError) {
              console.warn('[OAuth Callback] delete_self_unregistered RPC hatası, admin client ile siliniyor:', rpcError);
              const admin = createAdminClient();
              await admin.from('profiles').delete().eq('id', data.user.id);
              await admin.auth.admin.deleteUser(data.user.id);
            } else {
              console.log('[OAuth Callback] delete_self_unregistered RPC ile yetkisiz kullanıcı başarıyla silindi.');
            }
          } catch (deleteErr) {
            console.error('[OAuth Callback] RPC hatası, admin fallback devrede:', deleteErr);
            try {
              const admin = createAdminClient();
              await admin.from('profiles').delete().eq('id', data.user.id);
              await admin.auth.admin.deleteUser(data.user.id);
            } catch (adminErr) {
              console.error('[OAuth Callback] Admin silme hatası:', adminErr);
            }
          }

          // B. Oturumu derhal kapat
          await supabase.auth.signOut();

          // C. Oturum çerezlerini temizle ve kayıt sayfasına yönlendir
          const response = NextResponse.redirect(`${origin}/auth/register?error=account_not_found`);
          try {
            const cookieStore = await cookies();
            cookieStore.getAll().forEach((cookie) => {
              if (
                cookie.name.startsWith('sb-') ||
                cookie.name.includes('supabase') ||
                cookie.name.includes('auth-token')
              ) {
                response.cookies.delete(cookie.name);
              }
            });
          } catch (cookieErr) {
            console.error('[OAuth Callback] Çerez temizleme hatası:', cookieErr);
          }

          return response;
        }
      }

      // 2. SSO Login / Signup - kurumsal domain ve profil rol kurallarını uygula
      // Doğrulama durumunu güncelle (Zero Bypass güvencesi)
      if (!data.user.user_metadata?.email_verified) {
        await supabase.auth.updateUser({
          data: { email_verified: true },
        });
      }

      // Mevcut profili çek, öğretmense ezme
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();
      const currentRole = profile?.role;
      
      const classification = classifyEmail(data.user.email);
      
      let newRole = classification.role;
      // Eğer kullanıcı zaten öğretmense, onu student/null yapma
      if (currentRole === "teacher") {
        newRole = "teacher";
      }

      if (newRole !== null) {
        const updates: Record<string, string> = { role: newRole };
        if (classification.teacherStatus) {
          updates.teacher_status = classification.teacherStatus;
        }
        await supabase
          .from("profiles")
          .update(updates)
          .eq("id", data.user.id);
      }
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=oauth_failed`);
}