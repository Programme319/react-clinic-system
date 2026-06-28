import NurseLayout from '@/Layouts/NurseLayout';
import { usePatients } from '@/hooks/usePatients';

export default function NursePatients() {
  const { patients, loading } = usePatients();

  return (
    <NurseLayout title="Assigned Patients">
      <div className="panel">
        {loading ? <div className="loading-center"><div className="spinner" /></div> : (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>ID</th><th>Name</th><th>Complaint</th><th>Clinic</th></tr></thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.id}>
                    <td>#{p.id}</td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>{p.complaint || '—'}</td>
                    <td>{p.clinic_code || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p style={{ marginTop: '1rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
        Nurses see assigned patient summaries only — no full clinical prescription details.
      </p>
    </NurseLayout>
  );
}
