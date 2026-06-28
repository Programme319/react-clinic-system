import { useEffect, useState } from 'react';
import DoctorLayout from '@/Layouts/DoctorLayout';
import supabase from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { logView } from '@/lib/audit';

export default function DoctorLabs() {
  const { authUser } = useAuth();
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!supabase) return;
      const { data } = await supabase
        .from('patient_investigations')
        .select('*, patients(name, clinic_code)')
        .order('created_at', { ascending: false });
      setLabs(data || []);
      await logView(authUser, 'lab_results', 'list');
      setLoading(false);
    }
    load();
  }, [authUser]);

  return (
    <DoctorLayout title="Lab Results">
      <div className="panel">
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Patient</th><th>Test</th><th>Code</th><th>Result</th></tr>
              </thead>
              <tbody>
                {labs.map((l) => (
                  <tr key={l.id}>
                    <td>{l.patients?.name || `#${l.patient_id}`}</td>
                    <td>{l.test_name}</td>
                    <td>{l.test_code}</td>
                    <td><strong>{l.test_result || 'Pending'}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DoctorLayout>
  );
}
