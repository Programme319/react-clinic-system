import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SupabaseSetupAlert from '@/Components/SupabaseSetupAlert';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { formatAuthError } from '@/lib/authErrors';
import supabase from '@/lib/supabase';
import { isSupabaseConfigured } from '@/lib/supabaseConfig';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const ROLES = ['Clinic Staff', 'Doctor', 'Pharmacist', 'Administrator'];

export default function Register() {
  const navigate = useNavigate();

  const [data, setData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'Clinic Staff',
  });
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (key, value) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    document.title = 'Register — ClinicCare';
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

    if (data.password !== data.password_confirmation) {
      setErrors({ password_confirmation: 'Passwords do not match.' });
      setProcessing(false);
      return;
    }

    if (data.password.length < 6) {
      setErrors({ password: 'Password must be at least 6 characters.' });
      setProcessing(false);
      return;
    }

    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email.trim(),
        password: data.password,
        options: {
          data: { name: data.name.trim(), role: data.role },
        },
      });

      if (error) throw error;

      if (authData.user && !authData.session) {
        setErrors({
          general:
            'Account created! Check your email to confirm, then sign in. (Or disable email confirmation in Supabase → Authentication → Email.)',
        });
        return;
      }

      navigate('/dashboard');
    } catch (error) {
      setErrors({ general: formatAuthError(error) });
      setData((prev) => ({ ...prev, password: '', password_confirmation: '' }));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <GuestLayout title="Create your account" subtitle="Join ClinicCare in under a minute">
      <SupabaseSetupAlert />

      <form onSubmit={submit} className="space-y-5">
        {errors.general && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errors.general}
          </div>
        )}

        <div>
          <InputLabel htmlFor="name" value="Full name" />
          <TextInput
            id="name"
            value={data.name}
            className="input-field"
            autoComplete="name"
            isFocused
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
        </div>

        <div>
          <InputLabel htmlFor="email" value="Work email" />
          <TextInput
            id="email"
            type="email"
            value={data.email}
            className="input-field"
            autoComplete="username"
            onChange={(e) => handleChange('email', e.target.value)}
            required
          />
        </div>

        <div>
          <InputLabel htmlFor="role" value="Role" />
          <select
            id="role"
            value={data.role}
            onChange={(e) => handleChange('role', e.target.value)}
            className="input-field"
          >
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        <div>
          <InputLabel htmlFor="password" value="Password" />
          <TextInput
            id="password"
            type="password"
            value={data.password}
            className="input-field"
            autoComplete="new-password"
            onChange={(e) => handleChange('password', e.target.value)}
            required
          />
          <InputError message={errors.password} className="mt-2" />
        </div>

        <div>
          <InputLabel htmlFor="password_confirmation" value="Confirm password" />
          <TextInput
            id="password_confirmation"
            type="password"
            value={data.password_confirmation}
            className="input-field"
            autoComplete="new-password"
            onChange={(e) => handleChange('password_confirmation', e.target.value)}
            required
          />
          <InputError message={errors.password_confirmation} className="mt-2" />
        </div>

        <PrimaryButton className="w-full justify-center py-3" disabled={processing}>
          {processing ? 'Creating account…' : 'Create account'}
        </PrimaryButton>

        <p className="text-center text-sm text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-teal-600 hover:text-teal-700">
            Sign in
          </Link>
        </p>
      </form>
    </GuestLayout>
  );
}
