import { Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function GuestLayout({ children, title, subtitle }) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <div className="relative hidden w-[45%] overflow-hidden lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-800 via-teal-700 to-emerald-800" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-white/30 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-emerald-300/20 blur-3xl" />
        </div>

        <div className="relative z-10 p-10">
          <Link to="/" className="inline-flex items-center gap-3 text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <Stethoscope className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">ClinicCare</span>
          </Link>
        </div>

        <div className="relative z-10 px-10 pb-16">
          <h2 className="max-w-md text-4xl font-extrabold leading-tight text-white">
            Healthcare management that feels effortless.
          </h2>
          <p className="mt-5 max-w-sm text-base leading-relaxed text-teal-100">
            Patient records, lab results, prescriptions, and AI chat — organized for your whole clinic team.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { n: '500+', l: 'Records managed' },
              { n: '99.9%', l: 'Uptime' },
              { n: 'AR/EN', l: 'Bilingual' },
              { n: 'Secure', l: 'Supabase cloud' },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-xl font-bold text-white">{s.n}</p>
                <p className="text-xs text-teal-100">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 px-10 pb-8 text-sm text-teal-200/80">
          © {new Date().getFullYear()} ClinicCare
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
        <Link to="/" className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white">
            <Stethoscope className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-slate-900">ClinicCare</span>
        </Link>

        <div className="w-full max-w-[420px]">
          {(title || subtitle) && (
            <div className="mb-8">
              {title && <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{title}</h1>}
              {subtitle && <p className="mt-2 text-sm text-slate-500">{subtitle}</p>}
            </div>
          )}

          <div className="card p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
