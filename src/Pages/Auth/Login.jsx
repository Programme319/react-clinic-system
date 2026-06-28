import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Staff sign in — ClinicCare';
    if (location.state?.reason === 'unauthorized') {
      setError('Your session expired or this account is not authorized.');
    }
  }, [location.state]);

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
      setError(err.message || 'Sign in failed. Only staff accounts created by an administrator can access this system.');
      setPassword('');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <GuestLayout title="Staff sign in" subtitle="Authorized hospital staff only">
      <SupabaseSetupAlert />
      <form onSubmit={submit} className="auth-form">
        {error && <div className="alert alert-error">{error}</div>}

        <div className="alert alert-warning" style={{ fontSize: '0.8125rem' }}>
          Public registration is disabled. You must have an administrator-created account with an assigned role (Doctor, Nurse, Pharmacist, or Administrator).
        </div>

        <div className="auth-form__row">
          <InputLabel htmlFor="email" value="Staff email" />
          <TextInput
            id="email"
            type="email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            isFocused
            autoComplete="username"
          />
        </div>

        <div className="auth-form__row">
          <InputLabel htmlFor="password" value="Password" />
          <TextInput
            id="password"
            type="password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <label className="guest-layout__remember">
          <Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          Remember me on this device
        </label>

        <button type="submit" className="btn btn-primary btn-full" disabled={processing}>
          {processing ? 'Verifying…' : 'Sign in as staff'}
        </button>

        <p className="guest-layout__form-footer" style={{ fontSize: '0.8125rem' }}>
          Need access? Ask your hospital administrator to create your account.
        </p>
      </form>
    </GuestLayout>
  );
}
