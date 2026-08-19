-- Add invite fields to projects table
ALTER TABLE public.projects
  ADD COLUMN invite_code VARCHAR(6) UNIQUE,
  ADD COLUMN invite_token UUID UNIQUE DEFAULT gen_random_uuid();

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_projects_invite_code ON public.projects(invite_code);
CREATE INDEX IF NOT EXISTS idx_projects_invite_token ON public.projects(invite_token);

-- Backfill existing projects with random 6-character alphanumeric codes
-- (A simple way using md5 and substring)
UPDATE public.projects
SET invite_code = upper(substring(md5(random()::text) from 1 for 6))
WHERE invite_code IS NULL;

-- Create an RPC to allow users to join by code bypassing RLS on project_members insert
-- Note: Security Definer ensures it runs with the privileges of the creator
CREATE OR REPLACE FUNCTION join_project_by_code(p_code TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_project_id UUID;
    v_user_id UUID;
BEGIN
    -- Get current authenticated user
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Find project by code
    SELECT id INTO v_project_id
    FROM public.projects
    WHERE invite_code = p_code;

    IF v_project_id IS NULL THEN
        RAISE EXCEPTION 'Invalid invite code';
    END IF;

    -- Insert into project_members if not already a member
    INSERT INTO public.project_members (project_id, user_id, role)
    VALUES (v_project_id, v_user_id, 'member')
    ON CONFLICT (project_id, user_id) DO NOTHING;

    RETURN v_project_id;
END;
$$;
