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
  const { authUser, staffProfile } = useAuth();
  const [recentlySuccessful, setRecentlySuccessful] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    defaultValues: {
      name: staffProfile?.name || authUser?.name || '',
      email: authUser?.email || '',
    },
  });

  const onSubmit = async (data) => {
    setRecentlySuccessful(false);
    if (!supabase || !authUser) return;

    try {
      const { error: profileError } = await supabase
        .from('users')
        .update({ name: data.name })
        .eq('id', authUser.id);

      if (profileError) throw profileError;

      if (data.email !== authUser.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email: data.email });
        if (emailError) throw emailError;
      }

      setRecentlySuccessful(true);
      setTimeout(() => setRecentlySuccessful(false), 3000);
    } catch (error) {
      setError('general', {
        type: 'manual',
        message: error.message || 'An error occurred.',
      });
    }
  };

  return (
    <section className={className}>
      <header>
        <h2 className="text-lg font-bold text-slate-900">Profile</h2>
        <p className="mt-1 text-sm text-slate-500">Update your name and email.</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
        <div>
          <InputLabel htmlFor="name" value="Name" />
          <TextInput id="name" className="input-field" {...register('name', { required: true })} />
          <InputError message={errors.name?.message} className="mt-2" />
        </div>

        <div>
          <InputLabel htmlFor="email" value="Email" />
          <TextInput
            id="email"
            type="email"
            className="input-field"
            {...register('email', { required: true })}
          />
          <InputError message={errors.email?.message} className="mt-2" />
        </div>

        {errors.general && (
          <p className="text-sm text-red-600">{errors.general.message}</p>
        )}

        <div className="flex items-center gap-4">
          <PrimaryButton disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save changes'}
          </PrimaryButton>
          <Transition show={recentlySuccessful} enter="transition" enterFrom="opacity-0" leave="transition" leaveTo="opacity-0">
            <p className="text-sm text-teal-600">Saved!</p>
          </Transition>
        </div>
      </form>
    </section>
  );
}
