const fs = require('fs');
const path = require('path');
const file = path.resolve('src/app/api/auth/verify-otp-8/route.ts');
let content = fs.readFileSync(file, 'utf8');

const regexToReplace = /let targetRoute = "\/dashboard";\s*let role = "student";\s*const \{ data: profile \} = await supabaseAdmin\.from\("profiles"\)\.select\("role"\)\.eq\("id", user\.id\)\.single\(\);\s*role = profile\?\.role \|\| "student";/;

const newContent = `let targetRoute = "/dashboard";
  let role = "student";

  const { data: profile } = await supabaseAdmin.from("profiles").select("role").eq("id", user.id).single();
  role = profile?.role || "student";

  // SUNUCU TARAFLI SERT ROL KONTROLU
  const classification = classifyEmail(email);
  if (role === "teacher" && classification.role !== "teacher") {
    // Eger veri tabaninda ogretmen secilmis ama mail ogrenci/kisisel ise reddet
    return NextResponse.json(
      { error: "Öğrenci veya kişisel e-posta adresi ile Öğretmen paneline giriş yapılamaz! Lütfen öğrenci girişini kullanınız veya kurumsal e-posta ile kayıt olunuz." },
      { status: 403 }
    );
  }`;

content = content.replace(regexToReplace, newContent);
fs.writeFileSync(file, content, 'utf8');
console.log("Updated verify-otp-8 API.");
