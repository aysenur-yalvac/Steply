# Steply | Modern Proje Yönetim Platformu

Steply, öğrenciler ve öğretmenler için tasarlanmış, süreç odaklı, şık ve performanslı bir proje yönetim platformudur. Proje takibi, dosya yönetimi ve sosyal etkileşim özelliklerini modern bir arayüzde birleştirir.

## 🚀 Öne Çıkan Özellikler

- **Dinamik Tema Sistemi**: Tek bir tıkla Aydınlık ve Karanlık modlar arasında geçiş yapın. Kullanıcı tercihleriniz tarayıcıda kalıcı olarak saklanır.
- **Gelişmiş Dosya Yönetimi**: Projelerinize sınırsız (5MB/dosya sınırı ile) dosya yükleyin. Supabase Storage entegrasyonu ve güvenli RLS politikaları ile dosyalarınız sadece size özel kalsın.
- **Akıllı Navbar**: Giriş durumunuza göre dinamik olarak değişen, mobil uyumlu ve sadeleştirilmiş navigasyon arayüzü.
- **Öğretmen Değerlendirmeleri**: Projeleriniz için öğretmenlerinizden puan ve detaylı geri bildirim alabileceğiniz entegre değerlendirme sistemi.
- **Rol Tabanlı Erişim**: Öğrenci ve öğretmen rolleri için özelleştirilmiş dashboard ve yetki yönetimi.

## 🛠️ Teknoloji Yığını

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router & Turbopack)
- **Veritabanı & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, Storage, Authentication)
- **Stil**: [Tailwind CSS 4](https://tailwindcss.com/)
- **İkonlar**: [Lucide React](https://lucide.dev/)
- **Tema Yönetimi**: `next-themes`
- **Dil Desteği**: Altyapı olarak `next-intl` (Gelecek sürümler için hazır)

## 📦 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js 18.x veya üzeri
- Supabase hesabı ve projesi

### Adımlar

1. Depoyu klonlayın:
   ```bash
   git clone https://github.com/username/steply.git
   cd steply
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

3. Çevresel değişkenleri ayarlayın (`.env.local`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```

## 🏗️ Proje Yapısı

- `src/app`: Next.js App Router sayfaları ve layoutları.
- `src/components`: UI bileşenleri ve özellik tabanlı modüller.
- `src/lib`: Server Action'lar ve ortak yardımcı fonksiyonlar.
- `src/context`: Auth ve diğer global state sağlayıcılar.
- `supabase`: Veritabanı şemaları, migration'lar ve politikalar.

## 📄 Lisans

Bu proje bir **Auto Step** ürünüdür ve eğitim amaçlı geliştirilmiştir. Tüm hakları saklıdır.
