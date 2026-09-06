-- ─────────────────────────────────────────────────────────────────────────────
-- AccBots — Default User Accounts Seed
-- Run this in: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────
-- Credentials:
--   Super Admin → admin@accbot.com  / Admin@12345
--   Regular User → user@accbot.com  / User@12345
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.users (full_name, email, password_hash, role, is_active)
VALUES
  (
    'Super Admin',
    'admin@accbot.com',
    '$2b$12$J7.CBVUaqrSRuIsVmufPPupnu2GIZyGT1rz25TYYfkzFcDeDEDHTW',
    'super_admin',
    true
  ),
  (
    'Test User',
    'user@accbot.com',
    '$2b$12$pEES2YCAFCSl3PvWBRV0QuTcyZJfJOsurlwI8DZaj27.N8UbpUCNO',
    'user',
    true
  )
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role          = EXCLUDED.role,
  is_active     = EXCLUDED.is_active,
  updated_at    = NOW();
