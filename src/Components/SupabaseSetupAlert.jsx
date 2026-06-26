import { getConfigError, isSupabaseConfigured } from '@/lib/supabaseConfig';

export default function SupabaseSetupAlert() {
  if (isSupabaseConfigured) return null;

  const message = getConfigError();

  return (
    <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <p className="font-semibold">Configuration required</p>
      <p className="mt-1 leading-relaxed">{message}</p>
    </div>
  );
}
