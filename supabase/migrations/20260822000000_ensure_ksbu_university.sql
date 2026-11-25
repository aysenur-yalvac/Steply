-- Migration: Ensure Kütahya Sağlık Bilimleri Üniversitesi (KSBÜ) and universities RLS
-- Created to permanently fix KSBÜ missing from universities table and search RPC

-- 1. Ensure required extensions exist
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- 2. Ensure universities table exists
CREATE TABLE IF NOT EXISTS public.universities (
    id      SERIAL PRIMARY KEY,
    name    TEXT NOT NULL,
    country TEXT NOT NULL
);

-- 3. Ensure unique index on (lower(name), lower(country)) exists for idempotent upserts
CREATE UNIQUE INDEX IF NOT EXISTS universities_name_country_lower_idx
    ON public.universities (lower(name), lower(country));

-- 4. Enable Row Level Security (RLS) on universities
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;

-- 5. Define public SELECT policy (accessible to anon and authenticated users)
DROP POLICY IF EXISTS "universities_select_all" ON public.universities;
DROP POLICY IF EXISTS "Allow public read access on universities" ON public.universities;
CREATE POLICY "Allow public read access on universities"
    ON public.universities
    FOR SELECT
    TO public
    USING (true);

-- 6. Insert Kütahya Sağlık Bilimleri Üniversitesi (single canonical entry)
DELETE FROM public.universities WHERE name = 'Kütahya Sağlık Bilimleri Üniversitesi (KSBÜ)';

INSERT INTO public.universities (name, country)
VALUES
    ('Kütahya Sağlık Bilimleri Üniversitesi', 'Türkiye')
ON CONFLICT (lower(name), lower(country)) DO NOTHING;

-- Fallback insert using NOT EXISTS in case index was not present
INSERT INTO public.universities (name, country)
SELECT 'Kütahya Sağlık Bilimleri Üniversitesi', 'Türkiye'
WHERE NOT EXISTS (
    SELECT 1 FROM public.universities 
    WHERE lower(name) = lower('Kütahya Sağlık Bilimleri Üniversitesi')
);

-- 7. Update search_universities RPC with SECURITY DEFINER and alias handling
CREATE OR REPLACE FUNCTION public.search_universities(q text, lim int DEFAULT 12)
RETURNS TABLE(name text, country text)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT name, country
  FROM public.universities
  WHERE lower(unaccent(name)) LIKE '%' || lower(unaccent(q)) || '%'
     OR (lower(unaccent(q)) IN ('ksbu', 'ksbü') AND lower(unaccent(name)) LIKE '%kutahya saglik%')
  ORDER BY
    CASE WHEN lower(unaccent(name)) LIKE lower(unaccent(q)) || '%' THEN 0 ELSE 1 END,
    name
  LIMIT lim;
$$;

-- Grant execution to public, anon, and authenticated
GRANT EXECUTE ON FUNCTION public.search_universities(text, int) TO public, anon, authenticated;