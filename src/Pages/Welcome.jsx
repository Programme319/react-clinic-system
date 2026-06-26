import { Link, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowRight,
  Stethoscope,
  Shield,
  Users,
  FileText,
  Clock,
  HeartPulse,
  CheckCircle2,
} from 'lucide-react';

export default function Welcome() {
  const { authUser, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.title = 'ClinicCare — Smart Clinic Management';
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!loading && authUser) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      icon: <Users className="h-6 w-6 text-teal-600" />,
      title: 'Patient Management',
      desc: 'Register patients, track visits, and access full medical histories in seconds.',
    },
    {
      icon: <FileText className="h-6 w-6 text-teal-600" />,
      title: 'Medical Records',
      desc: 'Store diagnoses, lab tests, and prescriptions — printable and bilingual.',
    },
    {
      icon: <Shield className="h-6 w-6 text-teal-600" />,
      title: 'Secure & Cloud-Based',
      desc: 'Your data is protected with Supabase authentication and row-level security.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur-md' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">ClinicCare</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden px-6 pt-32 pb-20">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-cyan-50" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-sm font-medium text-teal-700">
            <HeartPulse className="h-4 w-4" />
            Smart Clinic Management System
          </div>

          <h1 className="text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
            Manage your clinic{' '}
            <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              with confidence
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-500">
            ClinicCare helps doctors and staff organize patient records, diagnoses, and prescriptions —
            all in one secure, easy-to-use platform. Arabic & English supported.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 rounded-xl bg-teal-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-700"
            >
              Start Free
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-8 py-3.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
            <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-yellow-400" />
              <div className="h-3 w-3 rounded-full bg-green-400" />
              <span className="ml-2 text-xs text-gray-400">ClinicCare Dashboard</span>
            </div>
            <div className="grid grid-cols-3 gap-4 p-6">
              <div className="col-span-2 space-y-4">
                <div className="rounded-xl border border-gray-100 bg-teal-50 p-4">
                  <p className="text-xs font-medium text-teal-600">Total Patients</p>
                  <p className="text-3xl font-bold text-gray-900">128</p>
                </div>
                <div className="h-32 rounded-xl border border-gray-100 bg-gray-50" />
              </div>
              <div className="space-y-4">
                <div className="h-24 rounded-xl border border-gray-100 bg-gray-50" />
                <div className="h-24 rounded-xl border border-gray-100 bg-gray-50" />
                <div className="h-24 rounded-xl border border-gray-100 bg-gray-50" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Everything your clinic needs</h2>
            <p className="mx-auto mt-4 max-w-lg text-gray-500">
              Built for real clinics — from patient intake to printable medical reports.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature, i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-200 bg-white p-8 transition hover:border-teal-200 hover:shadow-md"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: '100%', label: 'Cloud Secure', icon: <Shield className="h-4 w-4" /> },
              { value: '24/7', label: 'Access Anywhere', icon: <Clock className="h-4 w-4" /> },
              { value: 'AR/EN', label: 'Bilingual UI', icon: <FileText className="h-4 w-4" /> },
              { value: 'Free', label: 'To Get Started', icon: <CheckCircle2 className="h-4 w-4" /> },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="mt-1 text-sm font-medium text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-teal-700 to-cyan-800 px-6 py-24 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to modernize your clinic?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-teal-100">
            Create your free account and start managing patients in minutes.
          </p>
          <Link
            to="/register"
            className="group mt-10 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-teal-800 shadow-lg transition hover:bg-teal-50"
          >
            Create Free Account
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-100 px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-teal-600" />
            <span className="font-bold text-gray-900">ClinicCare</span>
          </div>
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} ClinicCare. Smart clinic management.
          </p>
          <div className="flex gap-6">
            <Link to="/login" className="text-sm text-gray-500 hover:text-gray-700">
              Sign in
            </Link>
            <Link to="/register" className="text-sm text-gray-500 hover:text-gray-700">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
