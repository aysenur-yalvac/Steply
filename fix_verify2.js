const fs = require('fs');
const path = require('path');
const file = path.resolve('src/app/api/auth/verify-otp-8/route.ts');
let content = fs.readFileSync(file, 'utf8');

const regex = /\/\/ SUNUCU TARAFLI SERT ROL KONTROLU[\s\S]*?\}\s*(?=\/\/ Her durumda statusu verified yap)/;

const newCode = `// SUNUCU TARAFLI SERT ROL KONTROLU
  const isTeacher = require("@/lib/email-classification").isTeacherEmail(email);
  if (role === "teacher" && !isTeacher) {
    // Eger veri tabaninda ogretmen secilmis ama mail kurumsal degilse reddet
    return NextResponse.json(
      { error: "Geçerli bir kurumsal öğretmen e-posta adresi (@meb.k12.tr vb.) ile giriş yapmalısınız." },
      { status: 403 }
    );
  }
  
  `;

content = content.replace(regex, newCode);

fs.writeFileSync(file, content, 'utf8');
console.log("verify route updated.");
