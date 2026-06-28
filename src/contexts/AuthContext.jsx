import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { clearSession, getStoredSession, loginWithCredentials } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { normalizeRole } from '@/lib/permissions';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getStoredSession();
    if (session) {
      setAuthUser({ ...session, role: normalizeRole(session.role) });
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const user = await loginWithCredentials(email, password);
    setAuthUser(user);
    await logAudit({ userId: user.id, action: 'LOGIN', resource: 'auth', details: { email: user.email } });
    return user;
  }, []);

  const signOut = useCallback(async () => {
    if (authUser) {
      await logAudit({ userId: authUser.id, action: 'LOGOUT', resource: 'auth' });
    }
    clearSession();
    setAuthUser(null);
  }, [authUser]);

  return (
    <AuthContext.Provider value={{ authUser, loading, login, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
