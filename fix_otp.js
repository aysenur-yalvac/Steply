const fs = require('fs');
const path = require('path');
const file = path.resolve('src/app/api/auth/verify-otp-8/route.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `const isTeacher = require("@/lib/email-classification").isTeacherEmail(email);
  if (role === "teacher" && !isTeacher) {`,
  `const isTeacher = require("@/lib/email-classification").isTeacherEmail(email);
  
  // HER ZAMAN KONTROL: Eger whitelist/kurumsal ise role zorunlu "teacher" olsun
  if (isTeacher) {
    role = "teacher";
  }

  if (role === "teacher" && !isTeacher) {`
);

fs.writeFileSync(file, content, 'utf8');
