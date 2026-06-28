import { useEffect, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import supabase from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { logView } from '@/lib/audit';

export default function AdminScheduling() {
  const { authUser } = useAuth();
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase?.from('appointments').select('*, patients(name), users(name)').order('scheduled_at');
      setAppointments(data || []);
      await logView(authUser, 'scheduling', 'list');
    }
    load();
  }, [authUser]);

  return (
    <AdminLayout title="Scheduling">
      <div className="panel">
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Date</th><th>Patient</th><th>Doctor</th><th>Status</th></tr></thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td>{new Date(a.scheduled_at).toLocaleString()}</td>
                  <td>{a.patients?.name}</td>
                  <td>{a.users?.name || '—'}</td>
                  <td>{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
