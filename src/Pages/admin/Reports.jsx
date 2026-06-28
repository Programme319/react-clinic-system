import { useEffect, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import supabase from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAdminDashboardStats } from '@/lib/adminApi';
import { logView } from '@/lib/audit';

export default function AdminReports() {
  const { authUser } = useAuth();
  const [audit, setAudit] = useState([]);
  const [stats, setStats] = useState({ patients: 0, staff: 0, revenue: 0 });
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      if (!authUser?.id) return;
      setError('');
      try {
        const { data: logs } = await supabase?.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(50);
        setAudit(logs || []);

        const dash = await fetchAdminDashboardStats(authUser.id);
        const { data: inv } = await supabase.from('invoices').select('amount');
        const revenue = (inv?.data || []).reduce((s, i) => s + Number(i.amount || 0), 0);

        setStats({
          patients: dash.patients ?? 0,
          staff: dash.staff ?? 0,
          revenue,
        });
        await logView(authUser, 'reports', 'operational');
      } catch (err) {
        setError(err.message || 'Could not load reports.');
      }
    }
    load();
  }, [authUser]);

  return (
    <AdminLayout title="Operational Reports">
      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}
      <div className="stat-grid">
        <div className="stat-card"><p className="stat-card__label">Patients</p><p className="stat-card__value">{stats.patients}</p></div>
        <div className="stat-card"><p className="stat-card__label">Staff</p><p className="stat-card__value">{stats.staff}</p></div>
        <div className="stat-card"><p className="stat-card__label">Revenue</p><p className="stat-card__value">${stats.revenue.toFixed(0)}</p></div>
      </div>
      <div className="panel">
        <div className="panel__header">Audit trail (last 50 actions)</div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Time</th><th>User ID</th><th>Action</th><th>Resource</th></tr></thead>
            <tbody>
              {audit.map((a) => (
                <tr key={a.id}>
                  <td>{new Date(a.created_at).toLocaleString()}</td>
                  <td>{a.user_id ?? '—'}</td>
                  <td>{a.action}</td>
                  <td>{a.resource} {a.resource_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
