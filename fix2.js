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

const oldEmailInput = `<input
                  name="email"
                  type="email"
                  placeholder="ornek@ogrenci.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm placeholder:text-slate-600 dark:text-slate-300 outline-none transition-all"
                  style={INPUT_BASE}
                  onFocus={(e) => { setIsTyping(true); Object.assign(e.currentTarget.style, { ...INPUT_BASE, ...FOCUS_STYLE }); }}
                  onBlur={(e)  => { setIsTyping(false); Object.assign(e.currentTarget.style, { ...INPUT_BASE, ...BLUR_STYLE }); }}
                />`;

const newEmailInput = `<input
                  name="email"
                  type="email"
                  placeholder="ornek@ogrenci.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm placeholder:text-slate-600 dark:text-slate-300 outline-none transition-all"
                  style={INPUT_BASE}
                  onFocus={(e) => { setIsTyping(true); Object.assign(e.currentTarget.style, { ...INPUT_BASE, ...FOCUS_STYLE }); }}
                  onBlur={(e)  => { setIsTyping(false); Object.assign(e.currentTarget.style, { ...INPUT_BASE, ...BLUR_STYLE }); }}
                />
                {!isLogin && role === "teacher" && (
                  <p className="text-xs text-amber-400 mt-1.5 flex items-center gap-1">
                    <span>ℹ️</span> Öğretmenlerin @meb.k12.tr, @meb.gov.tr veya kurumsal e-posta kullanması zorunludur.
                  </p>
                )}`;

content = content.replace(oldEmailInput, newEmailInput);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Fixed!");
