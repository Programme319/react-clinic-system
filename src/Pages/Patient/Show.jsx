import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import supabase from '@/lib/supabase';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Printer, Mail, Phone, Calendar } from 'lucide-react';
import '@/css/pages/patients.css';

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
      if (patientRes.error) setError(patientRes.error.message);
      else { setPatient(patientRes.data); document.title = `${patientRes.data.name} — ClinicCare`; }
      setInvestigations(invRes.data || []);
      setMedications(medRes.data || []);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <AuthenticatedLayout><div className="loading-center"><div className="spinner" /></div></AuthenticatedLayout>;
  if (error || !patient) return (
    <AuthenticatedLayout>
      <div className="page-container" style={{ textAlign: 'center' }}>
        <p>{error || 'Patient not found.'}</p>
        <Link to="/patients" className="link-primary" style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><ArrowLeft size={16} /> Back</Link>
      </div>
    </AuthenticatedLayout>
  );

  return (
    <AuthenticatedLayout>
      <div className="page-container" style={{ maxWidth: '56rem' }}>
        <div className="patient-detail__actions no-print">
          <Link to="/patients" className="btn btn-secondary"><ArrowLeft size={16} /> Back</Link>
          <button type="button" onClick={() => window.print()} className="btn btn-primary"><Printer size={16} /> Print</button>
        </div>

        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="patient-detail__hero">
            <p className="patient-detail__ticket">Patient #{patient.id}</p>
            <h1 className="patient-detail__name">{patient.name}</h1>
            <div className="patient-detail__meta">
              {patient.email && <span className="patient-detail__meta-item"><Mail size={16} /> {patient.email}</span>}
              {patient.phone && <span className="patient-detail__meta-item"><Phone size={16} /> {patient.phone}</span>}
              {patient.date_of_birth && <span className="patient-detail__meta-item"><Calendar size={16} /> {new Date(patient.date_of_birth).toLocaleDateString()}</span>}
            </div>
          </div>

          <div className="patient-detail__grid">
            <div>
              <h2 className="patient-detail__section-title">Investigations</h2>
              {investigations.length === 0 ? <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No tests recorded.</p> : investigations.map((t) => (
                <div key={t.id} className="patient-detail__record">
                  <p className="patient-detail__record-name">{t.test_name}</p>
                  <p className="patient-detail__record-code">{t.test_code}</p>
                  <p className="patient-detail__record-value patient-detail__record-value--teal">{t.test_result}</p>
                </div>
              ))}
            </div>
            <div>
              <h2 className="patient-detail__section-title">Medications</h2>
              {medications.length === 0 ? <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No medications recorded.</p> : medications.map((m) => (
                <div key={m.id} className="patient-detail__record">
                  <p className="patient-detail__record-name">{m.med_name}</p>
                  <p className="patient-detail__record-code">{m.med_code}</p>
                  <p className="patient-detail__record-value patient-detail__record-value--green">{m.dosage}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
