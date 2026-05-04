-- Linked accounts: lets a user bookmark other accounts for quick switching
CREATE TABLE IF NOT EXISTS linked_accounts (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_user_id   UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  linked_user_id  UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  linked_email    TEXT        NOT NULL,
  linked_name     TEXT,
  linked_avatar   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (owner_user_id, linked_email)
);

ALTER TABLE linked_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owners can manage own linked accounts"
  ON linked_accounts FOR ALL
  USING (owner_user_id = auth.uid());

-- Helper: look up a user ID by email (used by addLinkedAccountAction server action)
CREATE OR REPLACE FUNCTION get_user_id_by_email(p_email TEXT)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM auth.users WHERE lower(email) = lower(p_email) LIMIT 1;
$$;
