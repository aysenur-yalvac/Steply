-- =============================================
-- Class Management System Migration
-- Run this in Supabase Dashboard > SQL Editor
-- =============================================

-- 1. Classes Table
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  code VARCHAR(12) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone(''utc''::text, now()) NOT NULL
);

-- 2. Class Members Table
CREATE TABLE IF NOT EXISTS public.class_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone(''utc''::text, now()) NOT NULL,
  UNIQUE(class_id, student_id)
);

-- RLS
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;

-- Ogretmen kendi siniflarini yonetebilir
CREATE POLICY "Teachers can manage their classes"
  ON public.classes FOR ALL
  USING (auth.uid() = teacher_id);

-- Herhangi authenticated kullanici koda gore sinif gorebilir (join akisi icin)
CREATE POLICY "Anyone authenticated can look up class by code"
  ON public.classes FOR SELECT
  USING (auth.role() = ''authenticated'');

-- Sinif uyeligi yonetimi
CREATE POLICY "Class members access"
  ON public.class_members FOR ALL
  USING (
    student_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.classes
      WHERE classes.id = class_members.class_id
        AND classes.teacher_id = auth.uid()
    )
  );
