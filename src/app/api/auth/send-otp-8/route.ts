import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { Resend } from "resend";

const RESEND_TEST_MODE_ERROR =
  "E-posta servisi şu an test modundadır; domain doğrulaması tamamlanana kadar yalnızca yönetici e-posta adresine doğrulama kodu gönderilebilir.";

function isResendTestModeError(msg?: string | null): boolean {
  if (!msg) return false;
  const lower = msg.toLowerCase();
  return (
    lower.includes("you can only send testing emails") ||
    lower.includes("testing emails to your own email address") ||
    lower.includes("only send testing emails")
  );
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: "E-posta gerekli." }, { status: 400 });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. 8 Haneli OTP Uret ve Kaydet
    const code = crypto.randomInt(10000000, 99999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const { error: dbError } = await supabase
      .from("email_otp_codes")
      .insert([{ email, code, expires_at: expiresAt }]);

    if (dbError) throw new Error("Kod veritabanina kaydedilemedi.");

    // 2. E-posta Gonderimi
    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      const { error: sendError } = await resend.emails.send({
        from: "Must-b Academy <onboarding@resend.dev>",
        to: email,
        subject: "Must-b Academy - E-posta Doğrulama Kodunuz",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #A020F0; text-align: center;">Must-b Academy'e Hoş Geldiniz!</h2>
            <p style="color: #333; font-size: 16px; line-height: 1.5;">Hesabınızı etkinleştirmek ve kurumsal e-postanızı doğrulamak için aşağıdaki 8 haneli kodu kullanın:</p>
            <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333;">${code}</span>
            </div>
            <p style="color: #666; font-size: 14px;">Bu kod <strong>5 dakika</strong> boyunca geçerlidir.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #999; font-size: 12px; text-align: center;">Bu e-postayı siz talep etmediyseniz, lütfen dikkate almayınız.<br/>Must-b Academy (MUST-B Teknoloji A.Ş.) — Destek: iletisim@must-b.com | Bu e-posta hesap güvenliğiniz için gönderilen işlemsel bir iletidir.</p>
          </div>
        `
      });

      if (sendError) {
        console.error("Resend API Error Detail:", sendError);
        if (isResendTestModeError(sendError.message)) {
          return NextResponse.json({ error: RESEND_TEST_MODE_ERROR }, { status: 403 });
        }
        throw new Error(`Resend hatası: ${sendError.message}`);
      }
    } else {
      // 3. Fallback / Dev Mode
      console.log(`\n=================================\nDEV OTP [${email}]: ${code}\n=================================\n`);
    }

    return NextResponse.json({ success: true, message: "Kod basariyla gonderildi." });
  } catch (err: any) {
    console.error("send-otp-8 Error:", err);
    const msg = err.message || "Bilinmeyen hata";
    if (isResendTestModeError(msg)) {
      return NextResponse.json({ error: RESEND_TEST_MODE_ERROR }, { status: 403 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

