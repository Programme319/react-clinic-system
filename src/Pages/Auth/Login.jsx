import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SupabaseSetupAlert from '@/Components/SupabaseSetupAlert';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { formatAuthError } from '@/lib/authErrors';
import supabase from '@/lib/supabase';
import { isSupabaseConfigured } from '@/lib/supabaseConfig';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import '@/css/pages/auth.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [data, setDataState] = useState({ email: '', password: '', remember: false });

  const setData = (key, value) => setDataState((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    document.title = 'Sign in — ClinicCare';
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});

    if (!isSupabaseConfigured || !supabase) {
      setErrors({ general: 'Supabase is not configured.' });
      setProcessing(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email.trim(),
        password: data.password,
      });
      if (error) throw error;
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (err) {
      setErrors({ general: formatAuthError(err) });
      setData('password', '');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <GuestLayout title="Welcome back" subtitle="Sign in to manage your clinic">
      <SupabaseSetupAlert />
      <form onSubmit={submit} className="auth-form">
        {errors.general && <div className="alert alert-error">{errors.general}</div>}

        <div className="auth-form__row">
          <InputLabel htmlFor="email" value="Email address" />
          <TextInput
            id="email"
            type="email"
            value={data.email}
            className="input-field"
            autoComplete="username"
            isFocused
            onChange={(e) => setData('email', e.target.value)}
          />
          <InputError message={errors.email} />
        </div>

        <div className="auth-form__row">
          <InputLabel htmlFor="password" value="Password" />
          <TextInput
            id="password"
            type="password"
            value={data.password}
            className="input-field"
            autoComplete="current-password"
            onChange={(e) => setData('password', e.target.value)}
          />
        </div>

        <div className="guest-layout__form-actions">
          <label className="guest-layout__remember">
            <Checkbox checked={data.remember} onChange={(e) => setData('remember', e.target.checked)} />
            Remember me
          </label>
          <Link to="/forgot-password" className="link-primary">Forgot password?</Link>
        </div>

        <PrimaryButton className="btn-full" disabled={processing}>
          {processing ? 'Signing in…' : 'Sign in'}
        </PrimaryButton>

        <p className="guest-layout__form-footer">
          No account? <Link to="/register" className="link-primary">Create one</Link>
        </p>
      </form>
    </GuestLayout>
  );
}
