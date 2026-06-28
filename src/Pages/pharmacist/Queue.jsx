import { useEffect, useState } from 'react';
import PharmacistLayout from '@/Layouts/PharmacistLayout';
import supabase from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { logUpdate, logView } from '@/lib/audit';

export default function PrescriptionQueue() {
  const { authUser } = useAuth();
  const [items, setItems] = useState([]);

  const load = async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from('patient_medications')
      .select('*, patients(name, clinic_code)')
      .in('status', ['pending', 'approved'])
      .order('created_at', { ascending: false });
    setItems(data || []);
    await logView(authUser, 'prescription_queue', 'list');
  };

  useEffect(() => { load(); }, [authUser]);

  const updateStatus = async (id, status) => {
    await supabase.from('patient_medications').update({ status, approved_by: authUser.id }).eq('id', id);
    await logUpdate(authUser, 'prescription', id, { status });
    load();
  };

  return (
    <PharmacistLayout title="Prescription Queue">
      <div className="panel">
        <div className="panel__header">Doctor-approved & pending prescriptions</div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Patient</th><th>Medication</th><th>Dosage</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map((m) => (
                <tr key={m.id}>
                  <td>{m.patients?.name}</td>
                  <td>{m.med_name}</td>
                  <td>{m.dosage}</td>
                  <td><span className="badge badge-primary">{m.status || 'pending'}</span></td>
                  <td style={{ display: 'flex', gap: '0.5rem' }}>
                    {m.status !== 'approved' && (
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => updateStatus(m.id, 'approved')}>Approve</button>
                    )}
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => updateStatus(m.id, 'rejected')}>Reject</button>
                    {m.status === 'approved' && (
                      <button type="button" className="btn btn-primary btn-sm" onClick={async () => {
                        await supabase.from('dispensing_log').insert({ medication_id: m.id, pharmacist_id: authUser.id });
                        await updateStatus(m.id, 'dispensed');
                      }}>Dispense</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PharmacistLayout>
  );
}
