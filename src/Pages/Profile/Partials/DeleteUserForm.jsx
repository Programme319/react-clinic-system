import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from 'react-hook-form';
import { useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setError,
        clearErrors,
    } = useForm({
        defaultValues: {
            password: '',
        },
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
        clearErrors();
        reset();
    };

    const deleteUser = async (data) => {
        try {
            await axios.delete('/api/profile', {
                data: { password: data.password },
            });
            
            // Redirect to login or home page after successful deletion
            navigate('/login');
        } catch (error) {
            if (error.response?.status === 422) {
                // Handle validation errors
                const errors = error.response.data.errors;
                if (errors.password) {
                    setError('password', {
                        type: 'manual',
                        message: errors.password[0],
                    });
                }
            } else {
                // Handle other errors
                setError('password', {
                    type: 'manual',
                    message: 'An error occurred. Please try again.',
                });
            }
            passwordInput.current?.focus();
        }
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Delete Account
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Once your account is deleted, all of its resources and data
                    will be permanently deleted. Before deleting your account,
                    please download any data or information that you wish to
                    retain.
                </p>
            </header>

            <DangerButton onClick={confirmUserDeletion}>
                Delete Account
            </DangerButton>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={handleSubmit(deleteUser)} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Are you sure you want to delete your account?
                    </h2>

                    <p className="mt-1 text-sm text-gray-600">
                        Once your account is deleted, all of its resources and
                        data will be permanently deleted. Please enter your
                        password to confirm you would like to permanently delete
                        your account.
                    </p>

                    <div className="mt-6">
                        <InputLabel
                            htmlFor="password"
                            value="Password"
                            className="sr-only"
                        />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            ref={(e) => {
                                register(e);
                                passwordInput.current = e;
                            }}
                            className="mt-1 block w-3/4"
                            isFocused
                            placeholder="Password"
                            disabled={isSubmitting}
                        />

                        <InputError
                            message={errors.password?.message}
                            className="mt-2"
                        />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton 
                            onClick={closeModal}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </SecondaryButton>

                        <DangerButton 
                            className="ms-3" 
                            disabled={isSubmitting}
                            type="submit"
                        >
                            {isSubmitting ? 'Deleting...' : 'Delete Account'}
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}