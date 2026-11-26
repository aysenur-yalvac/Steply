import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { getSiteOrigin } from "@/lib/site-url";

export async function POST(request: Request) {
  try {
    const origin = getSiteOrigin(request);
    const body = await request.json().catch(() => ({}));
    let targetEmail = String(body?.email || "").trim().toLowerCase();

    // If not passed in body, check active authenticated user
    if (!targetEmail) {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email) {
        targetEmail = user.email.trim().toLowerCase();
      }
    }

    if (!targetEmail || !targetEmail.includes("@")) {
      return NextResponse.json(
        { error: "Lütfen geçerli bir e-posta adresi girin." },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // 1. Kullanıcının sistemde kayıtlı olup olmadığını kontrol et
    const { data: profileRow } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .ilike("email", targetEmail)
      .maybeSingle();

    let userExists = Boolean(profileRow);
    if (!userExists) {
      const { data: usersData, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });
      if (!listErr && usersData?.users) {
        userExists = usersData.users.some(
          (u) => (u.email || "").trim().toLowerCase() === targetEmail
        );
      }
    }

    if (!userExists) {
      return NextResponse.json(
        { error: "Bu e-posta adresine ait bir kayıt bulunmamaktadır." },
        { status: 404 }
      );
    }

    // 2. Supabase Admin API ile şifre sıfırlama bağlantısı üret
    const { data: linkData, error: genError } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: targetEmail,
      options: {
        redirectTo: `${origin}/auth/callback?next=/auth/reset-password`,
      },
    });

    if (genError || !linkData?.properties) {
      console.error("[forgot-password] generateLink error:", genError);
      return NextResponse.json(
        { error: genError?.message || "Şifre sıfırlama bağlantısı oluşturulamadı." },
        { status: 500 }
      );
    }

    // token_hash varsa doğrudan /auth/callback?token_hash=...&type=recovery bağlantısı oluştur (PKCE sekme uyumsuzluğunu tamamen önler)
    const hashedToken = linkData.properties.hashed_token;
    const resetLink = hashedToken
      ? `${origin}/auth/callback?token_hash=${encodeURIComponent(hashedToken)}&type=recovery&next=/auth/reset-password`
      : linkData.properties.action_link;

    if (!resetLink) {
      return NextResponse.json(
        { error: "Şifre sıfırlama bağlantısı üretilemedi." },
        { status: 500 }
      );
    }

    // 3. Resend üzerinden şifre sıfırlama e-postasını gönder
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      const { error: sendError } = await resend.emails.send({
        from: "Must-b Academy <noreply@mustbacademy.com>",
        to: targetEmail,
        subject: "Must-b Academy - Şifre Sıfırlama Bağlantınız",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #7C3AFF; text-align: center; margin-top: 0;">Şifre Sıfırlama Talebi</h2>
            <p style="color: #334155; font-size: 15px; line-height: 1.6;">
              Must-b Academy hesabınız (<strong>${targetEmail}</strong>) için şifre sıfırlama talebinde bulundunuz. Yeni şifrenizi belirlemek için aşağıdaki butona tıklayın:
            </p>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${resetLink}" style="display: inline-block; background-color: #7C3AFF; color: #ffffff; font-weight: bold; font-size: 15px; padding: 14px 28px; text-decoration: none; border-radius: 10px;">
                Şifremi Sıfırla
              </a>
            </div>
            <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
              Butona tıklayamıyorsanız aşağıdaki bağlantıyı tarayıcınıza yapıştırabilirsiniz:<br/>
              <a href="${resetLink}" style="color: #7C3AFF; word-break: break-all;">${resetLink}</a>
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-bottom: 0;">
              Bu talebi siz oluşturmadıysanız bu e-postayı güvenle dikkate almayabilirsiniz.<br/>
              Must-b Academy (MUST-B Teknoloji A.Ş.)
            </p>
          </div>
        `,
      });

      if (sendError) {
        console.error("[forgot-password] Resend error:", sendError);
        return NextResponse.json(
          { error: `E-posta gönderilemedi: ${sendError.message || "Bilinmeyen hata"}` },
          { status: 500 }
        );
      }
    } else {
      console.log(`\n=================================\nDEV PASSWORD RESET [${targetEmail}]: ${resetLink}\n=================================\n`);
    }

    return NextResponse.json({
      success: true,
      message:
        "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu (ve gereksiz/spam klasörünü) kontrol edin.",
    });
  } catch (err: any) {
    console.error("[forgot-password] Exception:", err);
    return NextResponse.json(
      { error: err?.message || "Şifre sıfırlama bağlantısı gönderilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
