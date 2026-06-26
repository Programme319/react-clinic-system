import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Stethoscope, Users, Menu, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
  const { authUser, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, active: isActive('/dashboard') && !isActive('/patients') },
    { to: '/patients', label: 'Patients', icon: Users, active: isActive('/patients') },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
                <Stethoscope className="h-5 w-5" />
              </div>
              <span className="hidden font-bold text-slate-900 sm:inline">ClinicCare</span>
            </Link>

            <div className="hidden items-center gap-1 md:flex">
              {navItems.map(({ to, label, active }) => (
                <NavLink key={to} to={to} active={active}>
                  {label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
              {authUser?.role}
            </span>
            <Dropdown>
              <Dropdown.Trigger>
                <button
                  type="button"
                  className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 text-xs font-bold text-white">
                    {authUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                  <span className="max-w-[120px] truncate">{authUser?.name}</span>
                </button>
              </Dropdown.Trigger>
              <Dropdown.Content>
                <Dropdown.Link to="/profile">Profile settings</Dropdown.Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 text-start text-sm text-red-600 hover:bg-red-50"
                >
                  Sign out
                </button>
              </Dropdown.Content>
            </Dropdown>
          </div>

          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
            {navItems.map(({ to, label, active }) => (
              <ResponsiveNavLink key={to} to={to} active={active} onClick={() => setMobileOpen(false)}>
                {label}
              </ResponsiveNavLink>
            ))}
            <div className="mt-3 border-t border-slate-100 pt-3">
              <p className="px-3 text-sm font-semibold text-slate-800">{authUser?.name}</p>
              <p className="px-3 text-xs text-slate-500">{authUser?.email}</p>
              <ResponsiveNavLink to="/profile" onClick={() => setMobileOpen(false)}>
                Profile
              </ResponsiveNavLink>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-1 w-full px-3 py-2 text-left text-sm text-red-600"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </nav>

      {header && (
        <div className="border-b border-slate-200 bg-white">
          <div className="page-container !py-6">{header}</div>
        </div>
      )}

      <main>{children}</main>
    </div>
  );
}
