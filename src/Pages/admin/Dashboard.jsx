import { useEffect, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAdminDashboardStats } from '@/lib/adminApi';
import { logView } from '@/lib/audit';

export default function AdminDashboard() {
  const { authUser } = useAuth();
  const [stats, setStats] = useState({ staff: 0, patients: 0, invoices: 0, appointments: 0 });
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      if (!authUser?.id) return;
      setError('');
      try {
        const data = await fetchAdminDashboardStats(authUser.id);
        setStats({
          staff: data.staff ?? 0,
          patients: data.patients ?? 0,
          invoices: data.invoices ?? 0,
          appointments: data.appointments ?? 0,
        });
        await logView(authUser, 'admin_dashboard', 'overview');
      } catch (err) {
        setError(err.message || 'Could not load dashboard stats.');
      }
    }
    load();
  }, [authUser]);

  return (
    <AdminLayout title="Administrator Overview">
      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}
      <div className="stat-grid">
        <div className="stat-card"><p className="stat-card__label">Staff</p><p className="stat-card__value">{stats.staff}</p></div>
        <div className="stat-card"><p className="stat-card__label">Patients</p><p className="stat-card__value">{stats.patients}</p></div>
        <div className="stat-card"><p className="stat-card__label">Invoices</p><p className="stat-card__value">{stats.invoices}</p></div>
        <div className="stat-card"><p className="stat-card__label">Appointments</p><p className="stat-card__value">{stats.appointments}</p></div>
      </div>
    </AdminLayout>
  );
}
