import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import supabase from '@/lib/supabase';
import { Link, useParams } from 'react-router-dom';
import { Loader2, ArrowLeft, Printer, Mail, Phone, Calendar } from 'lucide-react';

export default function Show() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [investigations, setInvestigations] = useState([]);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      if (!supabase) return;

      const [patientRes, invRes, medRes] = await Promise.all([
        supabase.from('patients').select('*').eq('id', id).single(),
        supabase.from('patient_investigations').select('*').eq('patient_id', id),
        supabase.from('patient_medications').select('*').eq('patient_id', id),
      ]);

      if (patientRes.error) {
        setError(patientRes.error.message);
      } else {
        setPatient(patientRes.data);
        document.title = `${patientRes.data.name} — ClinicCare`;
      }

      setInvestigations(invRes.data || []);
      setMedications(medRes.data || []);
      setLoading(false);
    }

    load();
  }, [id]);

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center gap-2 py-32 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading…
        </div>
      </AuthenticatedLayout>
    );
  }

  if (error || !patient) {
    return (
      <AuthenticatedLayout>
        <div className="page-container text-center">
          <p className="text-slate-600">{error || 'Patient not found.'}</p>
          <Link to="/patients" className="mt-4 inline-flex items-center gap-1 text-teal-600">
            <ArrowLeft className="h-4 w-4" /> Back to patients
          </Link>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="page-container max-w-4xl">
        <div className="no-print mb-6 flex items-center justify-between">
          <Link to="/patients" className="btn-secondary gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <button type="button" onClick={() => window.print()} className="btn-primary gap-2">
            <Printer className="h-4 w-4" /> Print
          </button>
        </div>

        <div className="card overflow-hidden">
          <div className="bg-gradient-to-r from-teal-700 to-emerald-700 px-8 py-8 text-white">
            <p className="text-sm font-medium text-teal-100">Patient #{patient.id}</p>
            <h1 className="mt-1 text-3xl font-extrabold">{patient.name}</h1>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-teal-50">
              {patient.email && (
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-4 w-4" /> {patient.email}
                </span>
              )}
              {patient.phone && (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-4 w-4" /> {patient.phone}
                </span>
              )}
              {patient.date_of_birth && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {new Date(patient.date_of_birth).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-6 p-8 md:grid-cols-2">
            <div>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">
                Investigations
              </h2>
              {investigations.length === 0 ? (
                <p className="text-sm text-slate-400">No tests recorded.</p>
              ) : (
                <div className="space-y-2">
                  {investigations.map((t) => (
                    <div key={t.id} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <p className="font-semibold text-slate-900">{t.test_name}</p>
                      <p className="text-xs text-slate-500">{t.test_code}</p>
                      <p className="mt-1 text-sm font-medium text-teal-700">{t.test_result}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">
                Medications
              </h2>
              {medications.length === 0 ? (
                <p className="text-sm text-slate-400">No medications recorded.</p>
              ) : (
                <div className="space-y-2">
                  {medications.map((m) => (
                    <div key={m.id} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <p className="font-semibold text-slate-900">{m.med_name}</p>
                      <p className="text-xs text-slate-500">{m.med_code}</p>
                      <p className="mt-1 text-sm font-medium text-emerald-700">{m.dosage}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `@media print { .no-print { display: none !important; } nav { display: none !important; } }`,
        }}
      />
    </AuthenticatedLayout>
  );
}
