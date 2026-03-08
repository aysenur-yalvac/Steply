-- RLS AKTİF ETME (Enable RLS)
ALTER TABLE pUBLIC.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pUBLIC.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES POLİTİKALARI
-- Herkes kendi profilini görebilir ve güncelleyebilir. Diğer profilleri okumaya herkese (öğretmenler için özellikle) izin verebiliriz.
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING ( true );
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ( auth.uid() = id );
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ( auth.uid() = id );

-- 2. PROJECTS POLİTİKALARI
-- Öğrenciler sadece kendi projelerini silip/güncelleyebilir/ekleyebilir. 
-- Ancak öğretmenlerin hepsini okuyabilmesi gerekir! Ya da herkes herkesin projesini "okuyabilir", sadece sahibi "değiştirebilir".
-- Seçenek: Herkes okuyabilir (Select), ama sadece sahibi düzenleyebilir (Insert, Update, Delete)
CREATE POLICY "Projects are viewable by everyone" ON public.projects FOR SELECT USING ( true );
CREATE POLICY "Students can create projects" ON public.projects FOR INSERT WITH CHECK ( auth.uid() = student_id );
CREATE POLICY "Students can update their own projects" ON public.projects FOR UPDATE USING ( auth.uid() = student_id );
CREATE POLICY "Students can delete their own projects" ON public.projects FOR DELETE USING ( auth.uid() = student_id );

-- 3. REVIEWS POLİTİKALARI
-- Öğretmenler projeye yorum (review) ekleyebilir. Herkes (öğrenci dahil) okuyabilir.
-- Not: Öğretmen yetki kontrolü uygulamada da yapılıyor. Burada sadece owner (reviewer) kısıtı koyuyoruz.
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING ( true );
CREATE POLICY "Users can insert their own reviews" ON public.reviews FOR INSERT WITH CHECK ( auth.uid() = reviewer_id );
CREATE POLICY "Reviewers can update own reviews" ON public.reviews FOR UPDATE USING ( auth.uid() = reviewer_id );
CREATE POLICY "Reviewers can delete own reviews" ON public.reviews FOR DELETE USING ( auth.uid() = reviewer_id );

-- 4. MESSAGES POLİTİKALARI (Eğer kullanacaksanız)
-- Sadece mesajın göndericisi veya alıcısı mesajı okuyabilir. (Özel mesaj mantığı)
CREATE POLICY "Users can view their own messages" ON public.messages FOR SELECT USING ( auth.uid() = sender_id OR auth.uid() = receiver_id );
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK ( auth.uid() = sender_id );
-- (Mesajlar genellikle update/delete edilmez ama gerekirse kendi gönderdiği mesajı silebilir)
CREATE POLICY "Users can delete own sent messages" ON public.messages FOR DELETE USING ( auth.uid() = sender_id );
