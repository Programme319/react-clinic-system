import { useEffect, useState } from 'react';
import NurseLayout from '@/Layouts/NurseLayout';
import supabase from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { logUpdate, logView } from '@/lib/audit';

export default function MAR() {
  const { authUser } = useAuth();
  const [records, setRecords] = useState([]);

  const load = async () => {
    const { data } = await supabase?.from('mar_records').select('*, patients(name), patient_medications(med_name, dosage)').order('scheduled_at');
    setRecords(data || []);
    await logView(authUser, 'mar', 'list');
  };

  useEffect(() => { load(); }, [authUser]);

  const administer = async (id) => {
    await supabase.from('mar_records').update({ status: 'administered', administered_at: new Date().toISOString(), nurse_id: authUser.id }).eq('id', id);
    await logUpdate(authUser, 'mar', id, { status: 'administered' });
    load();
  };

  return (
    <NurseLayout title="Medication Administration Record">
      <div className="panel">
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Patient</th><th>Medication</th><th>Scheduled</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td>{r.patients?.name}</td>
                  <td>{r.patient_medications?.med_name} ({r.patient_medications?.dosage})</td>
                  <td>{r.scheduled_at ? new Date(r.scheduled_at).toLocaleString() : '—'}</td>
                  <td>{r.status}</td>
                  <td>
                    {r.status !== 'administered' && (
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => administer(r.id)}>Administered</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </NurseLayout>
  );
}
