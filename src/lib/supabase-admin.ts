import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Admin Client — uses the service_role key.
 * This client bypasses RLS and can perform admin operations
 * like creating storage buckets and running DDL.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in your .env.local
 * Get it from: Supabase Dashboard > Project Settings > API > service_role key
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY in environment variables. " +
      "Add it to your .env.local file from Supabase Dashboard > Project Settings > API."
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
