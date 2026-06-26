import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useAuth } from '@/contexts/AuthContext';
import supabase from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { Users, UserPlus, ClipboardList, ArrowRight, Activity } from 'lucide-react';

export default function Dashboard() {
  const { authUser } = useAuth();
  const [patientCount, setPatientCount] = useState(0);
  const [recentPatients, setRecentPatients] = useState([]);

  useEffect(() => {
    document.title = 'Dashboard — ClinicCare';
  }, []);

  useEffect(() => {
    async function loadStats() {
      if (!supabase) return;

      const { count } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });

      setPatientCount(count || 0);

      const { data } = await supabase
        .from('patients')
        .select('id, name, phone, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentPatients(data || []);
    }

    loadStats();
  }, []);

  const cards = [
    {
      label: 'Total patients',
      value: patientCount,
      icon: Users,
      color: 'from-teal-500 to-emerald-600',
    },
    {
      label: 'Your role',
      value: authUser?.role || 'Staff',
      icon: Activity,
      color: 'from-violet-500 to-purple-600',
      isText: true,
    },
  ];

  return (
    <AuthenticatedLayout
      header={
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Good day, {authUser?.name?.split(' ')[0]}
          </h1>
          <p className="mt-1 text-sm text-slate-500">Here&apos;s your clinic overview for today.</p>
        </div>
      }
    >
      <div className="page-container space-y-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ label, value, icon: Icon, color, isText }) => (
            <div key={label} className="card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{label}</p>
                  <p className={`mt-2 ${isText ? 'text-xl' : 'text-3xl'} font-extrabold text-slate-900`}>
                    {value}
                  </p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-white shadow-sm`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          ))}

          <Link
            to="/patients/create"
            className="group card flex items-center justify-between p-6 transition hover:border-teal-300 hover:shadow-md"
          >
            <div>
              <p className="font-bold text-slate-900">Add patient</p>
              <p className="mt-1 text-sm text-slate-500">New record + tests & meds</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-600 transition group-hover:bg-teal-600 group-hover:text-white">
              <UserPlus className="h-6 w-6" />
            </div>
          </Link>
        </div>

        <div className="card">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="font-bold text-slate-900">Recent patients</h2>
            <Link to="/patients" className="inline-flex items-center gap-1 text-sm font-semibold text-teal-600">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {recentPatients.length === 0 ? (
            <div className="py-16 text-center">
              <ClipboardList className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">No patients yet.</p>
              <Link to="/patients/create" className="btn-primary mt-4 inline-flex">
                Add first patient
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentPatients.map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/patients/${p.id}`}
                    className="flex items-center justify-between px-6 py-4 transition hover:bg-teal-50/40"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{p.name}</p>
                      <p className="text-sm text-slate-500">{p.phone || 'No phone'}</p>
                    </div>
                    <span className="font-mono text-sm text-teal-600">#{p.id}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
