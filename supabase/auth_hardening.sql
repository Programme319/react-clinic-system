-- Run in Supabase SQL Editor to lock down staff sign-in
-- Rejects users without a valid role, inactive accounts, and public self-registration

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Hardened login: active staff with assigned role only
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
  SELECT * INTO v_user
  FROM users
  WHERE LOWER(email) = LOWER(p_email)
    AND COALESCE(is_active, true) = true
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Invalid email or password');
  END IF;

  IF v_user.role IS NULL OR v_user.role NOT IN ('Doctor', 'Pharmacist', 'Nurse', 'Administrator') THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Account not authorized. Contact your administrator to assign a staff role.'
    );
  END IF;

  v_hash := v_user.password;
  IF v_hash LIKE '$2y$%' OR v_hash LIKE '$2b$%' THEN
    v_hash := '$2a$' || substring(v_hash from 5);
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

-- Re-validate session on app load (not just localStorage trust)
CREATE OR REPLACE FUNCTION public.validate_staff_session(p_user_id BIGINT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user users%ROWTYPE;
BEGIN
  SELECT * INTO v_user
  FROM users
  WHERE id = p_user_id
    AND COALESCE(is_active, true) = true
    AND role IN ('Doctor', 'Pharmacist', 'Nurse', 'Administrator')
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Session invalid or account deactivated');
  END IF;

  RETURN json_build_object(
    'success', true,
    'user', json_build_object(
      'id', v_user.id,
      'name', v_user.name,
      'email', v_user.email,
      'role', v_user.role
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.validate_staff_session(BIGINT) TO anon, authenticated;

-- Staff creation: administrators only
DROP FUNCTION IF EXISTS public.create_staff_user(TEXT, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.create_staff_user(
  p_caller_id BIGINT,
  p_name TEXT,
  p_email TEXT,
  p_password TEXT,
  p_role TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_caller users%ROWTYPE;
BEGIN
  SELECT * INTO v_caller
  FROM users
  WHERE id = p_caller_id
    AND COALESCE(is_active, true) = true
    AND role = 'Administrator'
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Only administrators can create staff accounts');
  END IF;

  IF p_role NOT IN ('Doctor', 'Pharmacist', 'Nurse', 'Administrator') THEN
    RETURN json_build_object('success', false, 'message', 'Invalid role');
  END IF;

  INSERT INTO users (name, email, password, role, is_active, created_at, updated_at)
  VALUES (
    p_name,
    p_email,
    extensions.crypt(p_password, extensions.gen_salt('bf')),
    p_role,
    true,
    NOW(),
    NOW()
  );

  RETURN json_build_object('success', true);
EXCEPTION WHEN unique_violation THEN
  RETURN json_build_object('success', false, 'message', 'Email already exists');
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_staff_user(BIGINT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
