-- Enable unaccent extension (idempotent)
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Full-text profile search with unaccent support for Turkish characters
CREATE OR REPLACE FUNCTION search_profiles_unaccent(search_query text)
RETURNS TABLE(id uuid, full_name text, avatar_url text, is_public boolean, role text)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, full_name, avatar_url, is_public, role
  FROM profiles
  WHERE unaccent(lower(full_name)) LIKE unaccent(lower('%' || search_query || '%'))
  LIMIT 10;
$$;
