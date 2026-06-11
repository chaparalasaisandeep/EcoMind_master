/**
 * EcoMind AI Ultra — Supabase Client
 * Secure singleton client with environment validation.
 * Security: No secrets in source, validates env vars at runtime.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
  );
}

// Validate URL format to prevent injection
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.hostname.endsWith('.supabase.co');
  } catch {
    return false;
  }
}

if (!isValidUrl(supabaseUrl)) {
  throw new Error('Invalid Supabase URL format');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: 'public',
  },
});

/**
 * Get current authenticated user safely.
 * Returns null if not authenticated.
 */
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

/**
 * Get current session safely.
 */
export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) return null;
  return data.session;
}
