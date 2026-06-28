import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  clearSession,
  getStoredSession,
  loginWithCredentials,
  validateStoredSession,
} from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { isAllowedRole } from '@/lib/permissions';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      const stored = getStoredSession();
      if (!stored) {
        setLoading(false);
        return;
      }

      try {
        const user = await validateStoredSession(stored);
        if (user && isAllowedRole(user.role)) {
          setAuthUser(user);
        } else {
          clearSession();
          setAuthUser(null);
        }
      } catch {
        clearSession();
        setAuthUser(null);
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  const login = useCallback(async (email, password) => {
    const user = await loginWithCredentials(email, password);
    if (!isAllowedRole(user.role)) {
      clearSession();
      throw new Error('Unauthorized staff account.');
    }
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
