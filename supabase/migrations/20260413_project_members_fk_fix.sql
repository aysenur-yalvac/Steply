-- v0.4.6: Fix project_members.user_id FK to reference public.profiles instead of auth.users
-- This allows PostgREST to resolve the profiles join directly via the FK relationship.
-- Safe: profiles.id === auth.users.id (same UUID), so no data migration needed.

ALTER TABLE public.project_members
  DROP CONSTRAINT IF EXISTS project_members_user_id_fkey;

ALTER TABLE public.project_members
  ADD CONSTRAINT project_members_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.profiles(id)
    ON DELETE CASCADE;
