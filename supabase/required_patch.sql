-- Minimal patch for role-based HMS (run once in Supabase SQL Editor)
-- Safe to re-run (IF NOT EXISTS / OR REPLACE)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Role column on users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'Nurse';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. Prescription workflow status on medications
ALTER TABLE public.patient_medications ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'pending';
ALTER TABLE public.patient_medications ADD COLUMN IF NOT EXISTS prescribed_by BIGINT REFERENCES public.users(id);
ALTER TABLE public.patient_medications ADD COLUMN IF NOT EXISTS approved_by BIGINT REFERENCES public.users(id);

-- 3. Audit trail
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES public.users(id),
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100),
  resource_id VARCHAR(50),
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff insert audit" ON public.audit_logs;
CREATE POLICY "Staff insert audit" ON public.audit_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Staff read audit" ON public.audit_logs;
CREATE POLICY "Staff read audit" ON public.audit_logs FOR SELECT TO anon, authenticated USING (true);

-- 4. Nurse vitals
CREATE TABLE IF NOT EXISTS public.patient_vitals (
  id BIGSERIAL PRIMARY KEY,
  patient_id BIGINT NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  nurse_id BIGINT REFERENCES public.users(id),
  blood_pressure VARCHAR(20),
  heart_rate INTEGER,
  temperature NUMERIC(4,1),
  oxygen_saturation INTEGER,
  notes TEXT,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Nurse tasks
CREATE TABLE IF NOT EXISTS public.nurse_tasks (
  id BIGSERIAL PRIMARY KEY,
  patient_id BIGINT NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  assigned_nurse_id BIGINT REFERENCES public.users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(30) DEFAULT 'pending',
  due_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. MAR
CREATE TABLE IF NOT EXISTS public.mar_records (
  id BIGSERIAL PRIMARY KEY,
  patient_id BIGINT NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  medication_id BIGINT REFERENCES public.patient_medications(id),
  nurse_id BIGINT REFERENCES public.users(id),
  scheduled_at TIMESTAMPTZ,
  administered_at TIMESTAMPTZ,
  status VARCHAR(30) DEFAULT 'scheduled',
  notes TEXT
);

-- 7. Appointments
CREATE TABLE IF NOT EXISTS public.appointments (
  id BIGSERIAL PRIMARY KEY,
  patient_id BIGINT NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id BIGINT REFERENCES public.users(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(30) DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Pharmacy inventory
CREATE TABLE IF NOT EXISTS public.drug_inventory (
  id BIGSERIAL PRIMARY KEY,
  med_code VARCHAR(100) NOT NULL,
  med_name VARCHAR(255) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  unit VARCHAR(50) DEFAULT 'units',
  reorder_level INTEGER DEFAULT 10,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Dispensing log
CREATE TABLE IF NOT EXISTS public.dispensing_log (
  id BIGSERIAL PRIMARY KEY,
  medication_id BIGINT REFERENCES public.patient_medications(id),
  pharmacist_id BIGINT REFERENCES public.users(id),
  quantity INTEGER DEFAULT 1,
  dispensed_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- 10. Billing (admin only)
CREATE TABLE IF NOT EXISTS public.invoices (
  id BIGSERIAL PRIMARY KEY,
  patient_id BIGINT REFERENCES public.patients(id),
  amount NUMERIC(10,2) NOT NULL,
  status VARCHAR(30) DEFAULT 'pending',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  due_at TIMESTAMPTZ
);

-- RLS: allow authenticated/anon access for clinic app (tighten in production)
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['patient_vitals','nurse_tasks','mar_records','appointments','drug_inventory','dispensing_log','invoices'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "app_all_%I" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "app_all_%I" ON public.%I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)', t, t);
  END LOOP;
END $$;

-- 11. Login RPC (verifies Laravel bcrypt passwords)
CREATE OR REPLACE FUNCTION public.login_user(p_email TEXT, p_password TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
  IF v_hash LIKE '$2y$%' THEN
    v_hash := '$2a$' || substring(v_hash from 5);
  END IF;

  IF crypt(p_password, v_hash) = v_hash THEN
    RETURN json_build_object(
      'success', true,
      'user', json_build_object(
        'id', v_user.id,
        'name', v_user.name,
        'email', v_user.email,
        'role', COALESCE(v_user.role, 'Nurse')
      )
    );
  END IF;

  RETURN json_build_object('success', false, 'message', 'Invalid email or password');
END;
$$;

GRANT EXECUTE ON FUNCTION public.login_user(TEXT, TEXT) TO anon, authenticated;

-- 12. Register user (admin creates staff — bcrypt hash server-side)
CREATE OR REPLACE FUNCTION public.create_staff_user(
  p_name TEXT, p_email TEXT, p_password TEXT, p_role TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO users (name, email, password, role, created_at, updated_at)
  VALUES (p_name, p_email, crypt(p_password, gen_salt('bf')), p_role, NOW(), NOW());
  RETURN json_build_object('success', true);
EXCEPTION WHEN unique_violation THEN
  RETURN json_build_object('success', false, 'message', 'Email already exists');
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_staff_user(TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
