import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import supabase from '@/lib/supabase';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Login({ status, canResetPassword = true }) {
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
    document.title = 'Log in - Clinic System';
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      const redirectTo = location.state?.from?.pathname || '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setErrors({
        email: err.message || 'Invalid email or password.',
      });
      setData('password', '');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <GuestLayout title="Welcome back" subtitle="Sign in to your clinic account">
      {status && (
        <div className="mb-4 text-sm font-medium text-green-600">{status}</div>
      )}

      <form onSubmit={submit} className="space-y-1">
        <div>
          <InputLabel htmlFor="email" value="Email" />
          <TextInput
            id="email"
            type="email"
            name="email"
            value={data.email}
            className="mt-1 block w-full"
            autoComplete="username"
            isFocused={true}
            onChange={(e) => setData('email', e.target.value)}
          />
          <InputError message={errors.email} className="mt-2" />
        </div>

        <div className="mt-4">
          <InputLabel htmlFor="password" value="Password" />
          <TextInput
            id="password"
            type="password"
            name="password"
            value={data.password}
            className="mt-1 block w-full"
            autoComplete="current-password"
            onChange={(e) => setData('password', e.target.value)}
          />
          <InputError message={errors.password} className="mt-2" />
        </div>

        <div className="mt-4 block">
          <label className="flex items-center">
            <Checkbox
              name="remember"
              checked={data.remember}
              onChange={(e) => setData('remember', e.target.checked)}
            />
            <span className="ms-2 text-sm text-gray-600">Remember me</span>
          </label>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          {canResetPassword && (
            <Link
              to="/forgot-password"
              className="text-sm text-teal-600 hover:text-teal-800"
            >
              Forgot password?
            </Link>
          )}

          <PrimaryButton disabled={processing}>
            {processing ? 'Signing in...' : 'Log in'}
          </PrimaryButton>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-teal-600 hover:text-teal-800">
            Register
          </Link>
        </p>
      </form>
    </GuestLayout>
  );
}
