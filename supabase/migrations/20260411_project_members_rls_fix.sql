-- v0.4.5: Idempotent RLS fix for project_members INSERT/DELETE policies
-- Ensures the table and all owner policies exist regardless of migration order.

-- ─────────────────────────────────────────────
-- TABLE (idempotent)
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

-- ─────────────────────────────────────────────
-- RLS POLICIES (drop-and-recreate for idempotency)
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "project_members_select_authenticated" ON public.project_members;
DROP POLICY IF EXISTS "project_members_insert_owner"         ON public.project_members;
DROP POLICY IF EXISTS "project_members_delete_owner"         ON public.project_members;

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
-- PROJECTS UPDATE POLICY (idempotent)
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "projects_update_own"           ON public.projects;
DROP POLICY IF EXISTS "projects_update_own_or_member" ON public.projects;

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
