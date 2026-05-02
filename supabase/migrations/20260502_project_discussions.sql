-- Steply: Project Discussions (team-only notes/chat)
-- NOTE: "project_notes" table is already used for teacher quick-notes (teacher_id column).
-- This table serves team discussion — owner + collaborators only.
-- Idempotent: safe to run multiple times.

CREATE TABLE IF NOT EXISTS project_discussions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id      UUID NOT NULL,
  content      TEXT NOT NULL,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE project_discussions ENABLE ROW LEVEL SECURITY;

-- SELECT: owner + members only
DROP POLICY IF EXISTS "Project team can read discussions" ON project_discussions;
CREATE POLICY "Project team can read discussions"
  ON project_discussions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_discussions.project_id
        AND projects.student_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = project_discussions.project_id
        AND project_members.user_id = auth.uid()
    )
  );

-- INSERT: owner + members only (must be inserting as themselves)
DROP POLICY IF EXISTS "Project team can insert discussions" ON project_discussions;
CREATE POLICY "Project team can insert discussions"
  ON project_discussions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (
      EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = project_discussions.project_id
          AND projects.student_id = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM project_members
        WHERE project_members.project_id = project_discussions.project_id
          AND project_members.user_id = auth.uid()
      )
    )
  );

CREATE INDEX IF NOT EXISTS project_discussions_project_id_idx ON project_discussions(project_id);
CREATE INDEX IF NOT EXISTS project_discussions_project_created_idx ON project_discussions(project_id, created_at ASC);
