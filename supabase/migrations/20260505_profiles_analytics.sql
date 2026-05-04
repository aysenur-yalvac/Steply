-- Steply: Add analytics columns to profiles
-- Idempotent: safe to run multiple times.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS university  TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_score INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS badges      TEXT[]  DEFAULT '{}';

COMMENT ON COLUMN profiles.university   IS 'User university/institution name for leaderboard filtering';
COMMENT ON COLUMN profiles.total_score  IS 'Cumulative activity score for leaderboard ranking';
COMMENT ON COLUMN profiles.badges       IS 'Array of earned badge IDs';
