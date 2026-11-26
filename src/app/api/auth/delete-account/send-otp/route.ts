import { NextResponse } from "next/server";
import crypto from "crypto";
import { Resend } from "resend";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user || !user.email) {
      return NextResponse.json(
        { error: "Bu işlem için oturum açmış olmanız gerekiyor." },
        { status: 401 }
      );
    }

    const email = user.email.trim().toLowerCase();
    const otpLookupKey = `delete:${email}`;
    const supabaseAdmin = createAdminClient();

    // 1. Önceki hesap silme kodlarını temizle ve 10 dakika geçerli 6 haneli tek kullanımlık kod üret
    await supabaseAdmin.from("email_otp_codes").delete().ilike("email", otpLookupKey);

    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error: dbError } = await supabaseAdmin
      .from("email_otp_codes")
      .insert([{ email: otpLookupKey, code, expires_at: expiresAt }]);

    if (dbError) {
      console.error("[delete-account/send-otp] DB insert error:", dbError);
      return NextResponse.json(
        { error: "Doğrulama kodu oluşturulamadı. Lütfen tekrar deneyin." },
        { status: 500 }
      );
    }

    // 2. E-posta Gönderimi (Resend)
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      const { error: sendError } = await resend.emails.send({
        from: "Must-b Academy <noreply@mustbacademy.com>",
        to: email,
        subject: "Must-b Academy - Kalıcı Hesap Kapatma Doğrulama Kodunuz",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #fee2e2; border-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #dc2626; text-align: center; margin-top: 0;">Kalıcı Hesap Kapatma Onayı</h2>
            <p style="color: #334155; font-size: 15px; line-height: 1.6;">
              Must-b Academy hesabınızı (<strong>${email}</strong>) kalıcı olarak kapatmak için bir talep aldık. İşlemi onaylamak için aşağıdaki <strong>6 haneli</strong> doğrulama kodunu kullanın:
            </p>
            <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 20px; text-align: center; border-radius: 10px; margin: 22px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #b91c1c;">${code}</span>
            </div>
            <p style="color: #475569; font-size: 13px; line-height: 1.5;">
              • Bu kod <strong>10 dakika</strong> boyunca geçerlidir.<br/>
              • Hesabınız silindiğinde tüm profil verileriniz, projeleriniz ve üyelikleriniz kalıcı olarak kaldırılır.<br/>
              • Bu işlemi siz başlatmadıysanız bu e-postayı dikkate almayın ve şifrenizi güncelleyin.
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-bottom: 0;">
              Must-b Academy (MUST-B Teknoloji A.Ş.) — Hesap Güvenliği Bildirimi
            </p>
          </div>
        `,
      });

      if (sendError) {
        console.error("[delete-account/send-otp] Resend error:", sendError);
        return NextResponse.json(
          { error: `E-posta gönderilemedi: ${sendError.message || "Bilinmeyen hata"}` },
          { status: 500 }
        );
      }
    } else {
      console.log(`\n=================================\nDEV DELETE OTP [${email}]: ${code}\n=================================\n`);
    }

    return NextResponse.json({
      success: true,
      message: "6 haneli doğrulama kodu e-posta adresinize gönderildi.",
    });
  } catch (err: any) {
    console.error("[delete-account/send-otp] Exception:", err);
    return NextResponse.json(
      { error: err?.message || "Doğrulama kodu gönderilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
