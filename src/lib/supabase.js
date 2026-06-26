import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from './supabaseConfig';

const { url, anonKey, isConfigured } = getSupabaseConfig();

export const isSupabaseConfigured = isConfigured;

export const supabase = isConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export default supabase;
