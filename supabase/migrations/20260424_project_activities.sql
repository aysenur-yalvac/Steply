-- Steply: Project Activity Stream
-- Apply this in Supabase SQL Editor before deploying activity features.
-- Idempotent: safe to run multiple times.

CREATE TABLE IF NOT EXISTS project_activities (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id      UUID NOT NULL,
  action_type  TEXT NOT NULL,
  description  TEXT NOT NULL,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE project_activities ENABLE ROW LEVEL SECURITY;

-- Only the project owner and collaborators (project_members) can read activity logs.
-- Teachers and unrelated authenticated users are explicitly excluded.
DROP POLICY IF EXISTS "Project team can view activities" ON project_activities;
CREATE POLICY "Project team can view activities"
  ON project_activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_activities.project_id
        AND projects.student_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = project_activities.project_id
        AND project_members.user_id = auth.uid()
    )
  );

-- Service role (admin client used by server actions) bypasses RLS automatically —
-- no INSERT policy needed; this avoids opening SELECT to all authenticated users.

CREATE INDEX IF NOT EXISTS project_activities_project_id_idx ON project_activities(project_id);
CREATE INDEX IF NOT EXISTS project_activities_project_created_idx ON project_activities(project_id, created_at DESC);
