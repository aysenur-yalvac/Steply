-- ================================================================
-- Steply Master Refactor Migration (Idempotent / Safe Version)
-- Her seferinde guvenle calistiriabilir: CREATE IF NOT EXISTS + DROP IF EXISTS
-- Supabase Dashboard > SQL Editor'da calistirin
-- ================================================================

-- ===== 1. profiles tablosuna yeni kolonlar =====
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS teacher_status TEXT DEFAULT 'unverified',
  ADD COLUMN IF NOT EXISTS institution_code TEXT,
  ADD COLUMN IF NOT EXISTS verification_doc_url TEXT;

-- teacher_status icin gecerli degerler
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_teacher_status_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_teacher_status_check
  CHECK (teacher_status IN ('unverified', 'pending', 'verified'));

-- role icin admin degerini ekle
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('student', 'teacher', 'admin'));

-- ===== 2. files tablosunu olustur (yoksa) =====
CREATE TABLE IF NOT EXISTS public.files (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL,
  file_path   TEXT NOT NULL,
  size        BIGINT,
  mime_type   TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ===== 3. assignment_submissions tablosunu olustur (yoksa) =====
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_url      TEXT,
  file_name     TEXT,
  submitted_at  TIMESTAMPTZ DEFAULT now()
);

-- ===== 4. files icin RLS =====
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Kullanicilar sadece kendi dosyalarini gorebilir" ON public.files;
CREATE POLICY "Kullanicilar sadece kendi dosyalarini gorebilir"
ON public.files FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ===== 5. assignment_submissions icin RLS =====
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

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

-- ===== 6. Storage RLS (assignments bucket) =====
-- NOT: Bu politikalar icin 'assignments' bucket'inin Dashboard > Storage'dan onceden olusturulmasi gerekir.

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

-- ===== 7. Ogretmen dogrulama admin fonksiyonu =====
CREATE OR REPLACE FUNCTION public.verify_teacher(teacher_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can verify teachers';
  END IF;

  UPDATE public.profiles
  SET teacher_status = 'verified'
  WHERE id = teacher_id AND role = 'teacher';
END;
$$;

-- ===== 8. Schema Reload =====
NOTIFY pgrst, 'reload schema';
