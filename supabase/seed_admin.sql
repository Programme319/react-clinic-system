-- Create / reset Administrator (NO pgcrypto required)
-- Password: Admin@Clinic2024!
-- Run in Supabase → SQL Editor

-- If role column missing, run required_patch.sql first.

INSERT INTO public.users (name, email, password, role, is_active, created_at, updated_at)
VALUES (
  'System Administrator',
  'fiinihamqtolon@gmail.com',
  '$2y$10$LTTJhmX7YkbzWPWnsNeFx.XYkFnGGmIZYg8YG3nvfxWS4cFJSuf0y',
  'Administrator',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  password = EXCLUDED.password,
  role = 'Administrator',
  is_active = true,
  updated_at = NOW();

SELECT id, name, email, role, is_active
FROM public.users
WHERE email = 'fiinihamqtolon@gmail.com';
