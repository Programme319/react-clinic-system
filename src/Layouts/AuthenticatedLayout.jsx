import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
  const { authUser, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex shrink-0 items-center gap-2">
                <Link to="/dashboard" className="flex items-center gap-2">
                  <ApplicationLogo className="block h-8 w-auto fill-current text-teal-600" />
                  <span className="hidden font-bold text-gray-800 sm:inline">ClinicCare</span>
                </Link>
              </div>

              <div className="hidden space-x-1 sm:-my-px sm:ms-8 sm:flex">
                <NavLink to="/dashboard" active={isActive('/dashboard') && !isActive('/patients')}>
                  Dashboard
                </NavLink>
                <NavLink to="/patients" active={isActive('/patients')}>
                  Patients
                </NavLink>
              </div>
            </div>

            <div className="hidden sm:ms-6 sm:flex sm:items-center">
              <div className="relative ms-3">
                <Dropdown>
                  <Dropdown.Trigger>
                    <span className="inline-flex rounded-md">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                      >
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700">
                          {authUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                        {authUser?.name}
                        <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </span>
                  </Dropdown.Trigger>

                  <Dropdown.Content>
                    <Dropdown.Link to="/profile">Profile</Dropdown.Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full px-4 py-2 text-start text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Log Out
                    </button>
                  </Dropdown.Content>
                </Dropdown>
              </div>
            </div>

            <div className="-me-2 flex items-center sm:hidden">
              <button
                onClick={() => setShowingNavigationDropdown((prev) => !prev)}
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
              >
                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  {!showingNavigationDropdown ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {showingNavigationDropdown && (
          <div className="border-t border-gray-200 sm:hidden">
            <div className="space-y-1 pb-3 pt-2">
              <ResponsiveNavLink to="/dashboard" active={isActive('/dashboard') && !isActive('/patients')}>
                Dashboard
              </ResponsiveNavLink>
              <ResponsiveNavLink to="/patients" active={isActive('/patients')}>
                Patients
              </ResponsiveNavLink>
            </div>

            <div className="border-t border-gray-200 pb-3 pt-4">
              <div className="px-4">
                <div className="text-base font-medium text-gray-800">{authUser?.name}</div>
                <div className="text-sm text-gray-500">{authUser?.email}</div>
              </div>
              <div className="mt-3 space-y-1">
                <ResponsiveNavLink to="/profile">Profile</ResponsiveNavLink>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full border-l-4 border-transparent py-2 pe-4 ps-3 text-base font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {header && (
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{header}</div>
        </header>
      )}

      <main>{children}</main>
    </div>
  );
}
