const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/components/ui/animated-characters-login-page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = {
  "-Yrenci": "Öğrenci",
  "-Yretmen": "Öğretmen",
  "TopluluYa Katl": "Topluluğa Katıl",
  "HoY Geldin": "Hoş Geldin",
  "RolǬnǬzǬ Sein": "Rolünüzü Seçin",
  "Proje yǬkle, takip et, portfolyo oluYtur.": "Proje yükle, takip et, portfolyo oluştur.",
  "Projeleri denetle ve puan ver.": "Projeleri denetle ve puan ver.",
  "Gizlilik Politikas": "Gizlilik Politikası",
  "Kullanm KoYullar": "Kullanım Koşulları",
  "letiYim": "İletişim",
  "iin": "için",
  "hesabna": "hesabına",
  "giriY": "giriş",
  "kayt ol": "kayıt ol",
  "yolculuYunu": "yolculuğunu",
  "baYlat": "başlat",
  "Ali Ylmaz": "Ali Yılmaz",
  "stanbul Teknik oniversitesi": "İstanbul Teknik Üniversitesi",
  "?ifre": "Şifre",
  "????????": "••••••••",
  "Beni Hatrla": "Beni Hatırla",
  "Yununla devam et": "şununla devam et",
  "Hesabn yok mu": "Hesabın yok mu",
  "Kayt Ol": "Kayıt Ol",
  "Zaten hesabn var m": "Zaten hesabın var mı",
  "GiriY Yap": "Giriş Yap",
  "Orenciler": "Öğrenciler",
  "Oğrenciler": "Öğrenciler",
  "Hesap OluYtur": "Hesap Oluştur",
  "geiY yaplyor": "geçiş yapılıyor",
  "lǬtfen bekleyin?": "lütfen bekleyin...",
  "Oğrenciler diledikleri e-posta adresiyle kayıt olabilir. Öğretmenlerin @meb.k12.tr veya kurumsal öğretmen e-postası kullanması zorunludur.": ""
};

for (const [key, value] of Object.entries(replacements)) {
  content = content.split(key).join(value);
}

// Add the dynamic info under email
const oldEmailInput = `<input
                    name="email"
                    type="email"
                    placeholder="ornek@ogrenci.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 w-full rounded-xl px-4 text-sm font-medium transition-all outline-none"
                    style={email ? FOCUS_STYLE : INPUT_BASE}
                    onFocus={(e) => { setIsTyping(true); Object.assign(e.currentTarget.style, { ...INPUT_BASE, ...FOCUS_STYLE }); }}
                    onBlur={(e)  => { setIsTyping(false); Object.assign(e.currentTarget.style, { ...INPUT_BASE, ...BLUR_STYLE }); }}
                  />
                  {!isLogin && (
                    <p className="text-[11px] leading-snug mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                      
                    </p>
                  )}`;

const newEmailInput = `<input
                    name="email"
                    type="email"
                    placeholder="ornek@ogrenci.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 w-full rounded-xl px-4 text-sm font-medium transition-all outline-none"
                    style={email ? FOCUS_STYLE : INPUT_BASE}
                    onFocus={(e) => { setIsTyping(true); Object.assign(e.currentTarget.style, { ...INPUT_BASE, ...FOCUS_STYLE }); }}
                    onBlur={(e)  => { setIsTyping(false); Object.assign(e.currentTarget.style, { ...INPUT_BASE, ...BLUR_STYLE }); }}
                  />
                  {!isLogin && role === "teacher" && (
                    <p className="text-xs text-amber-400 mt-1.5 flex items-center gap-1">
                      <span>ℹ️</span> Öğretmenlerin @meb.k12.tr, @meb.gov.tr veya kurumsal e-posta kullanması zorunludur.
                    </p>
                  )}`;

content = content.replace(
  /<input\s+name="email"[\s\S]*?\{\!isLogin\s*&&\s*\([\s\S]*?<\/p>\s*\)\}/,
  newEmailInput
);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Replaced UTF8 chars and updated role info.");
