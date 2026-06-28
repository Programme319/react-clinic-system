-- Admin dashboard + staff list RPCs (bypass users-table RLS safely)
-- Run in Supabase → SQL Editor after auth_hardening.sql

CREATE OR REPLACE FUNCTION public.assert_admin_caller(p_caller_id BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM users
    WHERE id = p_caller_id
      AND COALESCE(is_active, true) = true
      AND role = 'Administrator'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats(p_caller_id BIGINT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_staff INTEGER := 0;
  v_patients INTEGER := 0;
  v_invoices INTEGER := 0;
  v_appointments INTEGER := 0;
BEGIN
  IF NOT public.assert_admin_caller(p_caller_id) THEN
    RETURN json_build_object('success', false, 'message', 'Administrator access required');
  END IF;

  SELECT COUNT(*)::INTEGER INTO v_staff
  FROM users
  WHERE COALESCE(is_active, true) = true
    AND role IN ('Doctor', 'Pharmacist', 'Nurse', 'Administrator');

  SELECT COUNT(*)::INTEGER INTO v_patients FROM patients;

  IF to_regclass('public.invoices') IS NOT NULL THEN
    SELECT COUNT(*)::INTEGER INTO v_invoices FROM invoices;
  END IF;

  IF to_regclass('public.appointments') IS NOT NULL THEN
    SELECT COUNT(*)::INTEGER INTO v_appointments FROM appointments;
  END IF;

  RETURN json_build_object(
    'success', true,
    'staff', v_staff,
    'patients', v_patients,
    'invoices', v_invoices,
    'appointments', v_appointments
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_stats(BIGINT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.list_staff_users(p_caller_id BIGINT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_staff JSON;
BEGIN
  IF NOT public.assert_admin_caller(p_caller_id) THEN
    RETURN json_build_object('success', false, 'message', 'Administrator access required');
  END IF;

  SELECT COALESCE(json_agg(row_to_json(s) ORDER BY s.name), '[]'::JSON)
  INTO v_staff
  FROM (
    SELECT id, name, email, role, is_active, created_at
    FROM users
    WHERE role IN ('Doctor', 'Pharmacist', 'Nurse', 'Administrator')
    ORDER BY name
  ) s;

  RETURN json_build_object('success', true, 'staff', v_staff);
END;
$$;

GRANT EXECUTE ON FUNCTION public.list_staff_users(BIGINT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.set_staff_active(
  p_caller_id BIGINT,
  p_user_id BIGINT,
  p_is_active BOOLEAN
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.assert_admin_caller(p_caller_id) THEN
    RETURN json_build_object('success', false, 'message', 'Administrator access required');
  END IF;

  IF p_caller_id = p_user_id AND p_is_active = false THEN
    RETURN json_build_object('success', false, 'message', 'You cannot deactivate your own account');
  END IF;

  UPDATE users
  SET is_active = p_is_active, updated_at = NOW()
  WHERE id = p_user_id
    AND role IN ('Doctor', 'Pharmacist', 'Nurse', 'Administrator');

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Staff member not found');
  END IF;

  RETURN json_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_staff_active(BIGINT, BIGINT, BOOLEAN) TO anon, authenticated;

-- Allow patient reads/writes from the app (users table stays RPC-only)
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['patients', 'patient_investigations', 'patient_medications'] LOOP
    IF to_regclass(format('public.%I', t)) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
      EXECUTE format('DROP POLICY IF EXISTS "app_all_%I" ON public.%I', t, t);
      EXECUTE format(
        'CREATE POLICY "app_all_%I" ON public.%I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)',
        t, t
      );
    END IF;
  END LOOP;
END $$;
