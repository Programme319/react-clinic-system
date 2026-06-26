import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import supabase from '@/lib/supabase';
import { Link, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Users, Plus, Search, Mail, Phone } from 'lucide-react';
import '@/css/pages/patients.css';

export default function Index() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { document.title = 'Patients — ClinicCare'; }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      setSearchParams(params, { replace: true });
    }, 300);
    return () => clearTimeout(timer);
  }, [search, setSearchParams]);

  useEffect(() => {
    async function fetchPatients() {
      if (!supabase) return;
      setLoading(true);
      setError(null);
      let query = supabase.from('patients').select('*').order('created_at', { ascending: false });
      if (search.trim()) {
        const term = `%${search.trim()}%`;
        query = query.or(`name.ilike.${term},email.ilike.${term},phone.ilike.${term}`);
      }
      const { data, error: fetchError } = await query;
      if (fetchError) { setError(fetchError.message); setPatients([]); }
      else setPatients(data || []);
      setLoading(false);
    }
    fetchPatients();
  }, [search]);

  return (
    <AuthenticatedLayout
      header={
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="page-title">Patients</h1>
            <p className="page-subtitle">Manage clinic patient records</p>
          </div>
          <Link to="/patients/create" className="btn btn-primary"><Plus size={16} /> Add patient</Link>
        </div>
      }
    >
      <div className="page-container">
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="patients__toolbar">
            <div className="patients__search">
              <Search size={16} className="patients__search-icon" />
              <input
                type="text"
                placeholder="Search name, email, or phone…"
                className="patients__search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {error && <div className="alert alert-error" style={{ margin: '1rem 1.5rem 0' }}>{error}</div>}

          {loading ? (
            <div className="loading-center"><div className="spinner" /><span>Loading patients…</span></div>
          ) : patients.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon"><Users size={28} /></div>
              <p className="empty-state__title">No patients found</p>
              <p className="empty-state__desc">{search ? 'Try a different search.' : 'Add your first patient.'}</p>
              {!search && <Link to="/patients/create" className="btn btn-primary" style={{ marginTop: '1rem' }}><Plus size={16} /> Add patient</Link>}
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th><th>Name</th><th>Contact</th><th>Date of birth</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p) => (
                    <tr key={p.id}>
                      <td><span className="link-primary" style={{ fontFamily: 'monospace' }}>#{p.id}</span></td>
                      <td style={{ fontWeight: 600, color: 'var(--color-text)' }}>{p.name}</td>
                      <td>
                        {p.email && <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem' }}><Mail size={14} />{p.email}</span>}
                        {p.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem' }}><Phone size={14} />{p.phone}</span>}
                        {!p.email && !p.phone && '—'}
                      </td>
                      <td>{p.date_of_birth ? new Date(p.date_of_birth).toLocaleDateString() : '—'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <Link to={`/patients/${p.id}`} className="link-primary">View →</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
