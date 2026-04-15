import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export function getSupabaseBrowserClient(): SupabaseClient | null {
  // Vite uses import.meta.env for environment variables.
  // We check for both VITE_ and NEXT_PUBLIC_ prefixes for compatibility.
  const url = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error("Supabase credentials missing! Authentication features will be disabled. Check your .env file.");
    return null;
  }

  return createClient(url, anonKey);
}

export const supabase = getSupabaseBrowserClient();
