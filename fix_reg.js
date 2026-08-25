const fs = require('fs');
const path = require('path');
const file = path.resolve('src/app/api/auth/register/route.ts');
let content = fs.readFileSync(file, 'utf8');

const oldCheck = `  // 2. SERT DOMAIN VE ROL DOGRULAMASI (Guvenlik Kilidi)
  if (requestedRole === "teacher" && classification.role === "student") {
    return NextResponse.redirect(
      \`\${requestUrl.origin}/auth/register?error=\${encodeURIComponent("Ogrenci e-posta adresi ile Ogretmen hesabi olusturulamaz! Lutfen kurumsal ogretmen e-postanizi giriniz.")}\`,
      { status: 303 }
    );
  }`;

const newCheck = `  // 2. SERT DOMAIN VE ROL DOGRULAMASI (Guvenlik Kilidi)
  if (requestedRole === "teacher" && classification.role !== "teacher") {
    return NextResponse.redirect(
      \`\${requestUrl.origin}/auth/register?error=\${encodeURIComponent("Öğrenci veya kisisel e-posta adresi ile Öğretmen hesabi olusturulamaz! Lutfen kurumsal ogretmen e-postanizi giriniz.")}\`,
      { status: 303 }
    );
  }`;

content = content.replace(oldCheck, newCheck);
fs.writeFileSync(file, content, 'utf8');
console.log("Updated register API.");
