import { useEffect, useState } from 'react';
import DoctorLayout from '@/Layouts/DoctorLayout';
import supabase from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { logCreate, logView } from '@/lib/audit';

export default function DoctorPrescriptions() {
  const { authUser } = useAuth();
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ patient_id: '', med_code: '', med_name: '', dosage: '' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase?.from('patients').select('id, name').order('name').then(({ data }) => setPatients(data || []));
    logView(authUser, 'prescriptions', 'writer');
  }, [authUser]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      const { data, error } = await supabase.from('patient_medications').insert({
        patient_id: parseInt(form.patient_id, 10),
        med_code: form.med_code || 'RX',
        med_name: form.med_name,
        dosage: form.dosage,
        status: 'approved',
        prescribed_by: authUser.id,
      }).select().single();
      if (error) throw error;
      await logCreate(authUser, 'prescription', data.id, { med_name: form.med_name });
      setMsg('Prescription signed and saved.');
      setForm({ patient_id: form.patient_id, med_code: '', med_name: '', dosage: '' });
    } catch (err) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DoctorLayout title="Prescription Writer">
      <div className="panel" style={{ maxWidth: 560 }}>
        <div className="panel__header">New prescription</div>
        <form onSubmit={submit} className="panel__body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {msg && <div className={`alert ${msg.includes('signed') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
          <div className="input-group">
            <label className="input-label">Patient</label>
            <select className="input-field" required value={form.patient_id} onChange={(e) => setForm({ ...form, patient_id: e.target.value })}>
              <option value="">Select patient</option>
              {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Medication name</label>
            <input className="input-field" required value={form.med_name} onChange={(e) => setForm({ ...form, med_name: e.target.value })} />
          </div>
          <div className="input-group">
            <label className="input-label">Med code</label>
            <input className="input-field" value={form.med_code} onChange={(e) => setForm({ ...form, med_code: e.target.value })} />
          </div>
          <div className="input-group">
            <label className="input-label">Dosage</label>
            <input className="input-field" required value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Signing…' : 'Sign & submit prescription'}
          </button>
        </form>
      </div>
    </DoctorLayout>
  );
}
