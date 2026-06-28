import { useEffect, useState, useCallback } from 'react';
import supabase from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { logView } from '@/lib/audit';

export function usePatients(search = '') {
  const { authUser } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    setError(null);

    let query = supabase.from('patients').select('*').order('created_at', { ascending: false });
    if (search.trim()) {
      const t = `%${search.trim()}%`;
      query = query.or(`name.ilike.${t},clinic_code.ilike.${t},email.ilike.${t}`);
    }

    const { data, error: err } = await query;
    if (err) {
      setError(err.message);
      setPatients([]);
    } else {
      setPatients(data || []);
      await logView(authUser, 'patients', 'list', { count: data?.length });
    }
    setLoading(false);
  }, [search, authUser]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { patients, loading, error, reload };
}

export async function fetchPatientDetail(id, authUser) {
  if (!supabase) throw new Error('Not connected');

  const [p, inv, meds] = await Promise.all([
    supabase.from('patients').select('*').eq('id', id).single(),
    supabase.from('patient_investigations').select('*').eq('patient_id', id),
    supabase.from('patient_medications').select('*').eq('patient_id', id),
  ]);

  if (p.error) throw p.error;
  await logView(authUser, 'patient', id);

  return {
    patient: p.data,
    investigations: inv.data || [],
    medications: meds.data || [],
  };
}
