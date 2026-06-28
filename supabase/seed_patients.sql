-- Sample patient data for ClinicCare (safe to re-run — skips existing clinic codes)
-- Run in Supabase → SQL Editor after admin_rpcs.sql

INSERT INTO public.patients (
  name, clinic_code, complaint, diagnosis_text, doctor_name, pharmacist_name,
  date_of_birth, email, phone, created_at, updated_at
)
SELECT v.name, v.clinic_code, v.complaint, v.diagnosis_text, v.doctor_name, v.pharmacist_name,
       v.date_of_birth::DATE, v.email, v.phone, NOW(), NOW()
FROM (VALUES
  ('Ahmed Hassan', 'CC-001', 'Persistent headache and low-grade fever for 3 days', 'Viral upper respiratory infection', 'Dr. Sarah Okonkwo', 'Pharm. James Mwangi', '1985-03-14', 'ahmed.hassan@example.com', '+254712345001'),
  ('Fatima Ali', 'CC-002', 'Chest tightness when climbing stairs', 'Mild asthma exacerbation', 'Dr. Sarah Okonkwo', 'Pharm. James Mwangi', '1992-07-22', 'fatima.ali@example.com', '+254712345002'),
  ('John Mbeki', 'CC-003', 'Lower back pain after lifting heavy boxes', 'Lumbar muscle strain', 'Dr. David Chen', 'Pharm. Amina Yusuf', '1978-11-05', 'john.mbeki@example.com', '+254712345003'),
  ('Grace Wanjiku', 'CC-004', 'Frequent urination and increased thirst', 'Type 2 diabetes — newly diagnosed', 'Dr. David Chen', 'Pharm. Amina Yusuf', '1968-01-30', 'grace.wanjiku@example.com', '+254712345004'),
  ('Omar Farah', 'CC-005', 'Skin rash on arms and neck', 'Contact dermatitis', 'Dr. Sarah Okonkwo', 'Pharm. James Mwangi', '2001-09-18', 'omar.farah@example.com', '+254712345005'),
  ('Linda Ochieng', 'CC-006', 'Chronic cough lasting 6 weeks', 'Post-infectious cough', 'Dr. David Chen', 'Pharm. Amina Yusuf', '1990-04-12', 'linda.ochieng@example.com', '+254712345006'),
  ('Peter Kamau', 'CC-007', 'Knee swelling after sports injury', 'Patellar contusion', 'Dr. Sarah Okonkwo', 'Pharm. James Mwangi', '1995-12-08', 'peter.kamau@example.com', '+254712345007'),
  ('Hawa Mohamed', 'CC-008', 'Abdominal cramps and nausea', 'Gastroenteritis', 'Dr. David Chen', 'Pharm. Amina Yusuf', '1988-06-25', 'hawa.mohamed@example.com', '+254712345008'),
  ('Daniel Otieno', 'CC-009', 'Elevated blood pressure at health screening', 'Hypertension stage 1', 'Dr. Sarah Okonkwo', 'Pharm. James Mwangi', '1975-02-17', 'daniel.otieno@example.com', '+254712345009'),
  ('Mary Njeri', 'CC-010', 'Seasonal allergies — sneezing and itchy eyes', 'Allergic rhinitis', 'Dr. David Chen', 'Pharm. Amina Yusuf', '1999-08-03', 'mary.njeri@example.com', '+254712345010')
) AS v(name, clinic_code, complaint, diagnosis_text, doctor_name, pharmacist_name, date_of_birth, email, phone)
WHERE NOT EXISTS (
  SELECT 1 FROM public.patients p WHERE p.clinic_code = v.clinic_code
);

-- Investigations
INSERT INTO public.patient_investigations (patient_id, test_code, test_name, test_result)
SELECT p.id, i.test_code, i.test_name, i.test_result
FROM public.patients p
JOIN (VALUES
  ('CC-001', 'CBC', 'Complete Blood Count', 'WBC 7.2 K/uL — within normal limits'),
  ('CC-001', 'MP', 'Malaria Parasite Smear', 'Negative'),
  ('CC-002', 'SPIRO', 'Spirometry', 'FEV1 82% predicted — mild obstruction'),
  ('CC-003', 'XRAY', 'Lumbar Spine X-Ray', 'No fracture; soft tissue swelling noted'),
  ('CC-004', 'FBS', 'Fasting Blood Sugar', '186 mg/dL'),
  ('CC-004', 'HBA1C', 'HbA1c', '8.1%'),
  ('CC-005', 'IgE', 'Total IgE', 'Elevated — 420 IU/mL'),
  ('CC-006', 'CXR', 'Chest X-Ray', 'Clear lung fields'),
  ('CC-007', 'MRI', 'Knee MRI', 'Bone bruise; no ligament tear'),
  ('CC-008', 'STOOL', 'Stool Culture', 'No pathogenic bacteria isolated'),
  ('CC-009', 'BP', 'Blood Pressure Series', 'Avg 148/94 mmHg over 3 visits'),
  ('CC-010', 'ALLERGY', 'Skin Prick Panel', 'Positive for grass pollen')
) AS i(clinic_code, test_code, test_name, test_result) ON p.clinic_code = i.clinic_code
WHERE NOT EXISTS (
  SELECT 1 FROM public.patient_investigations pi
  WHERE pi.patient_id = p.id AND pi.test_code = i.test_code
);

