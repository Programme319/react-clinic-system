import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useAuth } from '@/contexts/AuthContext';
import supabase from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function CreatePatient() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setData] = useState({
    full_name: '',
    national_id: '',
    age: '',
    complaint: '',
    diagnosis_text: '',
    doctor_name: '',
    pharmacist_name: '',
    clinic_code: '',
    tests: [{ test_code: '', test_name: '', test_result: '' }],
    medications: [{ med_code: '', med_name: '', dosage: '' }],
  });

  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    document.title = 'Add Patient - ClinicCare';
  }, []);

  const handleFieldChange = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const addRow = (type) => {
    const newItem =
      type === 'tests'
        ? { test_code: '', test_name: '', test_result: '' }
        : { med_code: '', med_name: '', dosage: '' };

    setData((prev) => ({ ...prev, [type]: [...prev[type], newItem] }));
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

    if (!data.full_name.trim()) {
      setErrors({ full_name: 'Patient name is required.' });
      setProcessing(false);
      return;
    }

    try {
      const { error } = await supabase.from('patients').insert({
        user_id: user.id,
        full_name: data.full_name,
        national_id: data.national_id || null,
        age: data.age ? parseInt(data.age, 10) : null,
        complaint: data.complaint || null,
        diagnosis_text: data.diagnosis_text || null,
        doctor_name: data.doctor_name || null,
        pharmacist_name: data.pharmacist_name || null,
        clinic_code: data.clinic_code || null,
        tests: data.tests.filter((t) => t.test_name || t.test_code),
        medications: data.medications.filter((m) => m.med_name || m.med_code),
      });

      if (error) throw error;
      navigate('/patients');
    } catch (error) {
      setErrors({ general: error.message || 'Failed to save patient.' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <AuthenticatedLayout
      header={
        <h2 className="text-xl font-semibold text-gray-800">Add New Patient</h2>
      }
    >
      <div className="py-8">
        <form
          onSubmit={submit}
          className="mx-auto max-w-5xl space-y-6 px-4 sm:px-6 lg:px-8"
        >
          {errors.general && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errors.general}
            </div>
          )}

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">Basic Information</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Patient Name *</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                  value={data.full_name}
                  onChange={(e) => handleFieldChange('full_name', e.target.value)}
                />
                {errors.full_name && (
                  <p className="mt-1 text-sm text-red-500">{errors.full_name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">National ID</label>
                <input
                  type="text"
                  maxLength="14"
                  className="mt-1 w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                  value={data.national_id}
                  onChange={(e) => handleFieldChange('national_id', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Age</label>
                <input
                  type="number"
                  className="mt-1 w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                  value={data.age}
                  onChange={(e) => handleFieldChange('age', e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Complaint</label>
              <textarea
                className="mt-1 w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                rows={3}
                value={data.complaint}
                onChange={(e) => handleFieldChange('complaint', e.target.value)}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-teal-700">Medical Diagnosis</h3>
            <textarea
              className="w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500"
              rows={4}
              value={data.diagnosis_text}
              onChange={(e) => handleFieldChange('diagnosis_text', e.target.value)}
              placeholder="Enter diagnosis..."
            />
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">Investigations</h3>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-teal-50">
                  <tr>
                    <th className="p-3 text-left font-medium">Code</th>
                    <th className="p-3 text-left font-medium">Test Name</th>
                    <th className="p-3 text-left font-medium">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {data.tests.map((test, index) => (
                    <tr key={index} className="border-t border-gray-100">
                      {['test_code', 'test_name', 'test_result'].map((field) => (
                        <td key={field} className="p-2">
                          <input
                            type="text"
                            className="w-full border-0 bg-transparent focus:ring-0"
                            value={test[field]}
                            onChange={(e) =>
                              handleDynamicChange('tests', index, field, e.target.value)
                            }
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={() => addRow('tests')}
              className="mt-3 rounded-lg bg-teal-600 px-3 py-1.5 text-sm text-white hover:bg-teal-700"
            >
              + Add Test
            </button>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">Medications</h3>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-green-50">
                  <tr>
                    <th className="p-3 text-left font-medium">Code</th>
                    <th className="p-3 text-left font-medium">Medication</th>
                    <th className="p-3 text-left font-medium">Dosage</th>
                  </tr>
                </thead>
                <tbody>
                  {data.medications.map((med, index) => (
                    <tr key={index} className="border-t border-gray-100">
                      {['med_code', 'med_name', 'dosage'].map((field) => (
                        <td key={field} className="p-2">
                          <input
                            type="text"
                            className="w-full border-0 bg-transparent focus:ring-0"
                            value={med[field]}
                            onChange={(e) =>
                              handleDynamicChange('medications', index, field, e.target.value)
                            }
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={() => addRow('medications')}
              className="mt-3 rounded-lg bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700"
            >
              + Add Medication
            </button>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Treating Physician</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                  value={data.doctor_name}
                  onChange={(e) => handleFieldChange('doctor_name', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Pharmacist</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                  value={data.pharmacist_name}
                  onChange={(e) => handleFieldChange('pharmacist_name', e.target.value)}
                />
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-3 pb-8">
            <button
              type="button"
              onClick={() => navigate('/patients')}
              className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="rounded-lg bg-teal-600 px-8 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
            >
              {processing ? 'Saving...' : 'Save Patient Record'}
            </button>
          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  );
}
