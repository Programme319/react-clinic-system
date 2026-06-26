import Dropdown from '@/Components/Dropdown';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Stethoscope, Users, Menu, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './AuthenticatedLayout.css';

export default function AuthenticatedLayout({ header, children }) {
  const { authUser, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', active: isActive('/dashboard') && !isActive('/patients') },
    { to: '/patients', label: 'Patients', active: isActive('/patients') },
  ];

  return (
    <div className="auth-layout">
      <nav className={`auth-layout__nav ${scrolled ? 'auth-layout__nav--scrolled' : ''}`}>
        <div className="auth-layout__nav-inner">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Link to="/dashboard" className="auth-layout__brand">
              <div className="auth-layout__brand-icon">
                <Stethoscope size={18} />
              </div>
              <span className="auth-layout__brand-text">ClinicCare</span>
            </Link>

            <div className="auth-layout__nav-links">
              {navItems.map(({ to, label, active }) => (
                <Link
                  key={to}
                  to={to}
                  className={`auth-layout__nav-link ${active ? 'auth-layout__nav-link--active' : ''}`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="auth-layout__user-area">
            <span className="auth-layout__role-badge">{authUser?.role}</span>
            <Dropdown>
              <Dropdown.Trigger>
                <button type="button" className="auth-layout__user-btn">
                  <span className="auth-layout__avatar">
                    {authUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                  <span className="auth-layout__user-name">{authUser?.name}</span>
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
            className="auth-layout__mobile-toggle"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="auth-layout__mobile-menu">
            {navItems.map(({ to, label, active }) => (
              <Link
                key={to}
                to={to}
                className={`auth-layout__mobile-link ${active ? 'auth-layout__mobile-link--active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            ))}
            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border-light)' }}>
              <p style={{ padding: '0 1rem', fontWeight: 600, fontSize: '0.875rem' }}>{authUser?.name}</p>
              <Link to="/profile" className="auth-layout__mobile-link" onClick={() => setMobileOpen(false)}>
                Profile
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="auth-layout__mobile-link"
                style={{ color: '#ef4444', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </nav>

      {header && (
        <div className="auth-layout__page-header">
          <div className="auth-layout__page-header-inner">{header}</div>
        </div>
      )}

      <main className="auth-layout__main">{children}</main>
    </div>
  );
}
