import { useEffect, useState } from 'react';
import PharmacistLayout from '@/Layouts/PharmacistLayout';
import supabase from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { logView } from '@/lib/audit';

export default function PharmacistDashboard() {
  const { authUser } = useAuth();
  const [stats, setStats] = useState({ queue: 0, inventory: 0, dispensed: 0 });

  useEffect(() => {
    async function load() {
      if (!supabase) return;
      const [q, i, d] = await Promise.all([
        supabase.from('patient_medications').select('*', { count: 'exact', head: true }).in('status', ['pending', 'approved']),
        supabase.from('drug_inventory').select('*', { count: 'exact', head: true }),
        supabase.from('dispensing_log').select('*', { count: 'exact', head: true }),
      ]);
      setStats({ queue: q.count || 0, inventory: i.count || 0, dispensed: d.count || 0 });
      await logView(authUser, 'pharmacist_dashboard', 'overview');
    }
    load();
  }, [authUser]);

  return (
    <PharmacistLayout title="Pharmacy Overview">
      <div className="stat-grid">
        <div className="stat-card"><p className="stat-card__label">Queue</p><p className="stat-card__value">{stats.queue}</p></div>
        <div className="stat-card"><p className="stat-card__label">Inventory items</p><p className="stat-card__value">{stats.inventory}</p></div>
        <div className="stat-card"><p className="stat-card__label">Dispensed today</p><p className="stat-card__value">{stats.dispensed}</p></div>
      </div>
    </PharmacistLayout>
  );
}
