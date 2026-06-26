import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import axios from 'axios';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const navigate = useNavigate();
    const [recentlySuccessful, setRecentlySuccessful] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState(status);

    // Get user data from props or context
    // You'll need to pass user data as a prop or use a context
    // For now, I'll assume user is passed as a prop or you can get it from your auth context
    const user = JSON.parse(localStorage.getItem('user')) || { name: '', email: '' };

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
        setValue,
        watch,
    } = useForm({
        defaultValues: {
            name: user.name || '',
            email: user.email || '',
        },
    });

    const onSubmit = async (data) => {
        setRecentlySuccessful(false);

        try {
            await axios.put('/api/profile', data);
            
            // Update local user data
            const updatedUser = { ...user, ...data };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            setRecentlySuccessful(true);
            
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
            } else {
                setError('general', {
                    type: 'manual',
                    message: 'An error occurred. Please try again.'
                });
            }
        }
    };

    const handleResendVerification = async () => {
        try {
            await axios.post('/api/email/verification-notification');
            setVerificationStatus('verification-link-sent');
        } catch (error) {
            console.error('Failed to resend verification email', error);
        }
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Profile Information
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Update your account's profile information and email address.
                </p>
            </header>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="name" value="Name" />

                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        {...register('name', {
                            required: 'Name is required',
                            minLength: {
                                value: 2,
                                message: 'Name must be at least 2 characters'
                            }
                        })}
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
                        {...register('email', {
                            required: 'Email is required',
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Invalid email address'
                            }
                        })}
                        required
                        autoComplete="username"
                        disabled={isSubmitting}
                    />

                    <InputError className="mt-2" message={errors.email?.message} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800">
                            Your email address is unverified.
                            <button
                                onClick={handleResendVerification}
                                className="ml-2 rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Click here to re-send the verification email.
                            </button>
                        </p>

                        {verificationStatus === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                A new verification link has been sent to your
                                email address.
                            </div>
                        )}
                    </div>
                )}

                {errors.general && (
                    <div className="text-sm text-red-600">
                        {errors.general.message}
                    </div>
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
                        <p className="text-sm text-gray-600">
                            Saved.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}