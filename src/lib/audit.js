import supabase from '@/lib/supabase';

export async function logAudit({ userId, action, resource, resourceId, details = {} }) {
  if (!supabase || !userId) return;

  await supabase.from('audit_logs').insert({
    user_id: userId,
    action,
    resource,
    resource_id: resourceId ? String(resourceId) : null,
    details,
  });
}

export async function logView(user, resource, resourceId, extra = {}) {
  return logAudit({
    userId: user?.id,
    action: 'VIEW',
    resource,
    resourceId,
    details: extra,
  });
}

export async function logCreate(user, resource, resourceId, extra = {}) {
  return logAudit({
    userId: user?.id,
    action: 'CREATE',
    resource,
    resourceId,
    details: extra,
  });
}

export async function logUpdate(user, resource, resourceId, extra = {}) {
  return logAudit({
    userId: user?.id,
    action: 'UPDATE',
    resource,
    resourceId,
    details: extra,
  });
}

export async function logDelete(user, resource, resourceId, extra = {}) {
  return logAudit({
    userId: user?.id,
    action: 'DELETE',
    resource,
    resourceId,
    details: extra,
  });
}
