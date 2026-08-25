const fs = require('fs');
const path = require('path');
const file = path.resolve('src/components/auth/OtpInput.tsx');
let content = fs.readFileSync(file, 'utf8');

const regexBanner = /\{isInstitutional && \([\s\S]*?<\/div>\s*\)\}/;
const newBanner = `{role === "teacher" && isTeacher && (
        <p className="text-xs text-amber-400 mb-4 text-center">
          Kurumsal öğretmen e-postası — doğrulama sonrası otomatik yetkilendirileceksiniz.
        </p>
      )}`;

content = content.replace(regexBanner, newBanner);

fs.writeFileSync(file, content, 'utf8');
console.log("Updated OtpInput banner.");
