-- Migration for Collaboration and Social Module - Phase 1: Search and Messaging

-- 1. Setup metadata column for messages table
-- We alter the existing messages table (created in initial_schema.sql)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 2. Setup pg_trgm for ultra-fast searching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN indexes on profiles table for full_name and email
CREATE INDEX IF NOT EXISTS trgm_idx_profiles_full_name ON profiles USING gin (full_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS trgm_idx_profiles_email ON profiles USING gin (email gin_trgm_ops);

-- 3. Create User Search Function utilizing the GIN index
CREATE OR REPLACE FUNCTION search_users(search_query TEXT)
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    email TEXT,
    role TEXT,
    steply_score INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.full_name, p.email, p.role, p.steply_score
    FROM profiles p
    WHERE p.full_name ILIKE '%' || search_query || '%'
       OR p.email ILIKE '%' || search_query || '%';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update Profiles Table to include Email if it doesn't exist (from previous setup)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

-- 4. Setup Realtime for messages table
-- Check if publication exists, and add messages table to it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    -- In Supabase, usually the publication is created automatically.
    -- We can try to add the table to it.
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE messages';
  END IF;
EXCEPTION WHEN undefined_object THEN
  -- Ignore if publication doesn't exist (local dev environments without realtime enabled)
  NULL;
END
$$;

-- 5. RLS Policies for Messages Table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid errors on re-run
DROP POLICY IF EXISTS "Users can read their own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;

-- Allow users to read messages where they are the sender or receiver
CREATE POLICY "Users can read their own messages" 
ON messages FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Allow users to insert messages where they are the sender
CREATE POLICY "Users can send messages" 
ON messages FOR INSERT 
WITH CHECK (auth.uid() = sender_id);
