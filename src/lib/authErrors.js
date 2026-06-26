export function formatAuthError(error) {
  const message = error?.message || 'Something went wrong. Please try again.';

  if (/invalid api key/i.test(message)) {
    return 'Invalid API key — your Supabase anon key is wrong or missing. In Vercel, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (from Supabase → Settings → API), then redeploy.';
  }

  if (/invalid login credentials/i.test(message)) {
    return 'Wrong email or password.';
  }

  if (/email not confirmed/i.test(message)) {
    return 'Please confirm your email first. Check your inbox, or disable email confirmation in Supabase → Authentication → Providers → Email.';
  }

  if (/user already registered/i.test(message)) {
    return 'An account with this email already exists.';
  }

  return message;
}
