import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, Stethoscope } from 'lucide-react';
import './RoleShell.css';

export default function RoleShell({ roleTheme, roleLabel, navItems, title, children }) {
  const { authUser, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className={`role-shell role-shell--${roleTheme}`}>
      {sidebarOpen && (
        <div className="role-shell__overlay" onClick={() => setSidebarOpen(false)} aria-hidden />
      )}

      <aside className={`role-shell__sidebar ${sidebarOpen ? 'role-shell__sidebar--open' : ''}`}>
        <div className="role-shell__sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Stethoscope size={22} />
            <span style={{ fontWeight: 800, fontSize: '1.125rem' }}>ClinicCare</span>
          </div>
          <span className="role-shell__role-badge">{roleLabel}</span>
        </div>

        <nav className="role-shell__nav">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to || location.pathname.startsWith(`${to}/`);
            return (
              <Link
                key={to}
                to={to}
                className={`role-shell__nav-link ${active ? 'role-shell__nav-link--active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                {Icon && <Icon size={18} />}
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="role-shell__sidebar-footer">
          <p className="role-shell__user">{authUser?.name}</p>
          <p className="role-shell__user-email">{authUser?.email}</p>
          <button type="button" className="role-shell__logout" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </aside>

      <div className="role-shell__main">
        <header className="role-shell__topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              className="role-shell__mobile-toggle"
              onClick={() => setSidebarOpen((v) => !v)}
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <h1 className="role-shell__page-title">{title}</h1>
          </div>
          <span className="badge badge-primary">{roleLabel}</span>
        </header>
        <div className="role-shell__content">{children}</div>
      </div>
    </div>
  );
}
