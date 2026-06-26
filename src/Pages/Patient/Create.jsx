import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function CreatePatient(props) {
    const navigate = useNavigate();

    // 1. Replaced Inertia useForm with standard React useState hooks
    const [data, setData] = useState({
        full_name: '',
        national_id: '',
        age: '',
        complaint: '',
        diagnosis_text: '',
        doctor_name: '',
        pharmacist_name: '',
        clinic_code: '',
        tests: [{ test_code: '', test_name: '', test_result: '' }],
        medications: [{ med_code: '', med_name: '', dosage: '' }],
    });
    
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    // Synchronize page title without Inertia's <Head>
    useEffect(() => {
        document.title = "نموذج بيانات المريض";
    }, []);

    // Clean structural state setter for core form values
    const handleFieldChange = (field, value) => {
        setData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // 2. Dynamic row operations mapped over the standard state array
    const addRow = (type) => {
        const newItem = type === 'tests' 
            ? { test_code: '', test_name: '', test_result: '' }
            : { med_code: '', med_name: '', dosage: '' };
            
        setData(prev => ({
            ...prev,
            [type]: [...prev[type], newItem]
        }));
    };

    const handleDynamicChange = (type, index, field, value) => {
        setData(prev => {
            const list = [...prev[type]];
            list[index] = { ...list[index], [field]: value };
            return { ...prev, [type]: list };
        });
    };

    const submit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            // 3. Post data over standard decoupled REST API endpoints
            await axios.post('/api/patients', data);
            navigate('/patients'); // Redirect to dashboard or list on success
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                console.error("Failed to submit patient document:", error);
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AuthenticatedLayout user={props.auth.user}>
            <div className="py-12 bg-gray-100 min-h-screen">
                <form
                    onSubmit={submit}
                    className="max-w-6xl mx-auto space-y-8 p-8 bg-white rounded-lg shadow-lg border border-gray-200"
                >
                    {/* Page Header and Watermark */}
                    <div className="relative text-center border-b-2 border-cyan-600 pb-6 mb-6">
                        <h2 className="text-3xl font-bold text-gray-800">
                            البيانات الأساسية
                        </h2>
                        <div className="absolute top-0 right-0 left-0 bottom-0 flex items-center justify-center opacity-10 pointer-events-none">
                            <span className="text-9xl font-extrabold text-gray-400 transform -rotate-15">
                                Nestlé Cerelac
                            </span>
                        </div>
                    </div>

                    {/* Section 1: البيانات الأساسية (Basic Info) */}
                    <div className="p-6 border border-gray-300 rounded-lg bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-lg font-medium text-gray-700">
                                    اسم المريض (Patient Name)
                                </label>
                                <input
                                    type="text"
                                    className="w-full mt-1 px-4 py-2 border border-gray-400 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                                    value={data.full_name}
                                    onChange={(e) => handleFieldChange("full_name", e.target.value)}
                                />
                                {errors.full_name && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.full_name?.[0] || errors.full_name}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-lg font-medium text-gray-700">
                                    الرقم القومي (National ID)
                                </label>
                                <input
                                    type="text"
                                    maxLength="14"
                                    className="w-full mt-1 px-4 py-2 border border-gray-400 rounded-md"
                                    value={data.national_id}
                                    onChange={(e) => handleFieldChange("national_id", e.target.value)}
                                />
                                {errors.national_id && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.national_id?.[0] || errors.national_id}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-lg font-medium text-gray-700">
                                    العمر (Age)
                                </label>
                                <input
                                    type="number"
                                    className="w-full mt-1 px-4 py-2 border border-gray-400 rounded-md"
                                    value={data.age}
                                    onChange={(e) => handleFieldChange("age", e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="mt-6">
                            <label className="block text-lg font-medium text-gray-700">
                                شكوى المريض (Patient Complaint)
                            </label>
                            <textarea
                                className="w-full mt-1 px-4 py-2 border border-gray-400 rounded-md h-24"
                                value={data.complaint}
                                onChange={(e) => handleFieldChange("complaint", e.target.value)}
                            ></textarea>
                        </div>
                    </div>

                    {/* Section 2: التشخيص الطبي (Medical Diagnosis) */}
                    <div className="p-6 border border-gray-300 rounded-lg bg-gray-50">
                        <label className="block text-xl font-bold text-cyan-600 mb-3 text-center">
                            التشخيص الطبي (Medical Diagnosis)
                        </label>
                        <textarea
                            className="w-full px-4 py-2 border border-gray-400 rounded-md h-32 text-lg"
                            value={data.diagnosis_text}
                            onChange={(e) => handleFieldChange("diagnosis_text", e.target.value)}
                            placeholder="اكتب التشخيص هنا..."
                        ></textarea>
                        <div className="flex justify-center mt-4">
                            <button
                                type="button"
                                className="px-5 py-2 bg-gray-300 rounded text-sm hover:bg-gray-400 transition"
                            >
                                تثبيت التشخيص
                            </button>
                        </div>
                    </div>

                    {/* Section 3: الفحوصات والتحاليل (Labs & Investigations) */}
                    <div className="p-6 border border-gray-300 rounded-lg bg-gray-50">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">
                            الفحوصات والتحاليل (Investigations)
                        </h3>
                        <div className="border border-gray-400 rounded overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-cyan-100">
                                        <th className="p-3 border-b border-gray-400 font-semibold text-gray-800">
                                            كود الفحص (Test Code)
                                        </th>
                                        <th className="p-3 border-b border-gray-400 font-semibold text-gray-800">
                                            اسم الفحص (Test Name)
                                        </th>
                                        <th className="p-3 border-b border-gray-400 font-semibold text-gray-800">
                                            النتيجة (Result)
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.tests.map((test, index) => (
                                        <tr key={index} className="border-b border-gray-300">
                                            <td className="border-r border-gray-300">
                                                <input
                                                    type="text"
                                                    className="w-full px-3 py-1 bg-transparent border-none focus:ring-0"
                                                    value={test.test_code}
                                                    onChange={(e) =>
                                                        handleDynamicChange("tests", index, "test_code", e.target.value)
                                                    }
                                                />
                                            </td>
                                            <td className="border-r border-gray-300">
                                                <input
                                                    type="text"
                                                    className="w-full px-3 py-1 bg-transparent border-none focus:ring-0"
                                                    value={test.test_name}
                                                    onChange={(e) =>
                                                        handleDynamicChange("tests", index, "test_name", e.target.value)
                                                    }
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="w-full px-3 py-1 bg-transparent border-none focus:ring-0"
                                                    value={test.test_result}
                                                    onChange={(e) =>
                                                        handleDynamicChange("tests", index, "test_result", e.target.value)
                                                    }
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button
                            type="button"
                            onClick={() => addRow("tests")}
                            className="mt-3 px-4 py-1.5 bg-cyan-600 text-white rounded text-sm hover:bg-cyan-700 transition"
                        >
                            + إضافة فحص (Add Test)
                        </button>
                    </div>

                    {/* Section 4: الأدوية المصروفة (Prescribed Medications) */}
                    <div className="p-6 border border-gray-300 rounded-lg bg-gray-50 mt-8">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">
                            الأدوية المصروفة (Prescribed Medications)
                        </h3>
                        <div className="border border-gray-400 rounded overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-green-100">
                                        <th className="p-3 border-b border-gray-400 font-semibold text-gray-800">
                                            كود الدواء (Med Code)
                                        </th>
                                        <th className="p-3 border-b border-gray-400 font-semibold text-gray-800">
                                            اسم الدواء (Medication Name)
                                        </th>
                                        <th className="p-3 border-b border-gray-400 font-semibold text-gray-800">
                                            الجرعة (Dosage)
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.medications.map((med, index) => (
                                        <tr key={index} className="border-b border-gray-300">
                                            <td className="border-r border-gray-300">
                                                <input
                                                    type="text"
                                                    className="w-full px-3 py-1 bg-transparent border-none focus:ring-0"
                                                    value={med.med_code}
                                                    onChange={(e) =>
                                                        handleDynamicChange("medications", index, "med_code", e.target.value)
                                                    }
                                                />
                                            </td>
                                            <td className="border-r border-gray-300">
                                                <input
                                                    type="text"
                                                    className="w-full px-3 py-1 bg-transparent border-none focus:ring-0"
                                                    value={med.med_name}
                                                    onChange={(e) =>
                                                        handleDynamicChange("medications", index, "med_name", e.target.value)
                                                    }
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="w-full px-3 py-1 bg-transparent border-none focus:ring-0"
                                                    value={med.dosage}
                                                    onChange={(e) =>
                                                        handleDynamicChange("medications", index, "dosage", e.target.value)
                                                    }
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button
                            type="button"
                            onClick={() => addRow("medications")}
                            className="mt-3 px-4 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition"
                        >
                            + إضافة دواء (Add Medication)
                        </button>
                    </div>

                    {/* Section 5: Footer - Doctor and Pharmacist Signatures */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border-t-2 border-cyan-600 mt-10">
                        <div>
                            <label className="block text-lg font-medium text-gray-700">
                                اسم الطبيب المعالج (Treating Physician)
                            </label>
                            <input
                                type="text"
                                className="w-full mt-1 px-4 py-2 border border-gray-400 rounded-md"
                                value={data.doctor_name}
                                onChange={(e) => handleFieldChange("doctor_name", e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-lg font-medium text-gray-700">
                                اسم الصيدلي (Pharmacist's Name)
                            </label>
                            <input
                                type="text"
                                className="w-full mt-1 px-4 py-2 border border-gray-400 rounded-md"
                                value={data.pharmacist_name}
                                onChange={(e) => handleFieldChange("pharmacist_name", e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center pt-8">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-10 py-4 bg-gray-800 text-white hover:bg-gray-700 rounded-full font-bold text-lg transition shadow-md"
                        >
                            {processing ? "جاري الحفظ..." : "حفظ بيانات الزيارة"}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}