import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useAuth } from '@/contexts/AuthContext';
import supabase from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { Users, UserPlus, ClipboardList, ArrowRight, Activity } from 'lucide-react';
import '@/css/pages/dashboard.css';

export default function Dashboard() {
  const { authUser } = useAuth();
  const [patientCount, setPatientCount] = useState(0);
  const [recentPatients, setRecentPatients] = useState([]);

  useEffect(() => {
    document.title = 'Dashboard — ClinicCare';
  }, []);

  useEffect(() => {
    async function loadStats() {
      if (!supabase) return;
      const { count } = await supabase.from('patients').select('*', { count: 'exact', head: true });
      setPatientCount(count || 0);
      const { data } = await supabase.from('patients').select('id, name, phone, created_at').order('created_at', { ascending: false }).limit(5);
      setRecentPatients(data || []);
    }
    loadStats();
  }, []);

  return (
    <AuthenticatedLayout
      header={
        <div>
          <h1 className="page-title">Good day, {authUser?.name?.split(' ')[0]}</h1>
          <p className="page-subtitle">Here&apos;s your clinic overview for today.</p>
        </div>
      }
    >
      <div className="page-container">
        <div className="dashboard__stats">
          <div className="card dashboard__stat-card">
            <div>
              <p className="dashboard__stat-label">Total patients</p>
              <p className="dashboard__stat-value">{patientCount}</p>
            </div>
            <div className="dashboard__stat-icon dashboard__stat-icon--teal"><Users size={22} /></div>
          </div>

          <div className="card dashboard__stat-card">
            <div>
              <p className="dashboard__stat-label">Your role</p>
              <p className="dashboard__stat-value dashboard__stat-value--text">{authUser?.role}</p>
            </div>
            <div className="dashboard__stat-icon dashboard__stat-icon--violet"><Activity size={22} /></div>
          </div>

          <Link to="/patients/create" className="card card--interactive dashboard__action-card">
            <div>
              <p className="dashboard__action-title">Add patient</p>
              <p className="dashboard__action-desc">New record + tests & meds</p>
            </div>
            <div className="dashboard__action-icon" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
              <UserPlus size={22} />
            </div>
          </Link>
        </div>

        <div className="card">
          <div className="dashboard__recent-header">
            <h2 className="dashboard__recent-title">Recent patients</h2>
            <Link to="/patients" className="link-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}>
              View all <ArrowRight size={16} className="dashboard__action-arrow" />
            </Link>
          </div>

          {recentPatients.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon"><ClipboardList size={28} /></div>
              <p className="empty-state__title">No patients yet</p>
              <p className="empty-state__desc">Add your first patient to get started.</p>
              <Link to="/patients/create" className="btn btn-primary" style={{ marginTop: '1rem' }}>Add first patient</Link>
            </div>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {recentPatients.map((p) => (
                <li key={p.id}>
                  <Link to={`/patients/${p.id}`} className="dashboard__recent-item">
                    <div>
                      <p className="dashboard__recent-name">{p.name}</p>
                      <p className="dashboard__recent-meta">{p.phone || 'No phone'}</p>
                    </div>
                    <span className="dashboard__recent-id">#{p.id}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