-- Medications
INSERT INTO public.patient_medications (patient_id, med_code, med_name, dosage, status)
SELECT p.id, m.med_code, m.med_name, m.dosage, m.status
FROM public.patients p
JOIN (VALUES
  ('CC-001', 'PARA500', 'Paracetamol', '500 mg every 6 hours as needed', 'dispensed'),
  ('CC-001', 'AMOX250', 'Amoxicillin', '250 mg three times daily for 5 days', 'dispensed'),
  ('CC-002', 'SALB100', 'Salbutamol Inhaler', '2 puffs every 4–6 hours as needed', 'approved'),
  ('CC-002', 'BUD200', 'Budesonide Inhaler', '200 mcg twice daily', 'pending'),
  ('CC-003', 'IBU400', 'Ibuprofen', '400 mg three times daily with food', 'dispensed'),
  ('CC-003', 'CYCL10', 'Cyclobenzaprine', '10 mg at bedtime for 7 days', 'approved'),
  ('CC-004', 'MET500', 'Metformin', '500 mg twice daily with meals', 'dispensed'),
  ('CC-004', 'GLIM2', 'Glimepiride', '2 mg once daily before breakfast', 'pending'),
  ('CC-005', 'HYD1', 'Hydrocortisone Cream 1%', 'Apply thin layer twice daily', 'dispensed'),
  ('CC-006', 'CODE15', 'Codeine Linctus', '15 mg three times daily for 5 days', 'approved'),
  ('CC-007', 'DICL50', 'Diclofenac Gel', 'Apply to knee three times daily', 'dispensed'),
  ('CC-008', 'ORS', 'Oral Rehydration Salts', '1 sachet after each loose stool', 'dispensed'),
  ('CC-009', 'AML5', 'Amlodipine', '5 mg once daily', 'approved'),
  ('CC-009', 'LOS50', 'Losartan', '50 mg once daily', 'pending'),
  ('CC-010', 'CET10', 'Cetirizine', '10 mg once daily', 'dispensed')
) AS m(clinic_code, med_code, med_name, dosage, status) ON p.clinic_code = m.clinic_code
WHERE NOT EXISTS (
  SELECT 1 FROM public.patient_medications pm
  WHERE pm.patient_id = p.id AND pm.med_code = m.med_code
);

-- Sample appointments (if table exists from required_patch.sql)
INSERT INTO public.appointments (patient_id, doctor_id, scheduled_at, status, notes)
SELECT p.id, NULL, a.scheduled_at::TIMESTAMPTZ, a.status, a.notes
FROM public.patients p
JOIN (VALUES
  ('CC-001', NOW() + INTERVAL '1 day', 'scheduled', 'Follow-up for fever resolution'),
  ('CC-004', NOW() + INTERVAL '3 days', 'scheduled', 'Diabetes education session'),
  ('CC-009', NOW() + INTERVAL '2 days', 'scheduled', 'BP recheck and medication review'),
  ('CC-002', NOW() - INTERVAL '2 days', 'completed', 'Asthma action plan reviewed')
) AS a(clinic_code, scheduled_at, status, notes) ON p.clinic_code = a.clinic_code
WHERE to_regclass('public.appointments') IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.appointments ap
    WHERE ap.patient_id = p.id AND ap.notes = a.notes
  );

-- Sample invoices
INSERT INTO public.invoices (patient_id, amount, status, description, due_at)
SELECT p.id, i.amount::NUMERIC, i.status, i.description, i.due_at::TIMESTAMPTZ
FROM public.patients p
JOIN (VALUES
  ('CC-001', '85.00', 'paid', 'Consultation + CBC panel', NOW() + INTERVAL '7 days'),
  ('CC-004', '120.00', 'pending', 'Diabetes workup package', NOW() + INTERVAL '14 days'),
  ('CC-007', '95.00', 'paid', 'Sports injury assessment', NOW() + INTERVAL '5 days'),
  ('CC-009', '60.00', 'pending', 'Hypertension follow-up visit', NOW() + INTERVAL '10 days')
) AS i(clinic_code, amount, status, description, due_at) ON p.clinic_code = i.clinic_code
WHERE to_regclass('public.invoices') IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.invoices inv
    WHERE inv.patient_id = p.id AND inv.description = i.description
  );

SELECT
  (SELECT COUNT(*) FROM public.patients) AS total_patients,
  (SELECT COUNT(*) FROM public.patient_investigations) AS total_investigations,
  (SELECT COUNT(*) FROM public.patient_medications) AS total_medications;
