-- Steply: Add tags column to projects table
-- Idempotent: safe to run multiple times.

ALTER TABLE projects ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

COMMENT ON COLUMN projects.tags IS 'Free-form string tags for filtering/search';
