# Steply QA Süreci

Bu belge, Steply'nin kalite kontrol mekanizmasını açıklar. Her güncelleme bu süreci takip etmelidir.

## ✅ Her Güncelleme İçin Zorunlu Adımlar

### 1. Değişiklik Kategorisi Belirle

| Değişiklik Türü | SS Gerekli mi? | Hangi Sayfalar? |
|----------------|-----------------|-----------------|
| UI/Sayfa değişikliği | ✅ Evet | Değişen sayfa(lar) |
| Yeni özellik | ✅ Evet | Özelliğin tüm akışı |
| Bug fix (görsel) | ✅ Evet | Etkilenen sayfa |
| Bug fix (backend/logic) | ⚡ Önerilen | Eğer UI değişiyorsa |
| Konfigürasyon değişikliği | ❌ Hayır | — |

### 2. Dev Server'ı Başlat

```bash
npm run dev
```

### 3. Ekran Görüntüsü Al

Değişen her sayfa için **1440×900** (desktop) ve **390×844** (mobile) SS al.

- SS dosyalarını `visual-audit/screenshots/` altına kaydet
- İsimlendirme: `YY-sayfa-adi.png` (ör: `17-new-feature.png`)

### 4. README'yi Güncelle

`visual-audit/README.md` dosyasındaki tabloyu güncel SS'lerle güncelle.

### 5. Git Commit

```bash
git add visual-audit/
git commit -m "qa: v0.X.Y [sayfa-adi] ekran görüntüsü güncellendi"
```

### 6. Vercel Deploy

```bash
git push origin main
```

Vercel otomatik build başlatır. Dashboard'dan build sonucunu doğrula.

---

## 🚫 Beyaz Ekran / Hata Kuralı

> **Beyaz ekran veya runtime error içeren hiçbir SS kabul edilmez.**

Eğer sayfa hata gösteriyorsa:
1. Console hatalarını kontrol et
2. Hatayı düzelt
3. Sayfanın düzgün render olduğunu doğrula
4. SONRA SS al

---

## 📋 Kritik Senaryo Şablonları

### Proje Ekleme
1. Dashboard → Projeler → "Yeni Proje" tıkla
2. Form doldur → Kaydet
3. SS: Form açık hali + Başarı mesajı

### Proje Silme
1. Proje kartında "Sil" tıkla
2. Onay dialog'u çıkar
3. SS: Onay dialog'u + Silinmiş liste

### Yorum & Puan
1. Proje detay sayfasına gir
2. Yorum yaz → Gönder
3. SS: Yorum formu + Gönderilmiş yorum

---

## 🗂️ Klasör Yapısı

```
visual-audit/
├── README.md          # SS indeksi ve audit notları
├── QA-PROCESS.md      # Bu belge
└── screenshots/       # Tüm ekran görüntüleri
    ├── 01-landing.png
    ├── 02-login.png
    └── ...
```
