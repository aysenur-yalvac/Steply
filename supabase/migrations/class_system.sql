-- 1. Sınıflar Tablosu
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  code VARCHAR(12) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Sınıf Üyeleri (Öğrenci - Sınıf Eşleşmesi) Tablosu
CREATE TABLE IF NOT EXISTS public.class_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(class_id, student_id)
);

-- RLS Politikaları
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;

-- Okuma / Yazma izinleri (Öğretmen kendi sınıfını yönetir, Öğrenci dahil olduğu sınıfı görür)
CREATE POLICY "Teachers can manage their classes" ON public.classes 
  FOR ALL USING (auth.uid() = teacher_id);

CREATE POLICY "Students can view enrolled classes" ON public.classes 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.class_members 
      WHERE class_members.class_id = classes.id 
      AND class_members.student_id = auth.uid()
    ) OR auth.uid() = teacher_id
  );

CREATE POLICY "Class members access" ON public.class_members 
  FOR ALL USING (student_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.classes WHERE id = class_members.class_id AND teacher_id = auth.uid()
  ));
