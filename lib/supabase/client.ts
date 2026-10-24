/**
 * Supabase client configuration.
 * Gracefully detects whether Supabase environment variables are provided.
 */

export const isSupabaseConfigured = (): boolean => {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co'
  );
};

export const getSupabaseConfigWarning = (): string | null => {
  if (!isSupabaseConfigured()) {
    return 'Supabase credentials not configured. Operating in local-first mode using browser storage with full versioning and tamper-evident signatures.';
  }
  return null;
};
