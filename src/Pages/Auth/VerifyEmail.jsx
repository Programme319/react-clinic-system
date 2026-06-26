import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Link, useNavigate } from 'react-router-dom'; 
import { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios for standalone API calls

export default function VerifyEmail({ status: initialStatus }) {
    const [status, setStatus] = useState(initialStatus || '');
    const [processing, setProcessing] = useState(false);
    const navigate = useNavigate();

    // Set document title natively
    useEffect(() => {
        document.title = "Email Verification - Clinic System";
    }, []);

    // Handle Resend Verification Email Form
    const submit = async (e) => {
        e.preventDefault();
        setProcessing(true);

        try {
            // Replace with your true backend URL endpoint
            await axios.post('http://localhost:8000/api/verification-notification');
            setStatus('verification-link-sent');
        } catch (error) {
            console.error('Error resending link:', error);
        } finally {
            setProcessing(false);
        }
    };

    // Handle Standalone Log Out Action
    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8000/api/logout');
            localStorage.removeItem('token'); // Clear auth token if you use one
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <GuestLayout>
            <div className="mb-4 text-sm text-gray-600">
                Thanks for signing up! Before getting started, could you verify
                your email address by clicking on the link we just emailed to
                you? If you didn't receive the email, we will gladly send you
                another.
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    A new verification link has been sent to the email address
                    you provided during registration.
                </div>
            )}

            <form onSubmit={submit}>
                <div className="mt-4 flex items-center justify-between">
                    <PrimaryButton disabled={processing}>
                        Resend Verification Email
                    </PrimaryButton>

                    {/* Converted to standard button style triggering local logout logic */}
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Log Out
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}