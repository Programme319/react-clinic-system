import supabase from '@/lib/supabase';
import { isAllowedRole, normalizeRole } from '@/lib/permissions';

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

function assertAuthorizedUser(user) {
  const role = normalizeRole(user?.role);
  if (!user?.id || !user?.email || !isAllowedRole(role)) {
    clearSession();
    throw new Error(
      'This account is not authorized. Contact your administrator to assign a staff role.',
    );
  }
  return { ...user, role };
}

export async function loginWithCredentials(email, password) {
  if (!supabase) throw new Error('Database not connected');

  const { data, error } = await supabase.rpc('login_user', {
    p_email: email.trim(),
    p_password: password,
  });

  if (error) throw new Error(error.message);
  if (!data?.success) throw new Error(data?.message || 'Invalid email or password');

  const user = assertAuthorizedUser({
    ...data.user,
    role: normalizeRole(data.user.role),
  });

  storeSession(user);
  return user;
}

export async function validateStoredSession(stored) {
  if (!stored?.id || !supabase) return null;

  const { data, error } = await supabase.rpc('validate_staff_session', {
    p_user_id: stored.id,
  });

  if (error || !data?.success) {
    clearSession();
    return null;
  }

  return assertAuthorizedUser({
    ...data.user,
    role: normalizeRole(data.user.role),
  });
}

export async function createStaffUser({ callerId, name, email, password, role }) {
  if (!supabase) throw new Error('Database not connected');
  if (!callerId) throw new Error('Administrator session required');

  const { data, error } = await supabase.rpc('create_staff_user', {
    p_caller_id: callerId,
    p_name: name,
    p_email: email.trim(),
    p_password: password,
    p_role: role,
  });

  if (error) throw new Error(error.message);
  if (!data?.success) throw new Error(data?.message || 'Failed to create user');
  return data;
}
