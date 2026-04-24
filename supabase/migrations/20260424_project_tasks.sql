-- Steply: Project Tasks (To-Do / Milestones)
-- Apply this in Supabase SQL Editor before deploying project task features.

CREATE TABLE IF NOT EXISTS project_tasks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  title        TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

-- Service role (used by admin client in actions) bypasses RLS automatically.
-- These policies cover anon/authenticated reads for the project detail page.
CREATE POLICY "Anyone can view project tasks"
  ON project_tasks FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage project tasks"
  ON project_tasks FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS project_tasks_project_id_idx ON project_tasks(project_id);
