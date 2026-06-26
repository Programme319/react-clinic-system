import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import supabase from '@/lib/supabase';
import { Link, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Users, Plus, Search, Loader2 } from 'lucide-react';

export default function Index() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'سجل المرضى - ClinicCare';
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
      setLoading(true);
      setError(null);

      let query = supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (search.trim()) {
        query = query.or(
          `full_name.ilike.%${search.trim()}%,national_id.ilike.%${search.trim()}%`,
        );
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
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Patient Records</h2>
            <p className="text-sm text-gray-500">قائمة المرضى — manage all clinic patients</p>
          </div>
          <Link
            to="/patients/create"
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700"
          >
            <Plus className="h-4 w-4" />
            Add Patient
          </Link>
        </div>
      }
    >
      <div className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or national ID..."
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-teal-500 focus:ring-teal-500"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}. Make sure you ran the SQL schema in Supabase.
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-20 text-gray-400">
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                Loading patients...
              </div>
            ) : patients.length === 0 ? (
              <div className="py-20 text-center">
                <Users className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-4 font-medium text-gray-600">No patients found</p>
                <p className="mt-1 text-sm text-gray-400">
                  {search ? 'Try a different search term.' : 'Add your first patient to get started.'}
                </p>
                {!search && (
                  <Link
                    to="/patients/create"
                    className="mt-6 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
                  >
                    <Plus className="h-4 w-4" />
                    Add Patient
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      <th className="px-6 py-4">Ticket #</th>
                      <th className="px-6 py-4">Full Name</th>
                      <th className="px-6 py-4">National ID</th>
                      <th className="px-6 py-4">Age</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {patients.map((p) => (
                      <tr key={p.id} className="transition hover:bg-gray-50">
                        <td className="px-6 py-4 font-mono text-sm text-teal-600">#{p.id}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">{p.full_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{p.national_id || '—'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{p.age ?? '—'}</td>
                        <td className="px-6 py-4 text-center">
                          <Link
                            to={`/patients/${p.id}`}
                            className="text-sm font-semibold text-teal-600 hover:text-teal-800"
                          >
                            View details
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
      </div>
    </AuthenticatedLayout>
  );
}
