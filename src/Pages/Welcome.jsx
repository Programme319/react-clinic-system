import { Link, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardPath, isAllowedRole } from '@/lib/permissions';
import { ArrowRight, Stethoscope, Shield, Users, FileText, Clock, HeartPulse, CheckCircle2 } from 'lucide-react';
import '@/css/pages/welcome.css';

export default function Welcome() {
  const { authUser, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.title = 'ClinicCare — Smart Clinic Management';
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!loading && authUser && isAllowedRole(authUser.role)) {
    return <Navigate to={getDashboardPath(authUser.role)} replace />;
  }

  const features = [
    { icon: Users, title: 'Patient Management', desc: 'Register patients, track visits, and access full medical histories in seconds.' },
    { icon: FileText, title: 'Medical Records', desc: 'Store lab tests, medications, and prescriptions — printable and bilingual.' },
    { icon: Shield, title: 'AI Health Assistant', desc: 'Ollama-powered chatbot with patient context for smarter clinic support.' },
  ];

  return (
    <div className="welcome">
      <nav className={`welcome__nav ${scrolled ? 'welcome__nav--solid' : ''}`}>
        <div className="welcome__nav-inner">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="auth-layout__brand-icon"><Stethoscope size={18} /></div>
            <span style={{ fontWeight: 800, fontSize: '1.125rem' }}>ClinicCare</span>
          </Link>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link to="/login" className="btn btn-primary btn-sm">Staff sign in</Link>
          </div>
        </div>
      </nav>

      <section className="welcome__hero">
        <div className="welcome__hero-bg" />
        <div className="welcome__hero-inner">
          <div className="welcome__badge"><HeartPulse size={16} /> Smart Clinic Management</div>
          <h1 className="welcome__title">
            Manage your clinic{' '}
            <span className="welcome__title-accent">with confidence</span>
          </h1>
          <p className="welcome__desc">
            ClinicCare helps doctors and staff organize patient records, AI-assisted support, and prescriptions — all in one secure platform.
          </p>
          <div className="welcome__cta">
            <Link to="/login" className="btn btn-primary btn-lg">
              Staff sign in <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="welcome__preview">
        <div className="welcome__preview-card card">
          <div style={{ padding: '0.75rem 1rem', background: 'var(--color-bg-muted)', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '0.375rem' }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#f87171' }} />
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#fbbf24' }} />
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#34d399' }} />
          </div>
          <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'var(--color-primary-light)', borderRadius: 'var(--radius-md)' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600 }}>Total Patients</p>
              <p style={{ fontSize: '2rem', fontWeight: 800, margin: '0.25rem 0 0' }}>128</p>
            </div>
            <div className="skeleton" style={{ height: '5rem' }} />
          </div>
        </div>
      </section>

      <section className="welcome__features">
        <div className="welcome__features-inner">
          <h2 className="welcome__section-title">Everything your clinic needs</h2>
          <p className="welcome__section-desc">Built for real clinics — from patient intake to AI-powered assistance.</p>
          <div className="welcome__feature-grid">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="welcome__feature-card">
                <div className="welcome__feature-icon"><Icon size={22} /></div>
                <h3 className="welcome__feature-title">{title}</h3>
                <p className="welcome__feature-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="welcome__stats">
        <div className="welcome__stats-grid">
          {[
            { value: '100%', label: 'Cloud Secure', icon: Shield },
            { value: '24/7', label: 'Access Anywhere', icon: Clock },
            { value: 'AI', label: 'Ollama Powered', icon: HeartPulse },
            { value: 'Secure', label: 'Staff Access Only', icon: CheckCircle2 },
          ].map(({ value, label, icon: Icon }) => (
            <div key={label} className="welcome__stat-item">
              <div className="welcome__stat-icon"><Icon size={16} /></div>
              <div className="welcome__stat-value">{value}</div>
              <div className="welcome__stat-label">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="welcome__cta-section">
        <h2>Ready to modernize your clinic?</h2>
        <p>Sign in with your administrator-assigned staff account to access your dashboard.</p>
        <Link to="/login" className="btn btn-primary btn-lg">
          Staff sign in <ArrowRight size={18} />
        </Link>
      </section>

      <footer className="welcome__footer">
        <div className="welcome__footer-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Stethoscope size={18} style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontWeight: 700 }}>ClinicCare</span>
          </div>
          <p className="welcome__footer-copy">© {new Date().getFullYear()} ClinicCare</p>
          <div className="welcome__footer-links">
            <Link to="/login">Staff sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
