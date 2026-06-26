import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useAuth } from '@/contexts/AuthContext';
import supabase from '@/lib/supabase';
import { Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { useState } from 'react';

export default function UpdateProfileInformation({ className = '' }) {
  const { authUser, profile } = useAuth();
  const [recentlySuccessful, setRecentlySuccessful] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    defaultValues: {
      name: profile?.name || authUser?.name || '',
      email: authUser?.email || '',
    },
  });

  const onSubmit = async (data) => {
    setRecentlySuccessful(false);

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ name: data.name })
        .eq('id', authUser.id);

      if (profileError) throw profileError;

      if (data.email !== authUser.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: data.email,
        });
        if (emailError) throw emailError;
      }

      setRecentlySuccessful(true);
      setTimeout(() => setRecentlySuccessful(false), 3000);
    } catch (error) {
      setError('general', {
        type: 'manual',
        message: error.message || 'An error occurred. Please try again.',
      });
    }
  };

  return (
    <section className={className}>
      <header>
        <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
        <p className="mt-1 text-sm text-gray-600">
          Update your account&apos;s profile information and email address.
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
        <div>
          <InputLabel htmlFor="name" value="Name" />
          <TextInput
            id="name"
            className="mt-1 block w-full"
            {...register('name', { required: 'Name is required' })}
            required
            isFocused
            autoComplete="name"
            disabled={isSubmitting}
          />
          <InputError className="mt-2" message={errors.name?.message} />
        </div>

        <div>
          <InputLabel htmlFor="email" value="Email" />
          <TextInput
            id="email"
            type="email"
            className="mt-1 block w-full"
            {...register('email', { required: 'Email is required' })}
            required
            autoComplete="username"
            disabled={isSubmitting}
          />
          <InputError className="mt-2" message={errors.email?.message} />
        </div>

        {errors.general && (
          <div className="text-sm text-red-600">{errors.general.message}</div>
        )}

        <div className="flex items-center gap-4">
          <PrimaryButton disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </PrimaryButton>

          <Transition
            show={recentlySuccessful}
            enter="transition ease-in-out"
            enterFrom="opacity-0"
            leave="transition ease-in-out"
            leaveTo="opacity-0"
          >
            <p className="text-sm text-gray-600">Saved.</p>
          </Transition>
        </div>
      </form>
    </section>
  );
}
