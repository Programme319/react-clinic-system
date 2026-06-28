import { useEffect, useState } from 'react';
import PharmacistLayout from '@/Layouts/PharmacistLayout';
import supabase from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { logCreate, logUpdate, logView } from '@/lib/audit';

export default function DrugInventory() {
  const { authUser } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ med_code: '', med_name: '', stock_quantity: 0, reorder_level: 10 });

  const load = async () => {
    const { data } = await supabase?.from('drug_inventory').select('*').order('med_name');
    setItems(data || []);
    await logView(authUser, 'drug_inventory', 'list');
  };

  useEffect(() => { load(); }, [authUser]);

  const add = async (e) => {
    e.preventDefault();
    await supabase.from('drug_inventory').insert(form);
    await logCreate(authUser, 'drug_inventory', form.med_code);
    setForm({ med_code: '', med_name: '', stock_quantity: 0, reorder_level: 10 });
    load();
  };

  const adjustStock = async (id, qty) => {
    await supabase.from('drug_inventory').update({ stock_quantity: qty, updated_at: new Date().toISOString() }).eq('id', id);
    await logUpdate(authUser, 'drug_inventory', id, { stock_quantity: qty });
    load();
  };

  return (
    <PharmacistLayout title="Drug Inventory">
      <form onSubmit={add} className="panel" style={{ marginBottom: '1.5rem', maxWidth: 600 }}>
        <div className="panel__header">Add stock item</div>
        <div className="panel__body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <input className="input-field" placeholder="Code" required value={form.med_code} onChange={(e) => setForm({ ...form, med_code: e.target.value })} />
          <input className="input-field" placeholder="Name" required value={form.med_name} onChange={(e) => setForm({ ...form, med_name: e.target.value })} />
          <input type="number" className="input-field" placeholder="Quantity" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: +e.target.value })} />
          <button type="submit" className="btn btn-primary">Add</button>
        </div>
      </form>
      <div className="panel">
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Code</th><th>Name</th><th>Stock</th><th>Reorder</th><th>Update</th></tr></thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id} style={i.stock_quantity <= i.reorder_level ? { background: '#fffbeb' } : {}}>
                  <td>{i.med_code}</td>
                  <td>{i.med_name}</td>
                  <td>{i.stock_quantity}</td>
                  <td>{i.reorder_level}</td>
                  <td>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => adjustStock(i.id, i.stock_quantity + 10)}>+10</button>
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
