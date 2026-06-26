import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Link, useNavigate } from 'react-router-dom'; 
import { useState, useEffect } from 'react';
import axios from 'axios'; // Assuming you are using axios for API calls

export default function ForgotPassword({ status: initialStatus }) {
    // 1. Replaced useForm with standard useState hooks
    const [email, setEmail] = useState('');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState(initialStatus || '');

    // Optional: Document title management (replacing Inertia's <Head>)
    useEffect(() => {
        document.title = "Forgot Password";
    }, []);

    const submit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            // 2. Replaced Inertia post() and route() with a standard API endpoint URL
            const response = await axios.post('/api/password/email', { email });
            
            if (response.data.status) {
                setStatus(response.data.status);
            }
            setEmail('');
        } catch (error) {
            if (error.response && error.response.status === 422) {
                // Handle Laravel validation errors
                setErrors(error.response.data.errors);
            } else {
                console.error("An unexpected error occurred:", error);
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <GuestLayout>
            {/* Removed Inertia's <Head /> component */}

            <div className="mb-4 text-sm text-gray-600">
                Forgot your password? No problem. Just let us know your email
                address and we will email you a password reset link that will
                allow you to choose a new one.
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <TextInput
                    id="email"
                    type="email"
                    name="email"
                    value={email}
                    className="mt-1 block w-full"
                    isFocused={true}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <InputError message={errors.email?.[0]} className="mt-2" />

                <div className="mt-4 flex items-center justify-end">
                    <PrimaryButton className="ms-4" disabled={processing}>
                        Email Password Reset Link
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}