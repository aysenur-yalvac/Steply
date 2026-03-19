-- v0.3.8: Update search_users to return institution field
CREATE OR REPLACE FUNCTION search_users(search_query TEXT)
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    email TEXT,
    role TEXT,
    steply_score INTEGER,
    institution TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.full_name, p.email, p.role, p.steply_score, p.institution
    FROM profiles p
    WHERE p.full_name ILIKE '%' || search_query || '%'
       OR p.email ILIKE '%' || search_query || '%';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
