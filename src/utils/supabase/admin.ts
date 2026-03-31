import { createClient } from "@supabase/supabase-js";

/**
 * Server-only admin client (service role key).
 * Bypasses Row Level Security — use ONLY in Server Components / Server Actions,
 * never import this into client-side code.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase admin credentials in environment variables.");
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
