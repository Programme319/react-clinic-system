import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardPath, isAllowedRole } from '@/lib/permissions';

/** Only guests (not signed in) can access login/welcome */
export default function GuestOnlyRoute({ children }) {
  const { authUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-center" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (authUser && isAllowedRole(authUser.role)) {
    return <Navigate to={getDashboardPath(authUser.role)} replace />;
  }

  return children;
}
