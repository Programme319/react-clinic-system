import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Checkbox from '@/Components/Checkbox';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import SupabaseSetupAlert from '@/Components/SupabaseSetupAlert';
import GuestLayout from '@/Layouts/GuestLayout';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardPath } from '@/lib/permissions';
import { isSupabaseConfigured } from '@/lib/supabaseConfig';
import '@/css/pages/auth.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, authUser, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Sign in — ClinicCare';
    if (!loading && authUser) {
      navigate(getDashboardPath(authUser.role), { replace: true });
    }
  }, [authUser, loading, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    if (!isSupabaseConfigured) {
      setError('Supabase is not configured.');
      setProcessing(false);
      return;
    }

    try {
      const user = await login(email, password);
      const redirect = location.state?.from?.pathname || getDashboardPath(user.role);
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
      setPassword('');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <GuestLayout title="Hospital sign in" subtitle="You will be routed to your role dashboard">
      <SupabaseSetupAlert />
      <form onSubmit={submit} className="auth-form">
        {error && <div className="alert alert-error">{error}</div>}

        <div className="auth-form__row">
          <InputLabel htmlFor="email" value="Email" />
          <TextInput id="email" type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} required isFocused />
        </div>

        <div className="auth-form__row">
          <InputLabel htmlFor="password" value="Password" />
          <TextInput id="password" type="password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        <label className="guest-layout__remember">
          <Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          Remember me
        </label>

        <button type="submit" className="btn btn-primary btn-full" disabled={processing}>
          {processing ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="guest-layout__form-footer" style={{ fontSize: '0.8125rem' }}>
          Accounts are created by an Administrator. Contact your admin if you need access.
        </p>
      </form>
    </GuestLayout>
  );
}
