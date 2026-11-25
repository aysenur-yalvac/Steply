-- Add department column to profiles and deduplicate Kütahya Sağlık Bilimleri Üniversitesi
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department text;

DELETE FROM public.universities
WHERE name = 'Kütahya Sağlık Bilimleri Üniversitesi (KSBÜ)';

UPDATE public.profiles
SET institution = 'Kütahya Sağlık Bilimleri Üniversitesi'
WHERE institution = 'Kütahya Sağlık Bilimleri Üniversitesi (KSBÜ)';
