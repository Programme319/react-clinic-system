import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import supabase from '@/lib/supabase';
import { Link, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function Show() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPatient() {
      const { data, error: fetchError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setPatient(data);
        document.title = `Patient: ${data.full_name} - ClinicCare`;
      }
      setLoading(false);
    }

    fetchPatient();
  }, [id]);

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          Loading patient record...
        </div>
      </AuthenticatedLayout>
    );
  }

  if (error || !patient) {
    return (
      <AuthenticatedLayout>
        <div className="py-20 text-center">
          <p className="text-gray-600">{error || 'Patient not found.'}</p>
          <Link to="/patients" className="mt-4 inline-block text-teal-600 hover:text-teal-800">
            ← Back to patients
          </Link>
        </div>
      </AuthenticatedLayout>
    );
  }

  const tests = patient.tests || [];
  const medications = patient.medications || [];

  return (
    <AuthenticatedLayout>
      <div className="py-8 font-sans" dir="rtl">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="no-print mb-6 flex justify-between">
            <Link
              to="/patients"
              className="flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-gray-50"
            >
              ← العودة للسجل
            </Link>
            <button
              onClick={() => window.print()}
              className="rounded-lg bg-teal-600 px-6 py-2 font-semibold text-white shadow-sm hover:bg-teal-700"
            >
              طباعة (Print)
            </button>
          </div>

          <div className="relative rounded-2xl border-2 border-gray-200 bg-white p-8 text-right shadow-lg">
            <div className="mb-8 flex items-start justify-between border-b-4 border-teal-600 pb-6">
              <div className="w-2/3">
                <h1 className="mb-2 text-4xl font-black text-gray-900">{patient.full_name}</h1>
                <p className="text-lg text-gray-600">الرقم القومي: {patient.national_id || '—'}</p>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-gray-400">رقم التذكرة</p>
                <p className="text-4xl font-bold text-teal-600">#{patient.id}</p>
                <p className="mt-1 text-md">العمر: {patient.age ?? '—'} سنة</p>
              </div>
            </div>

            <div className="mb-10 space-y-8">
              <div>
                <h3 className="mb-2 border-r-4 border-teal-600 pr-3 text-xl font-bold text-gray-800">
                  شكوى المريض
                </h3>
                <p className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-lg">
                  {patient.complaint || 'لا يوجد'}
                </p>
              </div>

              <div className="rounded-lg border-2 border-dashed border-gray-300 p-6">
                <h3 className="mb-3 text-center text-xl font-bold text-teal-700 underline">
                  التشخيص الطبي (Medical Diagnosis)
                </h3>
                <p className="text-center text-2xl font-medium leading-relaxed text-gray-900">
                  {patient.diagnosis_text || '—'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-10 border-t pt-8 md:grid-cols-2">
              <div>
                <h4 className="mb-4 border-r-4 border-teal-500 pr-2 text-lg font-bold text-gray-800">
                  الفحوصات والتحاليل
                </h4>
                <table className="w-full border-collapse text-right">
                  <thead>
                    <tr className="bg-teal-50">
                      <th className="border border-gray-300 p-2">الفحص</th>
                      <th className="border border-gray-300 p-2">النتيجة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tests.length > 0 ? (
                      tests.map((test, i) => (
                        <tr key={i}>
                          <td className="border border-gray-300 p-2">{test.test_name || test.test_code}</td>
                          <td className="border border-gray-300 p-2 font-bold text-teal-700">
                            {test.test_result || '—'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className="p-4 text-center text-sm text-gray-400">
                          لا توجد فحوصات مسجلة
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div>
                <h4 className="mb-4 border-r-4 border-green-500 pr-2 text-lg font-bold text-gray-800">
                  الأدوية المصروفة
                </h4>
                <table className="w-full border-collapse text-right">
                  <thead>
                    <tr className="bg-green-50">
                      <th className="border border-gray-300 p-2">الدواء</th>
                      <th className="border border-gray-300 p-2">الجرعة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medications.length > 0 ? (
                      medications.map((med, i) => (
                        <tr key={i}>
                          <td className="border border-gray-300 p-2">{med.med_name || med.med_code}</td>
                          <td className="border border-gray-300 p-2 font-bold text-green-700">
                            {med.dosage || '—'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className="p-4 text-center text-sm text-gray-400">
                          لا توجد أدوية مسجلة
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-16 flex justify-between px-10">
              <div className="w-64 border-t-2 border-gray-800 pt-2 text-center">
                <p className="text-sm font-bold">توقيع الطبيب المعالج</p>
                <p className="mt-4 font-serif text-lg italic text-gray-700">
                  {patient.doctor_name || '...................'}
                </p>
              </div>
              <div className="w-64 border-t-2 border-gray-800 pt-2 text-center">
                <p className="text-sm font-bold">اعتماد الصيدلية</p>
                <p className="mt-4 font-serif text-lg italic text-gray-700">
                  {patient.pharmacist_name || '...................'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              .no-print { display: none !important; }
              body { background: white !important; padding: 0 !important; }
            }
          `,
        }}
      />
    </AuthenticatedLayout>
  );
}
