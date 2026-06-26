import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Link, useNavigate } from 'react-router-dom'; 
import { useState, useEffect } from 'react';
import axios from 'axios'; // standard API client

export default function ConfirmPassword() {
    const navigate = useNavigate();

    // 1. Replaced useForm hooks with standard react hooks
    const [password, setPassword] = useState('');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    // Synchronize page title 
    useEffect(() => {
        document.title = "Confirm Password";
    }, []);

    const submit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            // 2. Swapped to an absolute or relative backend API path
            await axios.post('/api/password/confirm', { password });
            
            // Redirect somewhere secure on success
            navigate('/dashboard'); 
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                console.error("An unexpected error occurred:", error);
            }
            
            // Replicating onFinish behavior: wipe the password input field on failure
            setPassword('');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <GuestLayout>
            {/* Removed Inertia's <Head /> */}

            <div className="mb-4 text-sm text-gray-600">
                This is a secure area of the application. Please confirm your
                password before continuing.
            </div>

            <form onSubmit={submit}>
                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={password}
                        className="mt-1 block w-full"
                        isFocused={true}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <InputError message={errors.password?.[0]} className="mt-2" />
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <PrimaryButton className="ms-4" disabled={processing}>
                        Confirm
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}