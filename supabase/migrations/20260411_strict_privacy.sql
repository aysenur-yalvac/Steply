-- v0.4.2: Bulletproof profile privacy
-- profiles remain fully readable by everyone (name, avatar, etc.)
-- projects are hidden for private accounts — DB-level enforcement

-- Ensure is_public column exists (idempotent)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT true;

-- ─────────────────────────────────────────────
-- PROJECTS — replace open SELECT policy
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "projects_select_authenticated" ON public.projects;

-- A project is visible when ANY of these is true:
--   1. The viewer is the project owner
--   2. The viewer is a team member (project_members table)
--   3. The owner's profile is set to public (is_public = true)
CREATE POLICY "projects_select_privacy_aware"
  ON public.projects FOR SELECT
  TO authenticated
  USING (
    auth.uid() = student_id
    OR EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = public.projects.id
        AND pm.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = public.projects.student_id
        AND p.is_public = true
    )
  );
