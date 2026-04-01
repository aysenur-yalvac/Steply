-- v0.4.1: project_members relational table + member-based project update access

-- ─────────────────────────────────────────────
-- TABLE: project_members
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.project_members (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id    uuid        NOT NULL REFERENCES auth.users(id)      ON DELETE CASCADE,
  role       text        NOT NULL DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, user_id)
);

ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read membership records
CREATE POLICY "project_members_select_authenticated"
  ON public.project_members FOR SELECT
  TO authenticated
  USING (true);

-- Only project owner can add members
CREATE POLICY "project_members_insert_owner"
  ON public.project_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_id AND student_id = auth.uid()
    )
  );

-- Only project owner can remove members
CREATE POLICY "project_members_delete_owner"
  ON public.project_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_id AND student_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────
-- RLS: Allow project members to UPDATE projects
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "projects_update_own" ON public.projects;

CREATE POLICY "projects_update_own_or_member"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = student_id
    OR EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_id = id AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = student_id
    OR EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_id = id AND user_id = auth.uid()
    )
  );
