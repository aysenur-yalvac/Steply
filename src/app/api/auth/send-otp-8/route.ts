import { NextResponse } from "next/server";
import crypto from "crypto";
import { Resend } from "resend";
import { createAdminClient } from "@/utils/supabase/admin";
import { validateRoleAndEmail } from "@/lib/email-validation";

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
    const body = await request.json();
    const rawEmail = body?.email;
    const requestedRole = body?.role ? String(body.role).trim() : null;

    if (!rawEmail) {
      return NextResponse.json({ error: "E-posta gerekli." }, { status: 400 });
    }

    const email = String(rawEmail).trim().toLowerCase();

    if (requestedRole) {
      const roleCheck = validateRoleAndEmail(email, requestedRole);
      if (!roleCheck.valid) {
        return NextResponse.json({ error: roleCheck.error }, { status: 400 });
      }
    }

    const supabaseAdmin = createAdminClient();

    // 1. Önceki kodları temizle ve tek bir 6 haneli OTP üretip kaydet (RLS'e takılmadan)
    await supabaseAdmin.from("email_otp_codes").delete().ilike("email", email);

    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error: dbError } = await supabaseAdmin
      .from("email_otp_codes")
      .insert([{ email, code, expires_at: expiresAt }]);

    if (dbError) {
      console.error("[send-otp-8] DB insert error:", dbError);
      throw new Error("Kod veritabanina kaydedilemedi.");
    }

    // 2. E-posta Gonderimi
    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      const { error: sendError } = await resend.emails.send({
        from: "Must-b Academy <noreply@mustbacademy.com>",
        to: email,
        subject: "Must-b Academy - 6 Haneli E-posta Doğrulama Kodunuz",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #7C3AFF; text-align: center;">Must-b Academy'e Hoş Geldiniz!</h2>
            <p style="color: #333; font-size: 16px; line-height: 1.5;">Hesabınızı etkinleştirmek ve kurumsal e-postanızı doğrulamak için aşağıdaki 6 haneli kodu kullanın:</p>
            <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #7C3AFF;">${code}</span>
            </div>
            <p style="color: #666; font-size: 14px; text-align: center;">Bu kod <strong>10 dakika</strong> boyunca geçerlidir.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #999; font-size: 12px; text-align: center;">Bu e-postayı siz talep etmediyseniz, lütfen dikkate almayınız.<br/>Must-b Academy (MUST-B Teknoloji A.Ş.) — Destek: iletisim@must-b.com | Bu e-posta hesap güvenliğiniz için gönderilen işlemsel bir iletidir.</p>
          </div>
        `
      });

      if (sendError) {
        const rawResendMsg = `${sendError.name ? `[${sendError.name}] ` : ""}${sendError.message || JSON.stringify(sendError)}`;
        console.error("Resend API Error Detail:", sendError);
        if (isResendTestModeError(sendError.message)) {
          return NextResponse.json(
            { error: `${RESEND_TEST_MODE_ERROR} (Resend: ${rawResendMsg})`, details: sendError },
            { status: 403 }
          );
        }
        return NextResponse.json(
          { error: `Resend hatası: ${rawResendMsg}`, details: sendError },
          { status: 500 }
        );
      }
    } else {
      // 3. Fallback / Dev Mode
      console.log(`\n=================================\nDEV OTP [${email}]: ${code}\n=================================\n`);
    }

    return NextResponse.json({ success: true, message: "Kod basariyla gonderildi." });
  } catch (err: any) {
    console.error("send-otp-8 Error:", err);
    const msg = err?.message || "Bilinmeyen hata";
    if (isResendTestModeError(msg)) {
      return NextResponse.json(
        { error: `${RESEND_TEST_MODE_ERROR} (Detay: ${msg})` },
        { status: 403 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

