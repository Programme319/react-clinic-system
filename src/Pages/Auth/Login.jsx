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

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  const [data, setDataState] = useState({
    email: '',
    password: '',
    remember: false,
  });

  const setData = (key, value) => {
    setDataState((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    document.title = 'Sign in — ClinicCare';
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});

    if (!isSupabaseConfigured || !supabase) {
      setErrors({ general: 'Supabase is not configured. See the alert above.' });
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

      <form onSubmit={submit} className="space-y-5">
        {errors.general && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errors.general}
          </div>
        )}

        <div>
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
          <InputError message={errors.email} className="mt-2" />
        </div>

        <div>
          <InputLabel htmlFor="password" value="Password" />
          <TextInput
            id="password"
            type="password"
            value={data.password}
            className="input-field"
            autoComplete="current-password"
            onChange={(e) => setData('password', e.target.value)}
          />
          <InputError message={errors.password} className="mt-2" />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2">
            <Checkbox
              checked={data.remember}
              onChange={(e) => setData('remember', e.target.checked)}
            />
            <span className="text-sm text-slate-600">Remember me</span>
          </label>
          <Link to="/forgot-password" className="text-sm font-medium text-teal-600 hover:text-teal-700">
            Forgot password?
          </Link>
        </div>

        <PrimaryButton className="w-full justify-center py-3" disabled={processing}>
          {processing ? 'Signing in…' : 'Sign in'}
        </PrimaryButton>

        <p className="text-center text-sm text-slate-500">
          No account?{' '}
          <Link to="/register" className="font-semibold text-teal-600 hover:text-teal-700">
            Create one
          </Link>
        </p>
      </form>
    </GuestLayout>
  );
}
