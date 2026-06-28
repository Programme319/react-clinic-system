import AdminLayout from '@/Layouts/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { PERMISSION_LEVELS, ROLES } from '@/lib/permissions';

export default function AdminSettings() {
  const { authUser } = useAuth();

  return (
    <AdminLayout title="System Settings">
      <div className="panel" style={{ maxWidth: 560 }}>
        <div className="panel__header">Permission levels</div>
        <div className="panel__body">
          <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 2 }}>
            {Object.entries(PERMISSION_LEVELS).map(([role, level]) => (
              <li key={role}><strong>{role}</strong> — Level {level}</li>
            ))}
          </ul>
          <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Logged in as {authUser?.email} ({authUser?.role}). Administrators cannot access clinical prescription details — use role-specific dashboards.
          </p>
          <div style={{ marginTop: '1rem' }}>
            <p className="alert alert-warning" style={{ fontSize: '0.8125rem' }}>
              Run <code>supabase/required_patch.sql</code> once if login or role routing fails.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
