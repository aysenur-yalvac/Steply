-- Steply: Add profile fields used by Settings (company, location, school info)
-- These columns were already read/written by the Settings UI but never migrated,
-- causing updateProfileAction's single UPDATE to fail for every field at once.
-- Idempotent: safe to run multiple times.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS grade TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS school_number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS school_email TEXT;
