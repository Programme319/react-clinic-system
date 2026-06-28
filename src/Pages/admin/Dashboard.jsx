import { useEffect, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import supabase from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { logView } from '@/lib/audit';

export default function AdminDashboard() {
  const { authUser } = useAuth();
  const [stats, setStats] = useState({ staff: 0, invoices: 0, appts: 0 });

  useEffect(() => {
    async function load() {
      const [s, i, a] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('invoices').select('*', { count: 'exact', head: true }),
        supabase.from('appointments').select('*', { count: 'exact', head: true }),
      ]);
      setStats({ staff: s.count || 0, invoices: i.count || 0, appts: a.count || 0 });
      await logView(authUser, 'admin_dashboard', 'overview');
    }
    load();
  }, [authUser]);

  return (
    <AdminLayout title="Administrator Overview">
      <div className="stat-grid">
        <div className="stat-card"><p className="stat-card__label">Staff</p><p className="stat-card__value">{stats.staff}</p></div>
        <div className="stat-card"><p className="stat-card__label">Invoices</p><p className="stat-card__value">{stats.invoices}</p></div>
        <div className="stat-card"><p className="stat-card__label">Appointments</p><p className="stat-card__value">{stats.appts}</p></div>
      </div>
    </AdminLayout>
  );
}
