import { useEffect, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import supabase from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { logView } from '@/lib/audit';

export default function AdminReports() {
  const { authUser } = useAuth();
  const [audit, setAudit] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    async function load() {
      const { data: logs } = await supabase?.from('audit_logs').select('*, users(name)').order('created_at', { ascending: false }).limit(50);
      setAudit(logs || []);
      const [p, u, inv] = await Promise.all([
        supabase.from('patients').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('invoices').select('amount'),
      ]);
      const revenue = (inv.data || []).reduce((s, i) => s + Number(i.amount || 0), 0);
      setStats({ patients: p.count, staff: u.count, revenue });
      await logView(authUser, 'reports', 'operational');
    }
    load();
  }, [authUser]);

  return (
    <AdminLayout title="Operational Reports">
      <div className="stat-grid">
        <div className="stat-card"><p className="stat-card__label">Patients</p><p className="stat-card__value">{stats.patients || 0}</p></div>
        <div className="stat-card"><p className="stat-card__label">Staff</p><p className="stat-card__value">{stats.staff || 0}</p></div>
        <div className="stat-card"><p className="stat-card__label">Revenue</p><p className="stat-card__value">${(stats.revenue || 0).toFixed(0)}</p></div>
      </div>
      <div className="panel">
        <div className="panel__header">Audit trail (last 50 actions)</div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Time</th><th>User</th><th>Action</th><th>Resource</th></tr></thead>
            <tbody>
              {audit.map((a) => (
                <tr key={a.id}>
                  <td>{new Date(a.created_at).toLocaleString()}</td>
                  <td>{a.users?.name || a.user_id}</td>
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
