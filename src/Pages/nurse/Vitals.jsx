import { useEffect, useState } from 'react';
import NurseLayout from '@/Layouts/NurseLayout';
import supabase from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { logCreate, logView } from '@/lib/audit';

export default function VitalsEntry() {
  const { authUser } = useAuth();
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ patient_id: '', blood_pressure: '', heart_rate: '', temperature: '', oxygen_saturation: '', notes: '' });

  useEffect(() => {
    supabase?.from('patients').select('id, name').then(({ data }) => setPatients(data || []));
    logView(authUser, 'vitals', 'entry');
  }, [authUser]);

  const submit = async (e) => {
    e.preventDefault();
    await supabase.from('patient_vitals').insert({
      ...form,
      patient_id: parseInt(form.patient_id, 10),
      heart_rate: form.heart_rate ? parseInt(form.heart_rate, 10) : null,
      temperature: form.temperature ? parseFloat(form.temperature) : null,
      oxygen_saturation: form.oxygen_saturation ? parseInt(form.oxygen_saturation, 10) : null,
      nurse_id: authUser.id,
    });
    await logCreate(authUser, 'vitals', form.patient_id);
    setForm({ patient_id: '', blood_pressure: '', heart_rate: '', temperature: '', oxygen_saturation: '', notes: '' });
  };

  return (
    <NurseLayout title="Vitals Entry">
      <form onSubmit={submit} className="panel" style={{ maxWidth: 520 }}>
        <div className="panel__header">Record vitals</div>
        <div className="panel__body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <select className="input-field" required value={form.patient_id} onChange={(e) => setForm({ ...form, patient_id: e.target.value })}>
            <option value="">Patient</option>
            {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input className="input-field" placeholder="Blood pressure (120/80)" value={form.blood_pressure} onChange={(e) => setForm({ ...form, blood_pressure: e.target.value })} />
          <input className="input-field" placeholder="Heart rate" value={form.heart_rate} onChange={(e) => setForm({ ...form, heart_rate: e.target.value })} />
          <input className="input-field" placeholder="Temperature °C" value={form.temperature} onChange={(e) => setForm({ ...form, temperature: e.target.value })} />
          <input className="input-field" placeholder="SpO2 %" value={form.oxygen_saturation} onChange={(e) => setForm({ ...form, oxygen_saturation: e.target.value })} />
          <textarea className="input-field" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <button type="submit" className="btn btn-primary">Save vitals</button>
        </div>
      </form>
    </NurseLayout>
  );
}
