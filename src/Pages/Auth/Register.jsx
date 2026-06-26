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
import '@/css/pages/auth.css';

const ROLES = ['Clinic Staff', 'Doctor', 'Pharmacist', 'Administrator'];

export default function Register() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    name: '', email: '', password: '', password_confirmation: '', role: 'Clinic Staff',
  });
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (key, value) => setData((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    document.title = 'Register — ClinicCare';
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
        options: { data: { name: data.name.trim(), role: data.role } },
      });
      if (error) throw error;

      if (authData.user && !authData.session) {
        setErrors({ general: 'Account created! Check your email to confirm, then sign in.' });
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
      <form onSubmit={submit} className="auth-form">
        {errors.general && <div className="alert alert-error">{errors.general}</div>}

        <div className="auth-form__row">
          <InputLabel htmlFor="name" value="Full name" />
          <TextInput id="name" value={data.name} className="input-field" isFocused onChange={(e) => handleChange('name', e.target.value)} required />
        </div>

        <div className="auth-form__row">
          <InputLabel htmlFor="email" value="Work email" />
          <TextInput id="email" type="email" value={data.email} className="input-field" onChange={(e) => handleChange('email', e.target.value)} required />
        </div>

        <div className="auth-form__row">
          <InputLabel htmlFor="role" value="Role" />
          <select id="role" value={data.role} onChange={(e) => handleChange('role', e.target.value)} className="auth-form__select">
            {ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
          </select>
        </div>

        <div className="auth-form__row">
          <InputLabel htmlFor="password" value="Password" />
          <TextInput id="password" type="password" value={data.password} className="input-field" onChange={(e) => handleChange('password', e.target.value)} required />
          <InputError message={errors.password} />
        </div>

        <div className="auth-form__row">
          <InputLabel htmlFor="password_confirmation" value="Confirm password" />
          <TextInput id="password_confirmation" type="password" value={data.password_confirmation} className="input-field" onChange={(e) => handleChange('password_confirmation', e.target.value)} required />
          <InputError message={errors.password_confirmation} />
        </div>

        <PrimaryButton className="btn-full" disabled={processing}>
          {processing ? 'Creating account…' : 'Create account'}
        </PrimaryButton>

        <p className="guest-layout__form-footer">
          Already registered? <Link to="/login" className="link-primary">Sign in</Link>
        </p>
      </form>
    </GuestLayout>
  );
}
