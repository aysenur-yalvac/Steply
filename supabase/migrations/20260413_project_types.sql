-- ── project_types: auto-learning suggestion table ──────────────────────────
-- Stores unique project type names + usage counts for smart suggestions.
-- Written via service-role (admin) client only; readable by all authenticated users.

CREATE TABLE IF NOT EXISTS public.project_types (
  id          uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name        text        NOT NULL,
  usage_count integer     NOT NULL DEFAULT 1,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT project_types_name_unique UNIQUE (name)
);

-- Index for fast ORDER BY usage_count DESC queries
CREATE INDEX IF NOT EXISTS project_types_usage_idx ON public.project_types (usage_count DESC);

-- RLS: enable, allow SELECT for all authenticated users
ALTER TABLE public.project_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "project_types_read_auth" ON public.project_types;
CREATE POLICY "project_types_read_auth"
  ON public.project_types
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Writes (INSERT / UPDATE) done exclusively via service-role admin client.

-- ── Seed: popular starting types ────────────────────────────────────────────
INSERT INTO public.project_types (name, usage_count) VALUES
  ('Web App',            8),
  ('Mobile App',         7),
  ('REST API',           6),
  ('Machine Learning',   5),
  ('Desktop App',        4),
  ('Data Analysis',      4),
  ('Game',               3),
  ('CLI Tool',           3),
  ('Browser Extension',  2),
  ('Blockchain',         2),
  ('IoT',                2),
  ('DevOps / CI-CD',     1),
  ('Chrome Extension',   1),
  ('Bot / Automation',   1)
ON CONFLICT (name) DO NOTHING;
