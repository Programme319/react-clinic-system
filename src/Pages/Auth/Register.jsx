import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import supabase from '@/lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Register() {
  const navigate = useNavigate();

  const [data, setData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (key, value) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    document.title = 'Register - Clinic System';
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});

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
        email: data.email,
        password: data.password,
        options: {
          data: { name: data.name },
        },
      });

      if (error) throw error;

      if (authData.user && !authData.session) {
        setErrors({
          email: 'Check your email to confirm your account before signing in.',
        });
        return;
      }

      navigate('/dashboard');
    } catch (error) {
      setErrors({ email: error.message || 'Registration failed. Please try again.' });
      setData((prev) => ({
        ...prev,
        password: '',
        password_confirmation: '',
      }));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <GuestLayout title="Create account" subtitle="Start managing your clinic today">
      <form onSubmit={submit} className="space-y-1">
        <div>
          <InputLabel htmlFor="name" value="Full name" />
          <TextInput
            id="name"
            name="name"
            value={data.name}
            className="mt-1 block w-full"
            autoComplete="name"
            isFocused={true}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
          <InputError message={errors.name} className="mt-2" />
        </div>

        <div className="mt-4">
          <InputLabel htmlFor="email" value="Email" />
          <TextInput
            id="email"
            type="email"
            name="email"
            value={data.email}
            className="mt-1 block w-full"
            autoComplete="username"
            onChange={(e) => handleChange('email', e.target.value)}
            required
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
            autoComplete="new-password"
            onChange={(e) => handleChange('password', e.target.value)}
            required
          />
          <InputError message={errors.password} className="mt-2" />
        </div>

        <div className="mt-4">
          <InputLabel htmlFor="password_confirmation" value="Confirm password" />
          <TextInput
            id="password_confirmation"
            type="password"
            name="password_confirmation"
            value={data.password_confirmation}
            className="mt-1 block w-full"
            autoComplete="new-password"
            onChange={(e) => handleChange('password_confirmation', e.target.value)}
            required
          />
          <InputError message={errors.password_confirmation} className="mt-2" />
        </div>

        <div className="mt-6 flex justify-end">
          <PrimaryButton disabled={processing}>
            {processing ? 'Creating account...' : 'Register'}
          </PrimaryButton>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-teal-600 hover:text-teal-800">
            Sign in
          </Link>
        </p>
      </form>
    </GuestLayout>
  );
}
