import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardPath, hasMinLevel, isAllowedRole } from '@/lib/permissions';
import { isSupabaseConfigured } from '@/lib/supabaseConfig';
import SupabaseSetupAlert from '@/Components/SupabaseSetupAlert';

export default function RoleGuard({ allowedRoles, minLevel, children }) {
  const { authUser, loading } = useAuth();
  const location = useLocation();

  if (!isSupabaseConfigured) {
    return (
      <div className="loading-center" style={{ minHeight: '100vh' }}>
        <div className="card" style={{ maxWidth: 420, padding: '2rem' }}>
          <SupabaseSetupAlert />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-center" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!authUser || !isAllowedRole(authUser.role)) {
    return <Navigate to="/login" state={{ from: location, reason: 'unauthorized' }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(authUser.role)) {
    return <Navigate to={getDashboardPath(authUser.role)} replace />;
  }

  if (minLevel && !hasMinLevel(authUser.role, minLevel)) {
    return <Navigate to={getDashboardPath(authUser.role)} replace />;
  }

  return children;
}
