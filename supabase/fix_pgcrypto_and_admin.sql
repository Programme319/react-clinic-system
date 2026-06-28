-- Step 1: Enable pgcrypto (fixes "function crypt(text, text) does not exist")
-- Run in Supabase → SQL Editor

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Step 2: Fix login function to use extensions.crypt
CREATE OR REPLACE FUNCTION public.login_user(p_email TEXT, p_password TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_user users%ROWTYPE;
  v_hash TEXT;
BEGIN
  SELECT * INTO v_user FROM users WHERE LOWER(email) = LOWER(p_email) AND COALESCE(is_active, true) = true LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Invalid email or password');
  END IF;

  v_hash := v_user.password;
  IF v_hash LIKE '$2y$%' OR v_hash LIKE '$2b$%' THEN
    v_hash := '$2a$' || substring(v_hash from 5);
  END IF;

  IF v_user.role IS NULL OR v_user.role NOT IN ('Doctor', 'Pharmacist', 'Nurse', 'Administrator') THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Account not authorized. Contact your administrator to assign a staff role.'
    );
  END IF;

  IF extensions.crypt(p_password, v_hash) = v_hash THEN
    RETURN json_build_object(
      'success', true,
      'user', json_build_object(
        'id', v_user.id,
        'name', v_user.name,
        'email', v_user.email,
        'role', v_user.role
      )
    );
  END IF;

  RETURN json_build_object('success', false, 'message', 'Invalid email or password');
END;
$$;

GRANT EXECUTE ON FUNCTION public.login_user(TEXT, TEXT) TO anon, authenticated;

-- Step 3: Insert admin (pre-hashed password — no crypt() needed here)
-- Password: Admin@Clinic2024!

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
  password = EXCLUDED.password,
  role = 'Administrator',
  is_active = true,
  updated_at = NOW();

SELECT id, name, email, role FROM public.users WHERE email = 'fiinihamqtolon@gmail.com';
