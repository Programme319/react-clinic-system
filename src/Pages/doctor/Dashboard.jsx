import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DoctorLayout from '@/Layouts/DoctorLayout';
import supabase from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { logView } from '@/lib/audit';

export default function DoctorDashboard() {
  const { authUser } = useAuth();
  const [stats, setStats] = useState({ patients: 0, labs: 0, rx: 0, appts: 0 });

  useEffect(() => {
    document.title = 'Doctor Dashboard — ClinicCare';
    async function load() {
      if (!supabase) return;
      const [p, l, m, a] = await Promise.all([
        supabase.from('patients').select('*', { count: 'exact', head: true }),
        supabase.from('patient_investigations').select('*', { count: 'exact', head: true }),
        supabase.from('patient_medications').select('*', { count: 'exact', head: true }),
        supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('doctor_id', authUser.id),
      ]);
      setStats({ patients: p.count || 0, labs: l.count || 0, rx: m.count || 0, appts: a.count || 0 });
      await logView(authUser, 'doctor_dashboard', 'overview');
    }
    load();
  }, [authUser]);

  return (
    <DoctorLayout title={`Welcome, Dr. ${authUser?.name?.split(' ')[0]}`}>
      <div className="stat-grid">
        {[
          { label: 'Patients', value: stats.patients },
          { label: 'Lab Tests', value: stats.labs },
          { label: 'Prescriptions', value: stats.rx },
          { label: 'My Appointments', value: stats.appts },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <p className="stat-card__label">{s.label}</p>
            <p className="stat-card__value">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="panel">
        <div className="panel__header">Quick actions</div>
        <div className="panel__body" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <Link to="/doctor/patients" className="btn btn-primary">View patients</Link>
          <Link to="/doctor/prescriptions" className="btn btn-secondary">Write prescription</Link>
          <Link to="/doctor/appointments" className="btn btn-secondary">Schedule</Link>
        </div>
      </div>
    </DoctorLayout>
  );
}
