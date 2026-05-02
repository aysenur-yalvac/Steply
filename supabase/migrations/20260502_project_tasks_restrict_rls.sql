-- Steply: Restrict project_tasks SELECT to owner + members only.
-- Idempotent: safe to run multiple times.

-- Drop the old open-read policy
DROP POLICY IF EXISTS "Anyone can view project tasks" ON project_tasks;

-- New restricted policy — mirrors project_activities access control
DROP POLICY IF EXISTS "Project team can view tasks" ON project_tasks;
CREATE POLICY "Project team can view tasks"
  ON project_tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_tasks.project_id
        AND projects.student_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = project_tasks.project_id
        AND project_members.user_id = auth.uid()
    )
  );

-- Service role (admin client) bypasses RLS — no ALL policy needed.
