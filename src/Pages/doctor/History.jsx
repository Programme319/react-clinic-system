import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DoctorLayout from '@/Layouts/DoctorLayout';
import supabase from '@/lib/supabase';
import { fetchPatientDetail } from '@/hooks/usePatients';
import { useAuth } from '@/contexts/AuthContext';

export default function DoctorHistory() {
  const { id } = useParams();
  const { authUser } = useAuth();
  const [list, setList] = useState([]);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (id) {
        const data = await fetchPatientDetail(id, authUser);
        setDetail(data);
      } else {
        const { data } = await supabase.from('patients').select('id, name, clinic_code, diagnosis_text').order('name');
        setList(data || []);
      }
      setLoading(false);
    }
    load();
  }, [id, authUser]);

  if (loading) return <DoctorLayout title="Medical History"><div className="loading-center"><div className="spinner" /></div></DoctorLayout>;

  if (!id) {
    return (
      <DoctorLayout title="Medical History">
        <div className="panel">
          <div className="panel__header">Select a patient</div>
          <div className="panel__body">
            {list.map((p) => (
              <Link key={p.id} to={`/doctor/history/${p.id}`} className="dashboard__recent-item" style={{ display: 'block' }}>
                <strong>{p.name}</strong> — {p.diagnosis_text || 'No diagnosis'}
              </Link>
            ))}
          </div>
        </div>
      </DoctorLayout>
    );
  }

  const { patient, investigations, medications } = detail;

  return (
    <DoctorLayout title={`History — ${patient.name}`}>
      <div className="patient-detail__actions">
        <Link to="/doctor/history" className="btn btn-secondary">← Back</Link>
      </div>
      <div className="card" style={{ overflow: 'hidden', marginBottom: '1rem' }}>
        <div className="patient-detail__hero">
          <p className="patient-detail__ticket">#{patient.id} · {patient.clinic_code}</p>
          <h2 className="patient-detail__name">{patient.name}</h2>
          <p style={{ marginTop: '0.5rem', opacity: 0.9 }}>{patient.complaint}</p>
        </div>
        <div className="card-body" style={{ padding: '1.5rem' }}>
          <h3 className="patient-form__section-title">Diagnosis</h3>
          <p>{patient.diagnosis_text || 'Not recorded'}</p>
          <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Doctor: {patient.doctor_name || '—'} · Pharmacist: {patient.pharmacist_name || '—'}
          </p>
        </div>
      </div>
      <div className="patient-detail__grid">
        <div className="panel">
          <div className="panel__header">Investigations ({investigations.length})</div>
          <div className="panel__body">
            {investigations.map((t) => (
              <div key={t.id} className="patient-detail__record">
                <p className="patient-detail__record-name">{t.test_name}</p>
                <p className="patient-detail__record-value patient-detail__record-value--teal">{t.test_result || 'Pending'}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <div className="panel__header">Medications ({medications.length})</div>
          <div className="panel__body">
            {medications.map((m) => (
              <div key={m.id} className="patient-detail__record">
                <p className="patient-detail__record-name">{m.med_name}</p>
                <p className="patient-detail__record-value patient-detail__record-value--green">{m.dosage}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
}
