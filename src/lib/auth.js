import supabase from '@/lib/supabase';
import { normalizeRole } from '@/lib/permissions';

const SESSION_KEY = 'clinic_session';

export function getStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function storeSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export async function loginWithCredentials(email, password) {
  if (!supabase) throw new Error('Database not connected');

  const { data, error } = await supabase.rpc('login_user', {
    p_email: email.trim(),
    p_password: password,
  });

  if (error) throw new Error(error.message);
  if (!data?.success) throw new Error(data?.message || 'Login failed');

  const user = {
    ...data.user,
    role: normalizeRole(data.user.role),
  };

  storeSession(user);
  return user;
}

export async function createStaffUser({ name, email, password, role }) {
  if (!supabase) throw new Error('Database not connected');

  const { data, error } = await supabase.rpc('create_staff_user', {
    p_name: name,
    p_email: email.trim(),
    p_password: password,
    p_role: role,
  });

  if (error) throw new Error(error.message);
  if (!data?.success) throw new Error(data?.message || 'Failed to create user');
  return data;
}
