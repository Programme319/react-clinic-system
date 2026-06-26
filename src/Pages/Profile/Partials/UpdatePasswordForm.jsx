import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { useRef, useState } from 'react';
import axios from 'axios';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();
    const [recentlySuccessful, setRecentlySuccessful] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
        reset,
        watch,
    } = useForm({
        defaultValues: {
            current_password: '',
            password: '',
            password_confirmation: '',
        },
    });

    const onSubmit = async (data) => {
        setRecentlySuccessful(false);

        try {
            await axios.put('/api/password', data);
            
            setRecentlySuccessful(true);
            reset();
            
            // Hide success message after 3 seconds
            setTimeout(() => setRecentlySuccessful(false), 3000);
        } catch (error) {
            if (error.response?.status === 422) {
                const validationErrors = error.response.data.errors;
                
                Object.keys(validationErrors).forEach((key) => {
                    setError(key, {
                        type: 'manual',
                        message: validationErrors[key][0],
                    });
                });

                if (validationErrors.password) {
                    passwordInput.current?.focus();
                } else if (validationErrors.current_password) {
                    currentPasswordInput.current?.focus();
                }
            } else if (error.response?.status === 401) {
                setError('current_password', {
                    type: 'manual',
                    message: 'Current password is incorrect.'
                });
                currentPasswordInput.current?.focus();
            }
        }
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Update Password
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Ensure your account is using a long, random password to stay
                    secure.
                </p>
            </header>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
                <div>
                    <InputLabel
                        htmlFor="current_password"
                        value="Current Password"
                    />

                    <TextInput
                        id="current_password"
                        ref={currentPasswordInput}
                        {...register('current_password')}
                        type="password"
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        disabled={isSubmitting}
                    />

                    <InputError
                        message={errors.current_password?.message}
                        className="mt-2"
                    />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="New Password" />

                    <TextInput
                        id="password"
                        ref={passwordInput}
                        {...register('password')}
                        type="password"
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        disabled={isSubmitting}
                    />

                    <InputError message={errors.password?.message} className="mt-2" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                    />

                    <TextInput
                        id="password_confirmation"
                        {...register('password_confirmation')}
                        type="password"
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        disabled={isSubmitting}
                    />

                    <InputError
                        message={errors.password_confirmation?.message}
                        className="mt-2"
                    />
                </div>

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
                        <p className="text-sm text-gray-600">
                            Saved.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}