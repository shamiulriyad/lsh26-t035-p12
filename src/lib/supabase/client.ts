import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * THE single browser Supabase client.
 *
 * Import `getSupabaseClient()` (or the `createClient` alias) anywhere in client
 * components — every caller receives the same memoised instance, so there is
 * exactly one auth listener / token-refresh loop in the tab.
 *
 * Uses the ANON / publishable key only. The service-role key must never reach
 * the browser; `assertNotServiceRole()` shouts if it somehow does.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True when both public env vars are present. UI degrades to demo mode otherwise. */
export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

/** Decode a JWT payload without verifying — just to read its `role` claim. */
function jwtRole(token: string): string | null {
  try {
    const [, payload] = token.split('.');
    const json = JSON.parse(
      typeof atob === 'function'
        ? atob(payload)
        : Buffer.from(payload, 'base64').toString('utf8')
    );
    return typeof json.role === 'string' ? json.role : null;
  } catch {
    return null;
  }
}

function assertNotServiceRole() {
  if (supabaseAnonKey && jwtRole(supabaseAnonKey) === 'service_role') {
    console.error(
      '\n🚨 [supabase] SECURITY: NEXT_PUBLIC_SUPABASE_ANON_KEY holds a SERVICE-ROLE key.\n' +
        '   This bypasses Row Level Security for every visitor. Replace it with the\n' +
        '   anon / publishable key immediately; the service-role key is server-only.\n'
    );
  }
}
assertNotServiceRole();

let client: SupabaseClient | null = null;

/** The shared browser client. Throws a named error if env vars are missing. */
export function getSupabaseClient(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }
  if (!client) {
    client = createBrowserClient(supabaseUrl as string, supabaseAnonKey as string);
  }
  return client;
}

/** Back-compat alias for existing imports. Returns the same shared instance. */
export const createClient = getSupabaseClient;
