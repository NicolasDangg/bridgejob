import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export function getSupabaseBrowserClient(): SupabaseClient | null {
  const url = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error('Supabase credentials missing. Auth features are disabled until env vars are configured.');
    return null;
  }

  return createClient(url, anonKey);
}

export function buildAuthRedirectUrl(path = '/dashboard') {
  if (typeof window === 'undefined') return undefined;
  
  // Always use window.location.origin as primary source (captures current domain)
  // This ensures correct redirect on Vercel and other deployments
  const baseUrl = window.location.origin;
  
  return new URL(path, baseUrl).toString();
}

export const supabase = getSupabaseBrowserClient();
