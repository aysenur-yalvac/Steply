-- 1. Create project-files bucket if it doesn't exist
-- Note: This is usually done via the Supabase Dashboard, but here is the SQL for reference.
-- INSERT INTO storage.buckets (id, name, public) VALUES ('project-files', 'project-files', true);

-- 2. Enable RLS on storage.objects (it is enabled by default in Supabase)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Everyone can read files (Public bucket style)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'project-files' );

-- 4. Policy: Only project owner can upload files
-- The file path is expected to be: project_id/filename
CREATE POLICY "Project owners can upload files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-files' AND
  (SELECT auth.uid() = student_id FROM public.projects WHERE id::text = (storage.foldername(name))[1])
);

-- 5. Policy: Only project owner can delete files
CREATE POLICY "Project owners can delete files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-files' AND
  (SELECT auth.uid() = student_id FROM public.projects WHERE id::text = (storage.foldername(name))[1])
);

-- 6. Policy: Only project owner can update files (optional but good)
CREATE POLICY "Project owners can update files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'project-files' AND
  (SELECT auth.uid() = student_id FROM public.projects WHERE id::text = (storage.foldername(name))[1])
);
