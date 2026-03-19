# Steply Visual Audit — v0.3.7

Bu klasör, Steply platformunun tüm sayfa ve kullanıcı akışlarının ekran görüntülerini içerir. Her yeni sürümde güncellenir.

## 📁 screenshots/

| # | Dosya | Açıklama | Viewport | Durum |
|---|-------|----------|----------|-------|
| 01 | `01-landing.png` | Landing / Ana Sayfa Hero | 1440×900 | ✅ |
| 02 | `02-login.png` | Giriş Sayfası | 1440×900 | ✅ |
| 03 | `03-register.png` | Kayıt Sayfası | 1440×900 | ✅ |
| 04 | `04-dashboard.png` | Dashboard (auth redirect) | 1440×900 | ✅ |
| 05 | `05-projects.png` | Projeler Sayfası (auth redirect) | 1440×900 | ✅ |
| 06 | `06-profile.png` | Profil Sayfası (auth redirect) | 1440×900 | ✅ |
| 07 | `07-settings.png` | Ayarlar (auth redirect) | 1440×900 | ✅ |
| 08 | `08-messages.png` | Mesajlar (auth redirect) | 1440×900 | ✅ |
| 09 | `09-agenda.png` | Ajanda (auth redirect) | 1440×900 | ✅ |
| 10 | `10-404.png` | 404 Bulunamadı Sayfası | 1440×900 | ✅ |
| 11 | `11-login-mobile.png` | Giriş — Mobil | 390×844 | ✅ |
| 12 | `12-landing-mobile.png` | Landing — Mobil | 390×844 | ✅ |
| 13 | `13-dashboard-mobile.png` | Dashboard — Mobil | 390×844 | ✅ |
| 14 | `14-login-desktop-final.png` | Giriş — Final Doğrulama | 1440×900 | ✅ |
| 15 | `15-landing-hero.png` | Landing — Animasyon (6sn) | 1440×900 | ✅ |
| 16 | `16-register-final.png` | Kayıt — Final Doğrulama | 1440×900 | ✅ |

## 🔍 Audit Notları (v0.3.7)

- **Build Durumu:** ✅ Tüm native binary sorunları çözüldü (`lightningcss-win32`, `@tailwindcss/oxide-win32`)
- **Çözüm:** `package-lock.json` + `node_modules` temizlenip `npm install` ile fresh kurulum yapıldı
- **Dashboard Sayfaları:** Auth olmadığı için login'e redirect ediyor — bu beklenen davranış ✅
- **Supabase Env:** Prod credentials Vercel'de kayıtlı; local dev placeholder kullanıyor

## 📅 Audit Geçmişi

| Sürüm | Tarih | Açıklama |
|-------|-------|----------|
| v0.3.7 | 2026-03-19 | İlk kapsamlı görsel denetim, 16 SS, binary fix |
