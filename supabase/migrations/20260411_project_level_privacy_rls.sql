-- v0.4.3: Project-level privacy enforcement via RLS
-- Replaces the account-level (is_public) SELECT policy with a project-level (is_private) policy.

-- Ensure is_private column exists
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS is_private boolean NOT NULL DEFAULT false;

-- Drop all existing SELECT policies on projects to avoid conflicts
DROP POLICY IF EXISTS "projects_select_authenticated"        ON public.projects;
DROP POLICY IF EXISTS "projects_select_privacy_aware"        ON public.projects;

-- New policy: a project row is readable when ANY of these is true:
--   1. The viewer is the project owner
--   2. The viewer is a team member (project_members relational table)
--   3. The project is not private (is_private = false)
CREATE POLICY "projects_select_private_aware"
  ON public.projects FOR SELECT
  TO authenticated
  USING (
    auth.uid() = student_id
    OR NOT is_private
    OR EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = public.projects.id
        AND pm.user_id = auth.uid()
    )
  );
