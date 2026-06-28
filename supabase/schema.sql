-- Reference schema matching your existing database structure.
-- Only run supabase/required_patch.sql if role + audit columns are missing.

-- Users (Laravel-style)
-- Required app column (add via required_patch.sql): role VARCHAR — Doctor | Pharmacist | Nurse | Administrator

-- Patients columns used by the app:
-- id, name, clinic_code, complaint, diagnosis_text, doctor_name, pharmacist_name,
-- date_of_birth, email, phone, created_at, updated_at

-- Related: patient_investigations, patient_medications
