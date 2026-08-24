-- ================================================================
-- Migration: Email OTP Codes Table
-- ================================================================

CREATE TABLE IF NOT EXISTS public.email_otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Guvenlik: RLS aktif
ALTER TABLE public.email_otp_codes ENABLE ROW LEVEL SECURITY;

-- Kullanicilarin veya adminlerin okumasi/yazmasi icin: 
-- Aslinda API service_role ile erisecegi icin RLS policy gerekli degildir (service_role bypass eder).
