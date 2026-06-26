export function getSupabaseConfig() {
  const url = (
    import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.SUPABASE_URL ||
    ''
  )
    .trim()
    .replace(/\/+$/, '');

  const anonKey = (
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_KEY ||
    import.meta.env.SUPABASE_ANON_KEY ||
    ''
  ).trim();

  const looksValid =
    url.startsWith('https://') &&
    url.includes('.supabase.co') &&
    anonKey.startsWith('eyJ') &&
    anonKey.length > 100;

  return {
    url,
    anonKey,
    isConfigured: looksValid,
  };
}

export const isSupabaseConfigured = getSupabaseConfig().isConfigured;

export function getConfigError() {
  const { url, anonKey, isConfigured } = getSupabaseConfig();

  if (isConfigured) return null;

  if (!url && !anonKey) {
    return 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file (local) or Vercel Environment Variables, then rebuild.';
  }

  if (!url || !url.includes('.supabase.co')) {
    return 'VITE_SUPABASE_URL looks wrong. Use your Project URL from Supabase → Settings → API (e.g. https://abcdefgh.supabase.co).';
  }

  if (!anonKey.startsWith('eyJ')) {
    return 'VITE_SUPABASE_ANON_KEY looks wrong. Use the anon public key from Supabase → Settings → API — not the service_role secret.';
  }

  return 'Supabase credentials look invalid. Double-check both values in Supabase → Settings → API.';
}
