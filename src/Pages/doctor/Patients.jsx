import { useState } from 'react';
import { Link } from 'react-router-dom';
import DoctorLayout from '@/Layouts/DoctorLayout';
import { usePatients } from '@/hooks/usePatients';

export default function DoctorPatients() {
  const [search, setSearch] = useState('');
  const { patients, loading, error } = usePatients(search);

  return (
    <DoctorLayout title="Patient List">
      <div className="panel">
        <div className="patients__toolbar" style={{ border: 'none' }}>
          <input
            className="patients__search-input"
            placeholder="Search patients…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 360 }}
          />
        </div>
        {error && <div className="alert alert-error" style={{ margin: '1rem' }}>{error}</div>}
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th><th>Name</th><th>Clinic Code</th><th>Doctor</th><th>Diagnosis</th><th></th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.id}>
                    <td>#{p.id}</td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>{p.clinic_code || '—'}</td>
                    <td>{p.doctor_name || '—'}</td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.diagnosis_text || '—'}
                    </td>
                    <td><Link to={`/doctor/history/${p.id}`} className="link-primary">View →</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DoctorLayout>
  );
}
