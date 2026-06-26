import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import supabase from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import '@/css/pages/patients.css';

export default function CreatePatient() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    name: '', email: '', phone: '', date_of_birth: '',
    tests: [{ test_code: '', test_name: '', test_result: '' }],
    medications: [{ med_code: '', med_name: '', dosage: '' }],
  });
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => { document.title = 'Add Patient — ClinicCare'; }, []);

  const handleFieldChange = (field, value) => setData((prev) => ({ ...prev, [field]: value }));

  const addRow = (type) => {
    const item = type === 'tests'
      ? { test_code: '', test_name: '', test_result: '' }
      : { med_code: '', med_name: '', dosage: '' };
    setData((prev) => ({ ...prev, [type]: [...prev[type], item] }));
  };

  const handleDynamicChange = (type, index, field, value) => {
    setData((prev) => {
      const list = [...prev[type]];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, [type]: list };
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});
    if (!data.name.trim()) { setErrors({ name: 'Patient name is required.' }); setProcessing(false); return; }
    if (!supabase) { setErrors({ general: 'Database not connected.' }); setProcessing(false); return; }

    try {
      const { data: patient, error: patientError } = await supabase.from('patients').insert({
        name: data.name.trim(), email: data.email.trim() || null,
        phone: data.phone.trim() || null, date_of_birth: data.date_of_birth || null,
      }).select().single();
      if (patientError) throw patientError;

      const tests = data.tests.filter((t) => t.test_name?.trim() || t.test_code?.trim());
      if (tests.length) {
        const { error } = await supabase.from('patient_investigations').insert(
          tests.map((t) => ({ patient_id: patient.id, test_code: t.test_code || 'N/A', test_name: t.test_name || 'Unnamed', test_result: t.test_result || 'Pending' })),
        );
        if (error) throw error;
      }

      const meds = data.medications.filter((m) => m.med_name?.trim() || m.med_code?.trim());
      if (meds.length) {
        const { error } = await supabase.from('patient_medications').insert(
          meds.map((m) => ({ patient_id: patient.id, med_code: m.med_code || 'N/A', med_name: m.med_name || 'Unnamed', dosage: m.dosage || 'As directed' })),
        );
        if (error) throw error;
      }
      navigate(`/patients/${patient.id}`);
    } catch (error) {
      setErrors({ general: error.message || 'Failed to save patient.' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <AuthenticatedLayout header={<div><h1 className="page-title">Add new patient</h1><p className="page-subtitle">Create a record with investigations and medications</p></div>}>
      <form onSubmit={submit} className="page-container patient-form">
        {errors.general && <div className="alert alert-error">{errors.general}</div>}

        <section className="card card-body">
          <h2 className="patient-form__section-title">Basic information</h2>
          <div className="patient-form__grid patient-form__grid--3">
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label className="input-label">Full name *</label>
              <input className="input-field" value={data.name} onChange={(e) => handleFieldChange('name', e.target.value)} />
              {errors.name && <span className="input-error">{errors.name}</span>}
            </div>
            <div className="input-group"><label className="input-label">Email</label><input type="email" className="input-field" value={data.email} onChange={(e) => handleFieldChange('email', e.target.value)} /></div>
            <div className="input-group"><label className="input-label">Phone</label><input className="input-field" value={data.phone} onChange={(e) => handleFieldChange('phone', e.target.value)} /></div>
            <div className="input-group"><label className="input-label">Date of birth</label><input type="date" className="input-field" value={data.date_of_birth} onChange={(e) => handleFieldChange('date_of_birth', e.target.value)} /></div>
          </div>
        </section>

        <section className="card card-body">
          <h2 className="patient-form__section-title">Investigations</h2>
          <div className="patient-form__table-wrap">
            <table className="patient-form__table">
              <thead><tr><th className="patient-form__table th--teal" style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', background: '#f0fdfa', color: '#0f766e' }}>Code</th><th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', background: '#f0fdfa', color: '#0f766e' }}>Test</th><th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', background: '#f0fdfa', color: '#0f766e' }}>Result</th></tr></thead>
              <tbody>
                {data.tests.map((test, i) => (
                  <tr key={i}>
                    {['test_code', 'test_name', 'test_result'].map((f) => (
                      <td key={f}><input value={test[f]} onChange={(e) => handleDynamicChange('tests', i, f, e.target.value)} /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" onClick={() => addRow('tests')} className="patient-form__add-btn">+ Add test</button>
        </section>

        <section className="card card-body">
          <h2 className="patient-form__section-title">Medications</h2>
          <div className="patient-form__table-wrap">
            <table className="patient-form__table">
              <thead><tr><th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', background: '#ecfdf5', color: '#047857' }}>Code</th><th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', background: '#ecfdf5', color: '#047857' }}>Medication</th><th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', background: '#ecfdf5', color: '#047857' }}>Dosage</th></tr></thead>
              <tbody>
                {data.medications.map((med, i) => (
                  <tr key={i}>
                    {['med_code', 'med_name', 'dosage'].map((f) => (
                      <td key={f}><input value={med[f]} onChange={(e) => handleDynamicChange('medications', i, f, e.target.value)} /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" onClick={() => addRow('medications')} className="patient-form__add-btn" style={{ color: 'var(--color-accent-dark)' }}>+ Add medication</button>
        </section>

        <div className="patient-form__actions">
          <button type="button" onClick={() => navigate('/patients')} className="btn btn-secondary">Cancel</button>
          <button type="submit" disabled={processing} className="btn btn-primary">{processing ? 'Saving…' : 'Save patient'}</button>
        </div>
      </form>
    </AuthenticatedLayout>
  );
}
