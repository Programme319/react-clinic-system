import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Index({ auth, patients, filters = {} }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState(filters.search || "");

  // 1. Title synchronization decoupled from Inertia <Head>
  useEffect(() => {
    document.title = "سجل المرضى";
  }, []);

  // 2. Client-side URL state sync with standard React Router navigation
  useEffect(() => {
    const timer = setTimeout(() => {
      const queryParams = new URLSearchParams();
      if (search) {
        queryParams.set("search", search);
      }

      // Replaces router.get updates smoothly without full page reloads
      navigate(`/patients?${queryParams.toString()}`, { replace: true });
    }, 300);

    return () => clearTimeout(timer);
  }, [search, navigate]);

  return (
    <AuthenticatedLayout user={auth.user}>
      <div className="py-12 bg-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-cyan-600">
            <h2 className="text-2xl font-bold text-gray-800 m-auto pb-16 text-center">
              قائمة المرضى (Patient List)
            </h2>

            <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-2">
              {/* Search Input */}
              <div className="relative w-full md:w-1/3">
                <input
                  type="text"
                  placeholder="بحث بالاسم أو الرقم القومي..."
                  className="w-full border-gray-300 rounded-lg focus:ring-cyan-500 shadow-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* 3. Replaced Inertia 'href' properties with React Router 'to' paths */}
              <Link
                to="/patients/create"
                className="w-2rem md:w-auto px-6 py-2.5 bg-cyan-600 text-white rounded-lg font-bold shadow-md hover:bg-cyan-700 transition flex items-center justify-center gap-2"
              >
                <span>+</span>
                إضافة مريض جديد
              </Link>

              <Link
                to="/users/create"
                className="px-4 py-2 bg-slate-800 text-white rounded-md font-bold text-xs hover:bg-slate-700 transition flex items-center gap-2"
              >
                إضافة حساب طبيب (Add Doctor)
              </Link>
            </div>

            {/* Patient Records Display Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-cyan-50 text-gray-700">
                    <th className="p-4 border-b text-center">رقم التذكرة</th>
                    <th className="p-4 border-b text-right">الاسم بالكامل</th>
                    <th className="p-4 border-b">الرقم القومي</th>
                    <th className="p-4 border-b text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {patients && patients.length > 0 ? (
                    patients.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 transition">
                        <td className="p-4 border-b text-center font-mono">
                          #{p.id}
                        </td>
                        <td className="p-4 border-b font-bold">
                          {p.full_name}
                        </td>
                        <td className="p-4 border-b">{p.national_id}</td>
                        <td className="p-4 border-b text-center">
                          <Link
                            to={`/patients/${p.id}`}
                            className="text-cyan-600 hover:text-cyan-800 font-bold underline"
                          >
                            عرض التفاصيل
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-gray-500">
                        لا يوجد نتائج تطابق البحث.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
