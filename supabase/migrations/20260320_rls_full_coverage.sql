-- v0.3.9: Full RLS coverage for profiles, projects, comments, ratings, followers
-- All tables: SELECT open to authenticated users; INSERT/UPDATE/DELETE restricted to owner only.

-- ─────────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read any profile (social platform behaviour)
CREATE POLICY "profiles_select_authenticated"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can only insert their own profile row
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can only delete their own profile
CREATE POLICY "profiles_delete_own"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- ─────────────────────────────────────────────
-- PROJECTS
-- ─────────────────────────────────────────────
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects_select_authenticated"
  ON public.projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "projects_insert_own"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "projects_update_own"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "projects_delete_own"
  ON public.projects FOR DELETE
  TO authenticated
  USING (auth.uid() = student_id);

-- ─────────────────────────────────────────────
-- COMMENTS
-- ─────────────────────────────────────────────
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments_select_authenticated"
  ON public.comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "comments_insert_own"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comments_update_own"
  ON public.comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comments_delete_own"
  ON public.comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- RATINGS
-- ─────────────────────────────────────────────
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ratings_select_authenticated"
  ON public.ratings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "ratings_insert_own"
  ON public.ratings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ratings_update_own"
  ON public.ratings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ratings_delete_own"
  ON public.ratings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- FOLLOWERS
-- ─────────────────────────────────────────────
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "followers_select_authenticated"
  ON public.followers FOR SELECT
  TO authenticated
  USING (true);

-- Can only create a follow where you are the follower
CREATE POLICY "followers_insert_own"
  ON public.followers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

-- Can only delete follows you created (unfollow)
CREATE POLICY "followers_delete_own"
  ON public.followers FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- ─────────────────────────────────────────────
-- MESSAGES — add missing UPDATE/DELETE policies
-- (SELECT and INSERT already exist from phase1 migration)
-- ─────────────────────────────────────────────
CREATE POLICY "messages_delete_own"
  ON public.messages FOR DELETE
  TO authenticated
  USING (auth.uid() = sender_id);
