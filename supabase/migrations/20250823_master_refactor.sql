-- ================================================================
-- Steply Master Refactor Migration
-- Run this in Supabase Dashboard > SQL Editor
-- ================================================================

-- ===== 1. profiles tablosuna yeni kolonlar =====
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS teacher_status TEXT DEFAULT 'unverified'
    CHECK (teacher_status IN ('unverified', 'pending', 'verified')),
  ADD COLUMN IF NOT EXISTS institution_code TEXT,
  ADD COLUMN IF NOT EXISTS verification_doc_url TEXT;

-- role kolonuna 'admin' degerini ekle (constraint varsa guncelle)
DO $$
BEGIN
  ALTER TABLE public.profiles
    DROP CONSTRAINT IF EXISTS profiles_role_check;
  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('student', 'teacher', 'admin'));
EXCEPTION WHEN OTHERS THEN NULL;
END$$;

-- ===== 2. RLS Politikalari =====

-- files tablosu icin
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own files" ON public.files;
CREATE POLICY "Users see own files"
ON public.files FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- assignments tablosu - ogrenciler kendi odevlerini gonderebilir
-- ogretmenler tum odeyleri gorebilir
DROP POLICY IF EXISTS "assignment_submissions_isolation" ON public.assignment_submissions;
CREATE POLICY "assignment_submissions_isolation"
ON public.assignment_submissions FOR ALL
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('teacher', 'admin')
  )
)
WITH CHECK (auth.uid() = user_id);

-- ===== 3. Storage RLS (assignments bucket) =====
-- Supabase Storage politikalari Dashboard > Storage > Policies bolumunden de eklenebilir

-- assignments bucket: kullanici sadece kendi klasorune yazabilir
DROP POLICY IF EXISTS "auth_uploads_assignment" ON storage.objects;
CREATE POLICY "auth_uploads_assignment"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'assignments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "auth_reads_assignment" ON storage.objects;
CREATE POLICY "auth_reads_assignment"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'assignments'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('teacher', 'admin')
    )
  )
);

-- ===== 4. Admin Kontrol Fonksiyonu =====
-- Ogretmen dogrulama: admin bu fonksiyon ile onay verir
CREATE OR REPLACE FUNCTION public.verify_teacher(teacher_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Sadece admin kullanabilir
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  UPDATE public.profiles
  SET teacher_status = 'verified'
  WHERE id = teacher_id AND role = 'teacher';
END;
$$;

-- ===== 5. Schema Reload =====
NOTIFY pgrst, 'reload schema';
