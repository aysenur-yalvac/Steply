const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/components/ui/animated-characters-login-page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = {
  "Ã–": "Ö",
  "Ã¶": "ö",
  "ÄŸ": "ğ",
  "Äž": "Ğ",
  "Ä±": "ı",
  "Ä°": "İ",
  "ÅŸ": "ş",
  "Åž": "Ş",
  "Ã§": "ç",
  "Ã‡": "Ç",
  "Ã¼": "ü",
  "Ãœ": "Ü"
};

for (const [key, value] of Object.entries(replacements)) {
  content = content.split(key).join(value);
}

// Update the dynamic text logic under email input
const regexEmailInput = /(<input\s+name="email"[\s\S]*?onBlur=\{\(e\)\s*=>\s*Object\.assign\(e\.currentTarget\.style,\s*\{\s*\.\.\.INPUT_BASE,\s*\.\.\.BLUR_STYLE\s*\}\)\}\s*\/>\s*)(?:\{\!isLogin\s*&&\s*\(\s*<p[\s\S]*?<\/p>\s*\)\})?/;

const newEmailInput = `$1{!isLogin && role === "teacher" && (
                    <p className="text-xs text-amber-400 mt-1.5 flex items-center gap-1">
                      <span>ℹ️</span> Öğretmenlerin @meb.k12.tr, @meb.gov.tr veya kurumsal e-posta kullanması zorunludur.
                    </p>
                  )}`;

content = content.replace(regexEmailInput, newEmailInput);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Encoding fixed and info updated.");
