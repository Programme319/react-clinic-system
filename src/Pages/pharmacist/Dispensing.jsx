import { useEffect, useState } from 'react';
import PharmacistLayout from '@/Layouts/PharmacistLayout';
import supabase from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { logView } from '@/lib/audit';

export default function DispensingLog() {
  const { authUser } = useAuth();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase?.from('dispensing_log').select('*, patient_medications(med_name, dosage, patients(name))').order('dispensed_at', { ascending: false });
      setLogs(data || []);
      await logView(authUser, 'dispensing_log', 'list');
    }
    load();
  }, [authUser]);

  return (
    <PharmacistLayout title="Dispensing Log">
      <div className="panel">
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Date</th><th>Patient</th><th>Medication</th><th>Qty</th></tr></thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id}>
                  <td>{new Date(l.dispensed_at).toLocaleString()}</td>
                  <td>{l.patient_medications?.patients?.name}</td>
                  <td>{l.patient_medications?.med_name}</td>
                  <td>{l.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PharmacistLayout>
  );
}
