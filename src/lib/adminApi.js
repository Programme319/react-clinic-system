import supabase from '@/lib/supabase';

function assertSupabase() {
  if (!supabase) throw new Error('Database not connected');
  return supabase;
}

export async function fetchAdminDashboardStats(callerId) {
  const client = assertSupabase();
  const { data, error } = await client.rpc('get_admin_dashboard_stats', {
    p_caller_id: callerId,
  });

  if (error) throw error;
  if (!data?.success) throw new Error(data?.message || 'Failed to load dashboard stats');
  return data;
}

export async function fetchStaffList(callerId) {
  const client = assertSupabase();
  const { data, error } = await client.rpc('list_staff_users', {
    p_caller_id: callerId,
  });

  if (error) throw error;
  if (!data?.success) throw new Error(data?.message || 'Failed to load staff');
  return data.staff || [];
}

export async function setStaffActive(callerId, userId, isActive) {
  const client = assertSupabase();
  const { data, error } = await client.rpc('set_staff_active', {
    p_caller_id: callerId,
    p_user_id: userId,
    p_is_active: isActive,
  });

  if (error) throw error;
  if (!data?.success) throw new Error(data?.message || 'Failed to update staff status');
  return data;
}
