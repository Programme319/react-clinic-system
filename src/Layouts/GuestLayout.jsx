import { Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';
import './GuestLayout.css';

export default function GuestLayout({ children, title, subtitle }) {
  return (
    <div className="guest-layout">
      <aside className="guest-layout__hero">
        <div className="guest-layout__hero-bg" />
        <div className="guest-layout__hero-pattern" />

        <div className="guest-layout__hero-content">
          <Link to="/" className="guest-layout__brand">
            <div className="guest-layout__brand-icon">
              <Stethoscope size={22} />
            </div>
            <span className="guest-layout__brand-name">ClinicCare</span>
          </Link>
        </div>

        <div className="guest-layout__hero-main">
          <h2 className="guest-layout__hero-title">
            Healthcare management that feels effortless.
          </h2>
          <p className="guest-layout__hero-desc">
            Patient records, AI assistant, lab results, and prescriptions — organized for your whole clinic team.
          </p>
          <div className="guest-layout__stats">
            {[
              { n: '500+', l: 'Records managed' },
              { n: 'AI', l: 'Ollama powered' },
              { n: 'AR/EN', l: 'Bilingual' },
              { n: 'Secure', l: 'Cloud backed' },
            ].map((s) => (
              <div key={s.l} className="guest-layout__stat">
                <div className="guest-layout__stat-value">{s.n}</div>
                <div className="guest-layout__stat-label">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="guest-layout__hero-footer">© {new Date().getFullYear()} ClinicCare</p>
      </aside>

      <div className="guest-layout__form-side">
        <Link to="/" className="guest-layout__mobile-brand">
          <div className="guest-layout__brand-icon" style={{ background: 'var(--color-primary)', color: 'white', borderRadius: 'var(--radius-md)', width: '2.5rem', height: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Stethoscope size={20} />
          </div>
          <span className="guest-layout__brand-name" style={{ color: 'var(--color-text)' }}>ClinicCare</span>
        </Link>

        <div className="guest-layout__form-wrap">
          {(title || subtitle) && (
            <div className="guest-layout__form-header">
              {title && <h1 className="guest-layout__form-title">{title}</h1>}
              {subtitle && <p className="guest-layout__form-subtitle">{subtitle}</p>}
            </div>
          )}
          <div className="card guest-layout__form-card">{children}</div>
        </div>
      </div>
    </div>
  );
}
