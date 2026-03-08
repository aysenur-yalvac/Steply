-- 1. Tablolarda RLS'i Aktifleştir (Henüz Aktif Değilse)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 2. PROFILES (Kullanıcı Profilleri) Politikaları
-- Kullanıcı SADECE kendi profilini okuyabilir
CREATE POLICY "Users can view own profile only" ON public.profiles FOR SELECT USING ( auth.uid() = id );
-- Trigger'ın çalışabilmesi (Yeni kayıt atabilmesi) için Postgres (postgres role) tarafına yetki kısıtlaması uygulanmaz (SECURITY DEFINER ile trigger yazıldığı için bypass edilir).
-- Ancak eğer client üzerinden insert işlemine gerek varsa (kullanılmasa da ek güvenlik için):
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ( auth.uid() = id );
-- Kullanıcı kendi profilini güncelleyebilir
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ( auth.uid() = id );

-- 3. PROJECTS (Projeler) Politikaları
-- Herkes tüm projeleri okuyabilir (Öğretmenlerin görebilmesi için)
CREATE POLICY "Projects are viewable by everyone" ON public.projects FOR SELECT USING ( true );
-- Öğrenciler PROJE EKLEYEBİLİR (student_id = auth.uid() olmak şartıyla)
CREATE POLICY "Students can insert their own projects" ON public.projects FOR INSERT WITH CHECK ( auth.uid() = student_id );
-- Öğrenciler SADECE kendi projelerini güncelleyebilir (İlerleme yüzdesi vs.)
CREATE POLICY "Students can update their own projects" ON public.projects FOR UPDATE USING ( auth.uid() = student_id );
-- Öğrenciler SADECE kendi projelerini silebilir
CREATE POLICY "Students can delete their own projects" ON public.projects FOR DELETE USING ( auth.uid() = student_id );

-- 4. REVIEWS (İnceleme / Değerlendirme) Politikaları
-- Herkes (Öğrenci ve diğerleri) tüm yorumları okuyabilir
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING ( true );
-- Sadece öğretmenler (daha doğrusu reviewer_id auth.uid ile eşleşiyorsa) yorum EKLİYEBİLİR
CREATE POLICY "Teachers can insert reviews" ON public.reviews FOR INSERT WITH CHECK ( auth.uid() = reviewer_id );
-- Kişi SADECE KENDİ eklediği yorumu değiştirebilir
CREATE POLICY "Teachers can update own reviews" ON public.reviews FOR UPDATE USING ( auth.uid() = reviewer_id );
-- Kişi SADECE KENDİ eklediği yorumu silebilir
CREATE POLICY "Teachers can delete own reviews" ON public.reviews FOR DELETE USING ( auth.uid() = reviewer_id );

-- 5. MESSAGES (Mesajlaşma) Politikaları
-- Kullanıcı SADECE gönderici veya alıcı olduğu mesajları OKUYABİLİR
CREATE POLICY "Users can view their own messages" ON public.messages FOR SELECT USING ( auth.uid() = sender_id OR auth.uid() = receiver_id );
-- Kullanıcı mesaj EKLERKEN (Gönderici kendi ID'si olmak zorundadır)
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK ( auth.uid() = sender_id );
-- Bir mesaj silinecekse SADECE göndericisi silebilir
CREATE POLICY "Users can delete own sent messages" ON public.messages FOR DELETE USING ( auth.uid() = sender_id );
