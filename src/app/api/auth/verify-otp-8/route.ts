import { NextResponse } from "next/server";
import { classifyEmail } from "@/lib/email-classification";

export async function POST(request: Request) {
  const { email, token } = await request.json();

  if (!email || !token || token.length !== 8) {
    return NextResponse.json({ error: "Lutfen 8 haneli gecerli bir OTP kodu girin." }, { status: 400 });
  }

  // Admin yetkisiyle dogrulama
  const supabaseAdmin = require("@supabase/supabase-js").createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Kodu veritabanindan kontrol et
  const { data: otpRecords, error: otpError } = await supabaseAdmin
    .from("email_otp_codes")
    .select("*")
    .eq("email", email)
    .eq("code", token)
    .gte("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  if (otpError || !otpRecords || otpRecords.length === 0) {
    return NextResponse.json({ error: "Gecersiz veya suresi dolmus kod. Lutfen tekrar deneyin." }, { status: 401 });
  }

  // Kod kullanildi, sil
  await supabaseAdmin.from("email_otp_codes").delete().eq("email", email);

  // 2. Auth API uzerinden User'i bul
  const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
  if (userError) return NextResponse.json({ error: "Kullanici veritabanina ulasilamadi." }, { status: 500 });
  
  const user = userData.users.find((u: any) => u.email === email);
  if (!user) return NextResponse.json({ error: "Kullanici hesabi bulunamadi." }, { status: 404 });

  // 3. ZORUNLU KILIDI AC (Zero Bypass onayi)
  await supabaseAdmin.auth.admin.updateUserById(user.id, {
    email_confirm: true,
    user_metadata: { ...user.user_metadata, email_verified: true }
  });

  // 4. Domain bazli profil otomasyonu
  let targetRoute = "/dashboard";
  let role = "student";

  const { data: profile } = await supabaseAdmin.from("profiles").select("role").eq("id", user.id).single();
  role = profile?.role || "student";

  // Her durumda statusu verified yap (Manuel onay kaldirildi)
  const updates: Record<string, string> = { role };
  if (role === "teacher") {
    updates.teacher_status = "verified";
  }
  
  await supabaseAdmin.from("profiles").update(updates).eq("id", user.id);

  if (role === "teacher") {
    targetRoute = "/dashboard/teacher";
  } else {
    targetRoute = "/dashboard/student";
  }

  // 5. Kullaniciyi login yapmak icin Magic Link olustur
  const requestUrl = new URL(request.url);
  const redirectUrl = `${requestUrl.origin}${targetRoute}`;

  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email: email,
    options: {
      redirectTo: redirectUrl
    }
  });

  if (linkError || !linkData?.properties?.action_link) {
    return NextResponse.json({ error: "Oturum acma linki olusturulamadi." }, { status: 500 });
  }

  return NextResponse.json({ success: true, magicLink: linkData.properties.action_link });
}
