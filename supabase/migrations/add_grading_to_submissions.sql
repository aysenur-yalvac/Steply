-- 1. assignment_submissions tablosuna notlandırma ve geribildirim sütunları ekleme
ALTER TABLE public.assignment_submissions
ADD COLUMN IF NOT EXISTS grade INTEGER CHECK (grade >= 0 AND grade <= 100),
ADD COLUMN IF NOT EXISTS feedback TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'submitted',
ADD COLUMN IF NOT EXISTS graded_at TIMESTAMPTZ;

-- 2. assignment_files Storage Bucket'ı oluştur (yoksa)
INSERT INTO storage.buckets (id, name, public)
VALUES ('assignment_files', 'assignment_files', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. assignment_files için RLS politikaları
DROP POLICY IF EXISTS "assignment_files_read" ON storage.objects;
CREATE POLICY "assignment_files_read" ON storage.objects 
FOR SELECT TO authenticated USING (bucket_id = 'assignment_files');

DROP POLICY IF EXISTS "assignment_files_insert" ON storage.objects;
CREATE POLICY "assignment_files_insert" ON storage.objects 
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'assignment_files');

DROP POLICY IF EXISTS "assignment_files_update" ON storage.objects;
CREATE POLICY "assignment_files_update" ON storage.objects 
FOR UPDATE TO authenticated USING (bucket_id = 'assignment_files');

DROP POLICY IF EXISTS "assignment_files_delete" ON storage.objects;
CREATE POLICY "assignment_files_delete" ON storage.objects 
FOR DELETE TO authenticated USING (bucket_id = 'assignment_files');
