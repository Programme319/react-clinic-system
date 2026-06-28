import { useEffect, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import supabase from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { createStaffUser } from '@/lib/auth';
import { ROLES } from '@/lib/permissions';
import { logCreate, logUpdate, logView } from '@/lib/audit';

export default function StaffManagement() {
  const { authUser } = useAuth();
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: ROLES.NURSE });
  const [msg, setMsg] = useState('');

  const load = async () => {
    const { data } = await supabase?.from('users').select('id, name, email, role, is_active, created_at').order('name');
    setStaff(data || []);
    await logView(authUser, 'staff', 'list');
  };

  useEffect(() => { load(); }, [authUser]);

  const create = async (e) => {
    e.preventDefault();
    try {
      await createStaffUser(form);
      await logCreate(authUser, 'user', form.email, { role: form.role });
      setMsg('Staff member created.');
      setForm({ name: '', email: '', password: '', role: ROLES.NURSE });
      load();
    } catch (err) {
      setMsg(err.message);
    }
  };

  const toggleActive = async (id, active) => {
    await supabase.from('users').update({ is_active: !active }).eq('id', id);
    await logUpdate(authUser, 'user', id, { is_active: !active });
    load();
  };

  return (
    <AdminLayout title="Staff Management">
      <form onSubmit={create} className="panel" style={{ marginBottom: '1.5rem', maxWidth: 560 }}>
        <div className="panel__header">Add staff member</div>
        <div className="panel__body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {msg && <div className="alert alert-success">{msg}</div>}
          <input className="input-field" placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input-field" type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input-field" type="password" placeholder="Password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <select className="input-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            {Object.values(ROLES).map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <button type="submit" className="btn btn-primary">Create user</button>
        </div>
      </form>
      <div className="panel">
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {staff.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className="badge badge-primary">{u.role || 'Nurse'}</span></td>
                  <td>{u.is_active !== false ? 'Active' : 'Inactive'}</td>
                  <td>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => toggleActive(u.id, u.is_active !== false)}>
                      {u.is_active !== false ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
