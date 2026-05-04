-- Steply: User activity heatmap + analytics
-- Idempotent: safe to run multiple times.

-- ── user_activities: daily action counter per user ──────────────────────────
CREATE TABLE IF NOT EXISTS user_activities (
  id            UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date          DATE    NOT NULL DEFAULT CURRENT_DATE,
  activity_count INTEGER NOT NULL DEFAULT 1,
  UNIQUE (user_id, date)
);

ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone authenticated can read activities" ON user_activities;
CREATE POLICY "Anyone authenticated can read activities"
  ON user_activities FOR SELECT
  USING (auth.role() = 'authenticated');

-- Service role handles inserts/updates (called from server actions with admin client)

-- ── RPC: atomic upsert for activity increment ────────────────────────────────
CREATE OR REPLACE FUNCTION increment_user_activity(p_user_id UUID, p_date DATE)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_activities (user_id, date, activity_count)
  VALUES (p_user_id, p_date, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET activity_count = user_activities.activity_count + 1;
END;
$$;
