import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useAuth } from '@/contexts/AuthContext';
import supabase from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { Users, UserPlus, ClipboardList, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const { authUser } = useAuth();
  const [patientCount, setPatientCount] = useState(0);
  const [recentPatients, setRecentPatients] = useState([]);

  useEffect(() => {
    document.title = 'Dashboard - ClinicCare';
  }, []);

  useEffect(() => {
    async function loadStats() {
      const { count } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });

      setPatientCount(count || 0);

      const { data } = await supabase
        .from('patients')
        .select('id, full_name, national_id, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentPatients(data || []);
    }

    loadStats();
  }, []);

  return (
    <AuthenticatedLayout
      header={
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Welcome back, {authUser?.name}
          </h2>
          <p className="text-sm text-gray-500">Here&apos;s what&apos;s happening at your clinic today.</p>
        </div>
      }
    >
      <div className="py-8">
        <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100">
                  <Users className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Patients</p>
                  <p className="text-2xl font-bold text-gray-900">{patientCount}</p>
                </div>
              </div>
            </div>

            <Link
              to="/patients/create"
              className="group rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50 p-6 shadow-sm transition hover:border-teal-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600">
                    <UserPlus className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Add Patient</p>
                    <p className="text-sm text-gray-500">Register a new visit</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-teal-600 transition group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              to="/patients"
              className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-gray-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                    <ClipboardList className="h-6 w-6 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">View All Records</p>
                    <p className="text-sm text-gray-500">Browse patient list</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 transition group-hover:translate-x-1" />
              </div>
            </Link>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <h3 className="font-semibold text-gray-800">Recent Patients</h3>
            </div>
            {recentPatients.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-400">
                <Users className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-3">No patients yet. Add your first patient to get started.</p>
                <Link
                  to="/patients/create"
                  className="mt-4 inline-block text-sm font-semibold text-teal-600 hover:text-teal-800"
                >
                  Add Patient →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentPatients.map((p) => (
                  <Link
                    key={p.id}
                    to={`/patients/${p.id}`}
                    className="flex items-center justify-between px-6 py-4 transition hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{p.full_name}</p>
                      <p className="text-sm text-gray-500">{p.national_id || 'No ID'}</p>
                    </div>
                    <span className="text-sm font-mono text-teal-600">#{p.id}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
