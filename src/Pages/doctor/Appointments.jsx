import { useEffect, useState } from 'react';
import DoctorLayout from '@/Layouts/DoctorLayout';
import supabase from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { logCreate, logView } from '@/lib/audit';

export default function DoctorAppointments() {
  const { authUser } = useAuth();
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({ patient_id: '', scheduled_at: '', notes: '' });

  const load = async () => {
    if (!supabase) return;
    const [p, a] = await Promise.all([
      supabase.from('patients').select('id, name').order('name'),
      supabase.from('appointments').select('*, patients(name)').eq('doctor_id', authUser.id).order('scheduled_at'),
    ]);
    setPatients(p.data || []);
    setAppointments(a.data || []);
    await logView(authUser, 'appointments', 'schedule');
  };

  useEffect(() => { load(); }, [authUser]);

  const book = async (e) => {
    e.preventDefault();
    await supabase.from('appointments').insert({
      patient_id: parseInt(form.patient_id, 10),
      doctor_id: authUser.id,
      scheduled_at: form.scheduled_at,
      notes: form.notes,
    });
    await logCreate(authUser, 'appointment', 'new');
    setForm({ patient_id: '', scheduled_at: '', notes: '' });
    load();
  };

  return (
    <DoctorLayout title="Appointment Schedule">
      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <form onSubmit={book} className="panel">
          <div className="panel__header">Book appointment</div>
          <div className="panel__body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <select className="input-field" required value={form.patient_id} onChange={(e) => setForm({ ...form, patient_id: e.target.value })}>
              <option value="">Patient</option>
              {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input type="datetime-local" className="input-field" required value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} />
            <textarea className="input-field" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <button type="submit" className="btn btn-primary">Schedule</button>
          </div>
        </form>
        <div className="panel">
          <div className="panel__header">Upcoming</div>
          <div className="panel__body">
            {appointments.length === 0 ? <p className="empty-state__desc">No appointments</p> : appointments.map((a) => (
              <div key={a.id} className="patient-detail__record">
                <p className="patient-detail__record-name">{a.patients?.name}</p>
                <p className="patient-detail__record-code">{new Date(a.scheduled_at).toLocaleString()}</p>
                <p>{a.notes}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
}
