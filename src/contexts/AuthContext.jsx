import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import supabase from '@/lib/supabase';
import { isSupabaseConfigured } from '@/lib/supabaseConfig';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [staffProfile, setStaffProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStaffProfile = useCallback(async (userId) => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    setStaffProfile(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchStaffProfile(currentUser.id);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchStaffProfile(currentUser.id);
      } else {
        setStaffProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchStaffProfile]);

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setStaffProfile(null);
  };

  const authUser = user
    ? {
        id: user.id,
        email: user.email,
        name:
          staffProfile?.name ||
          user.user_metadata?.name ||
          user.email?.split('@')[0] ||
          'User',
        role: staffProfile?.role || 'Clinic Staff',
      }
    : null;

  return (
    <AuthContext.Provider value={{ user, staffProfile, authUser, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
