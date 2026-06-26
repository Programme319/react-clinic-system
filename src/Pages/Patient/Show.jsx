import React, { useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link } from 'react-router-dom';

export default function Show({ auth, patient }) {
    // 1. Dynamic document title updates synchronized with React state lifecycle
    useEffect(() => {
        if (patient?.full_name) {
            document.title = `ملف المريض: ${patient.full_name}`;
        }
    }, [patient]);

    if (!patient) {
        return <div className="p-10 text-center text-gray-500 font-bold">جاري تحميل البيانات...</div>;
    }

    return (
        <AuthenticatedLayout user={auth.user}>
            {/* Added "dir="rtl"" and "text-right" to fix the Arabic direction globally */}
            <div className="py-12 bg-gray-100 min-h-screen font-sans" dir="rtl">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Action Buttons */}
                    <div className="flex justify-between mb-6 no-print">
                        {/* 2. Swapped Inertia href route() for native react-router-dom target navigation */}
                        <Link 
                            to="/patients" 
                            className="bg-white px-4 py-2 border rounded shadow-sm hover:bg-gray-50 transition text-sm font-bold flex items-center"
                        >
                            ← العودة للسجل
                        </Link>
                        <button 
                            onClick={() => window.print()}
                            className="bg-cyan-600 text-white px-6 py-2 rounded shadow hover:bg-cyan-700 transition font-bold"
                        >
                            طباعة (Print)
                        </button>
                    </div>

                    {/* The Medical Report Sheet (Original Design) */}
                    <div className="bg-white border-2 border-gray-300 shadow-xl p-8 relative text-right">
                        
                        {/* Header - Fixed RTL alignment */}
                        <div className="flex justify-between items-start border-b-4 border-cyan-600 pb-6 mb-8">
                            <div className="w-2/3">
                                <h1 className="text-4xl font-black text-gray-900 mb-2">{patient.full_name}</h1>
                                <p className="text-lg text-gray-600">الرقم القومي: {patient.national_id}</p>
                            </div>
                            <div className="text-left">
                                <p className="text-sm text-gray-400 font-bold">رقم التذكرة</p>
                                <p className="text-4xl font-bold text-cyan-600">#{patient.id}</p>
                                <p className="text-md mt-1">العمر: {patient.age} سنة</p>
                            </div>
                        </div>

                        {/* Complaint & Diagnosis */}
                        <div className="space-y-8 mb-10">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 border-r-4 border-cyan-600 pr-3 mb-2">شكوى المريض</h3>
                                <p className="p-4 bg-gray-50 rounded border border-gray-100 text-lg">
                                    {patient.complaint || "لا يوجد"}
                                </p>
                            </div>

                            <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg">
                                <h3 className="text-xl font-bold text-cyan-700 mb-3 text-center underline">التشخيص الطبي (Medical Diagnosis)</h3>
                                <p className="text-2xl font-medium leading-relaxed text-gray-900 text-center">
                                    {patient.diagnosis_text}
                                </p>
                            </div>
                        </div>

                        {/* Two Columns for Tables - Balanced for Arabic */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t pt-8">
                            
                            {/* Investigations Table */}
                            <div>
                                <h4 className="text-lg font-bold text-gray-800 mb-4 pr-2 border-r-4 border-cyan-500">الفحوصات والتحاليل</h4>
                                <table className="w-full text-right border-collapse">
                                    <thead>
                                        <tr className="bg-cyan-50">
                                            <th className="p-2 border border-gray-300">الفحص</th>
                                            <th className="p-2 border border-gray-300">النتيجة</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {patient.investigations && patient.investigations.length > 0 ? (
                                            patient.investigations.map((test) => (
                                                <tr key={test.id}>
                                                    <td className="p-2 border border-gray-300">{test.test_name}</td>
                                                    <td className="p-2 border border-gray-300 font-bold text-cyan-700">{test.test_result}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="2" className="p-4 text-center text-gray-400 text-sm">لا توجد فحوصات مسجلة</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Medications Table */}
                            <div>
                                <h4 className="text-lg font-bold text-gray-800 mb-4 pr-2 border-r-4 border-green-500">الأدوية المصروفة</h4>
                                <table className="w-full text-right border-collapse">
                                    <thead>
                                        <tr className="bg-green-50">
                                            <th className="p-2 border border-gray-300">الدواء</th>
                                            <th className="p-2 border border-gray-300">الجرعة</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {patient.medications && patient.medications.length > 0 ? (
                                            patient.medications.map((med) => (
                                                <tr key={med.id}>
                                                    <td className="p-2 border border-gray-300">{med.med_name}</td>
                                                    <td className="p-2 border border-gray-300 font-bold text-green-700">{med.dosage}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="2" className="p-4 text-center text-gray-400 text-sm">لا توجد أدوية مسجلة</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Signatures - Styled for RTL */}
                        <div className="mt-16 flex justify-between px-10">
                            <div className="text-center w-64 border-t-2 border-gray-800 pt-2">
                                <p className="text-sm font-bold">توقيع الطبيب المعالج</p>
                                <p className="mt-4 font-serif text-lg italic text-gray-700">{patient.doctor_name || '...................'}</p>
                            </div>
                            <div className="text-center w-64 border-t-2 border-gray-800 pt-2">
                                <p className="text-sm font-bold">اعتماد الصيدلية</p>
                                <p className="mt-4 font-serif text-lg italic text-gray-700">{patient.pharmacist_name || '...................'}</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Print Settings Layer */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; padding: 0 !important; }
                    .max-w-5xl { max-width: 100% !important; width: 100% !important; }
                }
            `}} />
        </AuthenticatedLayout>
    );
}