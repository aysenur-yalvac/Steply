-- 0.3.5 DB Schema Repair
-- Add the 'institution' column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS institution text;

-- Important: To clear schema cache in Supabase so the API recognizes it:
-- Reload postgREST or go to your API settings and clear schema cache.
NOTIFY pgrst, 'reload schema';
