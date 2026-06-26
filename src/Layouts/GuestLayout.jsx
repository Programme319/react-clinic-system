import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from 'react-router-dom';

export default function GuestLayout({ children, title, subtitle }) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-700 p-12 text-white lg:flex">
        <Link to="/" className="flex items-center gap-3">
          <ApplicationLogo className="h-10 w-10 fill-current text-white" />
          <span className="text-xl font-bold tracking-tight">ClinicCare</span>
        </Link>

        <div>
          <h2 className="text-3xl font-bold leading-tight">
            Modern clinic management, simplified.
          </h2>
          <p className="mt-4 max-w-md text-teal-100">
            Track patients, manage records, and streamline your daily workflow — all in one secure platform.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-teal-50">
            <li className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs">✓</span>
              Patient records & visit history
            </li>
            <li className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs">✓</span>
              Secure cloud storage with Supabase
            </li>
            <li className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs">✓</span>
              Arabic & English support
            </li>
          </ul>
        </div>

        <p className="text-sm text-teal-200">© {new Date().getFullYear()} ClinicCare</p>
      </div>

      <div className="flex w-full flex-col items-center justify-center bg-slate-50 px-6 py-12 lg:w-1/2">
        <Link to="/" className="mb-8 lg:hidden">
          <ApplicationLogo className="h-12 w-12 fill-current text-teal-600" />
        </Link>

        <div className="w-full max-w-md">
          {title && (
            <div className="mb-8 text-center lg:text-left">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
            </div>
          )}

          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
