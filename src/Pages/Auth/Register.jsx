import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Link, useNavigate } from 'react-router-dom'; 
import { useState, useEffect } from 'react';
import axios from 'axios'; // Ensure axios or your chosen API client is imported

export default function Register() {
    const navigate = useNavigate();

    // 1. Replaced useForm state management with standard individual/grouped useState
    const [data, setData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    // Helper to handle change events cleanly for grouped state
    const handleChange = (key, value) => {
        setData(prevData => ({
            ...prevData,
            [key]: value
        }));
    };

    // Document title management replacing Inertia's <Head>
    useEffect(() => {
        document.title = "Register";
    }, []);

    const submit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            // 2. Replaced post(route('register')) with a standard API endpoint
            const response = await axios.post('/api/register', data);
            
            // On successful registration, clear form and redirect
            setData({ name: '', email: '', password: '', password_confirmation: '' });
            navigate('/dashboard'); // Update to your post-register destination path
        } catch (error) {
            // Handle validation errors from Laravel backend API
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                console.error("An unexpected error occurred during registration:", error);
            }
            
            // Replicating onFinish: Reset password fields on error or request finalization
            setData(prevData => ({
                ...prevData,
                password: '',
                password_confirmation: ''
            }));
        } finally {
            setProcessing(false);
        }
    };

    return (
        <GuestLayout>
            {/* Removed Inertia's <Head /> component */}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="name" value="Name" />

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

                    <InputError message={errors.name?.[0]} className="mt-2" />
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

                    <InputError message={errors.email?.[0]} className="mt-2" />
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

                    <InputError message={errors.password?.[0]} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                    />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) =>
                            handleChange('password_confirmation', e.target.value)
                        }
                        required
                    />

                    <InputError
                        message={errors.password_confirmation?.[0]}
                        className="mt-2"
                    />
                </div>

                <div className="mt-4 flex items-center justify-end">
                    {/* 3. Replaced route('login') inside href with a standard React Router link 'to' prop */}
                    <Link
                        to="/login"
                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Already registered?
                    </Link>

                    <PrimaryButton className="ms-4" disabled={processing}>
                        Register
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}