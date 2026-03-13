-- ============================================================
-- Steply: Supabase Storage & Foreign Key Setup
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Create the storage bucket for project files
-- (Only needed if you haven't created it via the Dashboard UI)
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-files', 'project-files', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage RLS Policies for 'project-files' bucket
-- Allow anyone to read public files
CREATE POLICY "Public can read project files"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-files');

-- Allow authenticated project owners to upload files
CREATE POLICY "Project owners can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow project owners to delete their files  
CREATE POLICY "Project owners can delete files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================
-- 3. Ensure FK constraint for reviews → profiles join
-- This is required for the reviewer name to appear in reviews
-- ============================================================
ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_reviewer_id_fkey
  FOREIGN KEY (reviewer_id)
  REFERENCES public.profiles(id)
  ON DELETE SET NULL;

-- ============================================================
-- 4. RLS Policy: Allow reading profiles for review author join
-- ============================================================
CREATE POLICY "Allow profile reads for review join"
ON public.profiles FOR SELECT
TO authenticated
USING (true);
