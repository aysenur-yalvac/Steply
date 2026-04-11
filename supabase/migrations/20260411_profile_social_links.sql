-- Add twitter_url and website_url columns to profiles (idempotent)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS twitter_url  text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS website_url  text DEFAULT NULL;
