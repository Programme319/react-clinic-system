import { useEffect, useState } from 'react';
import NurseLayout from '@/Layouts/NurseLayout';
import supabase from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { logView } from '@/lib/audit';

export default function NurseDashboard() {
  const { authUser } = useAuth();
  const [stats, setStats] = useState({ patients: 0, tasks: 0, vitals: 0 });

  useEffect(() => {
    async function load() {
      const [p, t, v] = await Promise.all([
        supabase.from('patients').select('*', { count: 'exact', head: true }),
        supabase.from('nurse_tasks').select('*', { count: 'exact', head: true }).eq('assigned_nurse_id', authUser.id).eq('status', 'pending'),
        supabase.from('patient_vitals').select('*', { count: 'exact', head: true }),
      ]);
      setStats({ patients: p.count || 0, tasks: t.count || 0, vitals: v.count || 0 });
      await logView(authUser, 'nurse_dashboard', 'overview');
    }
    load();
  }, [authUser]);

  return (
    <NurseLayout title={`Welcome, ${authUser?.name?.split(' ')[0]}`}>
      <div className="stat-grid">
        <div className="stat-card"><p className="stat-card__label">Assigned patients</p><p className="stat-card__value">{stats.patients}</p></div>
        <div className="stat-card"><p className="stat-card__label">Pending tasks</p><p className="stat-card__value">{stats.tasks}</p></div>
        <div className="stat-card"><p className="stat-card__label">Vitals logged</p><p className="stat-card__value">{stats.vitals}</p></div>
      </div>
    </NurseLayout>
  );
}
