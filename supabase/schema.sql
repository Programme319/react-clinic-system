-- Clinic System Schema (Supabase)
-- Run in Supabase Dashboard → SQL Editor
--
-- Auth: uses Supabase Auth (auth.users). Passwords are NOT stored in public.users.
-- Get keys from: Project Settings → API → Project URL + anon public key

-- ==========================================
-- 1. USER & ROLE MANAGEMENT
-- ==========================================

CREATE TYPE staff_role AS ENUM ('Doctor', 'Pharmacist', 'Clinic Staff', 'Administrator');

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role staff_role NOT NULL DEFAULT 'Clinic Staff',
    email_verified_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patients (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NULL,
    phone VARCHAR(50) NULL,
    date_of_birth DATE NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. MEDICAL DATA TRACKING
-- ==========================================

CREATE TABLE IF NOT EXISTS patient_investigations (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    test_code VARCHAR(100) NOT NULL,
    test_name VARCHAR(255) NOT NULL,
    test_result TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patient_medications (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    med_code VARCHAR(100) NOT NULL,
    med_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 3. AI CHATBOT LOGS & CONTEXT
-- ==========================================

CREATE TABLE IF NOT EXISTS chatbot_sessions (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chatbot_messages (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES chatbot_sessions(id) ON DELETE CASCADE,
    sender VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    is_emergency_detected BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 4. INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_investigations_patient ON patient_investigations(patient_id);
CREATE INDEX IF NOT EXISTS idx_medications_patient ON patient_medications(patient_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chatbot_messages(session_id);

-- ==========================================
-- 5. ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_investigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_messages ENABLE ROW LEVEL SECURITY;

-- Staff profiles
DROP POLICY IF EXISTS "Users read own profile" ON users;
CREATE POLICY "Users read own profile" ON users FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own profile" ON users;
CREATE POLICY "Users update own profile" ON users FOR UPDATE TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users insert own profile" ON users;
CREATE POLICY "Users insert own profile" ON users FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Clinic data (all authenticated staff)
DROP POLICY IF EXISTS "Staff read patients" ON patients;
CREATE POLICY "Staff read patients" ON patients FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Staff insert patients" ON patients;
CREATE POLICY "Staff insert patients" ON patients FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Staff update patients" ON patients;
CREATE POLICY "Staff update patients" ON patients FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Staff delete patients" ON patients;
CREATE POLICY "Staff delete patients" ON patients FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "Staff read investigations" ON patient_investigations;
CREATE POLICY "Staff read investigations" ON patient_investigations FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Staff insert investigations" ON patient_investigations;
CREATE POLICY "Staff insert investigations" ON patient_investigations FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Staff read medications" ON patient_medications;
CREATE POLICY "Staff read medications" ON patient_medications FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Staff insert medications" ON patient_medications;
CREATE POLICY "Staff insert medications" ON patient_medications FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Staff read chat sessions" ON chatbot_sessions;
CREATE POLICY "Staff read chat sessions" ON chatbot_sessions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Staff insert chat sessions" ON chatbot_sessions;
CREATE POLICY "Staff insert chat sessions" ON chatbot_sessions FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Staff read chat messages" ON chatbot_messages;
CREATE POLICY "Staff read chat messages" ON chatbot_messages FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Staff insert chat messages" ON chatbot_messages;
CREATE POLICY "Staff insert chat messages" ON chatbot_messages FOR INSERT TO authenticated WITH CHECK (true);

-- ==========================================
-- 6. AUTO-CREATE STAFF PROFILE ON SIGNUP
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email,
    COALESCE((new.raw_user_meta_data ->> 'role')::public.staff_role, 'Clinic Staff')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
