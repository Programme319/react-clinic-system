import { useEffect, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import supabase from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { logCreate, logView } from '@/lib/audit';

export default function AdminBilling() {
  const { authUser } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [form, setForm] = useState({ patient_id: '', amount: '', description: '' });
  const [patients, setPatients] = useState([]);

  const load = async () => {
    const [inv, pat] = await Promise.all([
      supabase.from('invoices').select('*, patients(name)').order('created_at', { ascending: false }),
      supabase.from('patients').select('id, name'),
    ]);
    setInvoices(inv.data || []);
    setPatients(pat.data || []);
    await logView(authUser, 'billing', 'list');
  };

  useEffect(() => { load(); }, [authUser]);

  const create = async (e) => {
    e.preventDefault();
    await supabase.from('invoices').insert({
      patient_id: parseInt(form.patient_id, 10),
      amount: parseFloat(form.amount),
      description: form.description,
    });
    await logCreate(authUser, 'invoice', 'new');
    setForm({ patient_id: '', amount: '', description: '' });
    load();
  };

  return (
    <AdminLayout title="Billing & Invoices">
      <form onSubmit={create} className="panel" style={{ marginBottom: '1.5rem', maxWidth: 480 }}>
        <div className="panel__header">New invoice</div>
        <div className="panel__body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <select className="input-field" required value={form.patient_id} onChange={(e) => setForm({ ...form, patient_id: e.target.value })}>
            <option value="">Patient</option>
            {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input className="input-field" type="number" step="0.01" placeholder="Amount" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <input className="input-field" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <button type="submit" className="btn btn-primary">Create invoice</button>
        </div>
      </form>
      <div className="panel">
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Patient</th><th>Amount</th><th>Status</th><th>Description</th></tr></thead>
            <tbody>
              {invoices.map((i) => (
                <tr key={i.id}>
                  <td>{i.patients?.name}</td>
                  <td>${Number(i.amount).toFixed(2)}</td>
                  <td>{i.status}</td>
                  <td>{i.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
