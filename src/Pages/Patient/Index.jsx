import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import supabase from '@/lib/supabase';
import { Link, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Users, Plus, Search, Loader2, Phone, Mail } from 'lucide-react';

export default function Index() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'Patients — ClinicCare';
  }, []);

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

      if (fetchError) {
        setError(fetchError.message);
        setPatients([]);
      } else {
        setPatients(data || []);
      }
      setLoading(false);
    }

    fetchPatients();
  }, [search]);

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Patients</h1>
            <p className="mt-1 text-sm text-slate-500">Manage clinic patient records</p>
          </div>
          <Link to="/patients/create" className="btn-primary gap-2">
            <Plus className="h-4 w-4" />
            Add patient
          </Link>
        </div>
      }
    >
      <div className="page-container">
        <div className="card overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-4">
            <div className="relative max-w-lg">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, email, or phone…"
                className="w-full rounded-xl border-slate-200 py-2.5 pl-10 pr-4 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="mx-6 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-24 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading patients…
            </div>
          ) : patients.length === 0 ? (
            <div className="py-24 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <Users className="h-8 w-8 text-slate-400" />
              </div>
              <p className="mt-4 font-semibold text-slate-700">No patients yet</p>
              <p className="mt-1 text-sm text-slate-400">
                {search ? 'Try a different search.' : 'Add your first patient to get started.'}
              </p>
              {!search && (
                <Link to="/patients/create" className="btn-primary mt-6 inline-flex gap-2">
                  <Plus className="h-4 w-4" /> Add patient
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Date of birth</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patients.map((p) => (
                    <tr key={p.id} className="transition hover:bg-teal-50/30">
                      <td className="px-6 py-4 font-mono text-teal-600">#{p.id}</td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">{p.name}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        <div className="flex flex-col gap-1">
                          {p.email && (
                            <span className="inline-flex items-center gap-1.5">
                              <Mail className="h-3.5 w-3.5" /> {p.email}
                            </span>
                          )}
                          {p.phone && (
                            <span className="inline-flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5" /> {p.phone}
                            </span>
                          )}
                          {!p.email && !p.phone && '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {p.date_of_birth
                          ? new Date(p.date_of_birth).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/patients/${p.id}`}
                          className="font-semibold text-teal-600 hover:text-teal-800"
                        >
                          View →
                        </Link>
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
