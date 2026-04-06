-- Add is_public column to profiles (default: true = public profile)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT true;
