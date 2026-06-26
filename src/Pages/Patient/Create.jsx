import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import supabase from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function CreatePatient() {
  const navigate = useNavigate();

  const [data, setData] = useState({
    name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    tests: [{ test_code: '', test_name: '', test_result: '' }],
    medications: [{ med_code: '', med_name: '', dosage: '' }],
  });

  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    document.title = 'Add Patient — ClinicCare';
  }, []);

  const handleFieldChange = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const addRow = (type) => {
    const item =
      type === 'tests'
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

    if (!data.name.trim()) {
      setErrors({ name: 'Patient name is required.' });
      setProcessing(false);
      return;
    }

    if (!supabase) {
      setErrors({ general: 'Database not connected.' });
      setProcessing(false);
      return;
    }

    try {
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .insert({
          name: data.name.trim(),
          email: data.email.trim() || null,
          phone: data.phone.trim() || null,
          date_of_birth: data.date_of_birth || null,
        })
        .select()
        .single();

      if (patientError) throw patientError;

      const tests = data.tests.filter((t) => t.test_name?.trim() || t.test_code?.trim());
      if (tests.length) {
        const { error } = await supabase.from('patient_investigations').insert(
          tests.map((t) => ({
            patient_id: patient.id,
            test_code: t.test_code || 'N/A',
            test_name: t.test_name || 'Unnamed test',
            test_result: t.test_result || 'Pending',
          })),
        );
        if (error) throw error;
      }

      const meds = data.medications.filter((m) => m.med_name?.trim() || m.med_code?.trim());
      if (meds.length) {
        const { error } = await supabase.from('patient_medications').insert(
          meds.map((m) => ({
            patient_id: patient.id,
            med_code: m.med_code || 'N/A',
            med_name: m.med_name || 'Unnamed medication',
            dosage: m.dosage || 'As directed',
          })),
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
    <AuthenticatedLayout
      header={
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Add new patient</h1>
          <p className="mt-1 text-sm text-slate-500">Create a patient record with investigations and medications</p>
        </div>
      }
    >
      <form onSubmit={submit} className="page-container max-w-4xl space-y-6">
        {errors.general && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errors.general}
          </div>
        )}

        <section className="card p-6">
          <h2 className="text-lg font-bold text-slate-900">Basic information</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Full name *</label>
              <input
                className="input-field"
                value={data.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Email</label>
              <input
                type="email"
                className="input-field"
                value={data.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Phone</label>
              <input
                className="input-field"
                value={data.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Date of birth</label>
              <input
                type="date"
                className="input-field"
                value={data.date_of_birth}
                onChange={(e) => handleFieldChange('date_of_birth', e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="text-lg font-bold text-slate-900">Investigations</h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-teal-50 text-left text-xs font-semibold uppercase text-slate-600">
                <tr>
                  <th className="p-3">Code</th>
                  <th className="p-3">Test name</th>
                  <th className="p-3">Result</th>
                </tr>
              </thead>
              <tbody>
                {data.tests.map((test, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    {['test_code', 'test_name', 'test_result'].map((f) => (
                      <td key={f} className="p-2">
                        <input
                          className="w-full border-0 bg-transparent focus:ring-0"
                          value={test[f]}
                          onChange={(e) => handleDynamicChange('tests', i, f, e.target.value)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" onClick={() => addRow('tests')} className="mt-3 text-sm font-semibold text-teal-600">
            + Add test
          </button>
        </section>

        <section className="card p-6">
          <h2 className="text-lg font-bold text-slate-900">Medications</h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-emerald-50 text-left text-xs font-semibold uppercase text-slate-600">
                <tr>
                  <th className="p-3">Code</th>
                  <th className="p-3">Medication</th>
                  <th className="p-3">Dosage</th>
                </tr>
              </thead>
              <tbody>
                {data.medications.map((med, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    {['med_code', 'med_name', 'dosage'].map((f) => (
                      <td key={f} className="p-2">
                        <input
                          className="w-full border-0 bg-transparent focus:ring-0"
                          value={med[f]}
                          onChange={(e) => handleDynamicChange('medications', i, f, e.target.value)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" onClick={() => addRow('medications')} className="mt-3 text-sm font-semibold text-emerald-600">
            + Add medication
          </button>
        </section>

        <div className="flex justify-end gap-3 pb-8">
          <button type="button" onClick={() => navigate('/patients')} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={processing} className="btn-primary">
            {processing ? 'Saving…' : 'Save patient'}
          </button>
        </div>
      </form>
    </AuthenticatedLayout>
  );
}
