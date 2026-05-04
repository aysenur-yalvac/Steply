-- Migration: Weighted Scoring System
-- Adds daily_score to user_activities and creates record_user_action RPC

-- 1. Add daily_score column (no-op if already exists)
ALTER TABLE user_activities
  ADD COLUMN IF NOT EXISTS daily_score INTEGER DEFAULT 0;

-- 2. Create/replace the record_user_action stored procedure
CREATE OR REPLACE FUNCTION record_user_action(p_user_id UUID, p_action_type TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_points INTEGER;
  v_today  DATE := CURRENT_DATE;
BEGIN
  v_points := CASE p_action_type
    WHEN 'create_project' THEN 10
    WHEN 'complete_task'  THEN 5
    WHEN 'add_comment'    THEN 2
    WHEN 'add_log'        THEN 2
    ELSE                       1
  END;

  -- Atomic upsert: increment both activity_count and daily_score
  INSERT INTO user_activities (user_id, date, activity_count, daily_score)
  VALUES (p_user_id, v_today, 1, v_points)
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    activity_count = user_activities.activity_count + 1,
    daily_score    = user_activities.daily_score    + v_points;

  -- Increment leaderboard score on profiles
  UPDATE profiles
  SET total_score = COALESCE(total_score, 0) + v_points
  WHERE id = p_user_id;
END;
$$;
