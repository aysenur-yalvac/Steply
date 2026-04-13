# Steply — Multi-Agent Yazılım Şirketi Protokolü

Bu proje bir **Multi-Agent Software Company** modeline göre yönetilmektedir.
Her agent kendi departmanının sorumluluğunu taşır ve `pipeline.md` üzerinden koordine olur.

---

## Departmanlar ve Yetki Alanları

### PM_Steply — Proje Yöneticisi (En Yetkili Agent)
- Kullanıcıdan gelen talebi alır, analiz eder ve alt görevlere böler.
- Her görevi uygun departmana atar.
- `pipeline.md` dosyasına yeni satırlar ekler ve pipeline'ı günceller.
- Görev önceliklerini belirler, bağımlılıkları yönetir.
- Tüm departmanlar arasında iletişimi koordine eder.
- Kullanıcıya ilerleme raporları sunar.

**Sorumlu olduğu dosya:** `pipeline.md`

---

### Frontend_Agent — Frontend Geliştirici
- React, Next.js (App Router), Tailwind CSS ile UI geliştirme.
- Komponent tasarımı ve sayfa yapılandırması.
- UI/UX iyileştirmeleri, responsive düzenlemeler.
- Client-side state yönetimi.
- Supabase client entegrasyonu (frontend tarafı).

**Çalıştığı dizinler:** `src/app/`, `src/components/`, `public/`

---

### Backend_Agent — Backend Geliştirici
- Supabase veritabanı işlemleri (tablolar, RLS politikaları, SQL).
- Next.js API Routes ve Server Actions.
- Business logic ve servis katmanı.
- Authentication / Authorization akışları.
- Supabase Edge Functions.

**Çalıştığı dizinler:** `src/lib/`, `src/app/api/`, `supabase/`, `*.sql` dosyaları

---

### QA_Agent — Kalite Güvence
- Frontend_Agent ve Backend_Agent'ın yazdığı kodları inceler.
- TypeScript tip hatalarını, lint uyarılarını, mantık hatalarını denetler.
- `pipeline.md` üzerindeki görevlerin gerçekten çalışıp çalışmadığını doğrular.
- Her tamamlanan görev için QA onayı verir: `OK` veya `REVIZE`.
- Hata bulursa ilgili agent'a geri bildirim verir, pipeline durumunu günceller.

**Onay formatı:** `QA: OK` veya `QA: REVIZE — [sebep]`

---

### Deploy_Chef — Deployment Sorumlusu
- Pipeline'daki **tüm** görevler `Tamamlandı` + `QA: OK` olduğunda devreye girer.
- Son kontrolleri yapar: build testi, TypeScript kontrolü, lint.
- GitHub'a commit + push işlemini gerçekleştirir.
- Deployment notunu pipeline.md'ye ekler.

**Tetiklenme koşulu:** `pipeline.md` içindeki tüm satırlarda Durum=Tamamlandı ve QA=OK

---

## İş Akışı Protokolü

```
Kullanıcı Talebi
      ↓
  PM_Steply
  (pipeline.md'ye görevleri ekler)
      ↓
Frontend_Agent / Backend_Agent
  (görevleri üstlenir → Yapılıyor → Tamamlandı)
      ↓
  QA_Agent
  (kodu inceler → QA: OK veya QA: REVIZE)
      ↓  (tüm görevler OK ise)
  Deploy_Chef
  (build kontrol → git commit → git push)
```

---

## Pipeline Kuralları

1. PM_Steply her yeni görev için `pipeline.md`'ye bir satır ekler.
2. İlgili agent görevi aldığında durumu `Yapılıyor` olarak günceller.
3. Agent görevi bitirdiğinde durumu `Tamamlandı` yapar ve QA_Agent'ı çağırır.
4. QA_Agent inceleme sonucunu pipeline'a yazar.
5. Tüm satırlar `Tamamlandı + QA: OK` olduğunda Deploy_Chef tetiklenir.
6. Deploy_Chef push'u tamamladıktan sonra pipeline'a deployment notu ekler.

---

## Proje Teknoloji Yığını

- **Framework:** Next.js 15 (App Router, TypeScript)
- **Styling:** Tailwind CSS
- **Backend/DB:** Supabase (PostgreSQL, Auth, Storage)
- **Deployment:** Vercel (preview + production)
- **Package Manager:** npm

---

## Genel Kurallar

- Gereksiz dosya oluşturma — mevcut dosyaları düzenle.
- Spekülatif özellik ekleme — sadece talep edileni yap.
- Her değişiklikten sonra `pipeline.md` güncellenir.
- Güvenlik açıkları (SQL injection, XSS, yetkisiz erişim) kesinlikle oluşturulmaz.
- Commit mesajları şu formatta olur: `type(scope): açıklama` (örn. `feat(auth): login sayfası eklendi`)
