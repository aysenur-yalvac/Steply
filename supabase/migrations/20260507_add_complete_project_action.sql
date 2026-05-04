-- Migration: Add 'complete_project' (20 pts) to record_user_action RPC
-- Recreates the function with the updated CASE statement

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
    WHEN 'create_project'   THEN 10
    WHEN 'complete_project' THEN 20
    WHEN 'complete_task'    THEN 5
    WHEN 'add_comment'      THEN 2
    WHEN 'add_log'          THEN 2
    ELSE                         1
  END;

  INSERT INTO user_activities (user_id, date, activity_count, daily_score)
  VALUES (p_user_id, v_today, 1, v_points)
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    activity_count = user_activities.activity_count + 1,
    daily_score    = user_activities.daily_score    + v_points;

  UPDATE profiles
  SET total_score = COALESCE(total_score, 0) + v_points
  WHERE id = p_user_id;
END;
$$;
