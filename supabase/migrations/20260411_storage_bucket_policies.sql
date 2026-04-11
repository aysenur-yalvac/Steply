-- v0.4.6: Supabase Storage bucket + RLS policies for project-files
-- Enables direct browser-to-Supabase uploads (bypasses Vercel size limits).
-- Safe to run multiple times (idempotent).

-- ─────────────────────────────────────────────
-- BUCKET
-- ─────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-files',
  'project-files',
  true,                -- public bucket so download links work without signed URLs
  104857600,           -- 100 MB per-file limit (bytes)
  NULL                 -- allow all MIME types
)
ON CONFLICT (id) DO UPDATE SET
  public           = EXCLUDED.public,
  file_size_limit  = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ─────────────────────────────────────────────
-- STORAGE POLICIES (drop-and-recreate)
-- ─────────────────────────────────────────────

-- SELECT: anyone can read files in the bucket (public bucket)
DROP POLICY IF EXISTS "storage_project_files_select" ON storage.objects;
CREATE POLICY "storage_project_files_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'project-files');

-- INSERT: authenticated users can upload to their own project folder
-- Path convention: {projectId}/{timestamp}-{filename}
DROP POLICY IF EXISTS "storage_project_files_insert" ON storage.objects;
CREATE POLICY "storage_project_files_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'project-files');

-- UPDATE: authenticated users can overwrite their own uploads
DROP POLICY IF EXISTS "storage_project_files_update" ON storage.objects;
CREATE POLICY "storage_project_files_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'project-files');

-- DELETE: authenticated users can delete objects they own
DROP POLICY IF EXISTS "storage_project_files_delete" ON storage.objects;
CREATE POLICY "storage_project_files_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'project-files');
