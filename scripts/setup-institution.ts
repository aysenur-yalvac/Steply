/**
 * scripts/setup-institution.ts
 *
 * Adds the 'institution' TEXT column to the profiles table in Supabase.
 *
 * NOTE: This script is only needed if the column doesn't exist yet.
 * You can also run the SQL directly in Supabase Dashboard → SQL Editor:
 *
 *   ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS institution text;
 *   NOTIFY pgrst, 'reload schema';
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 * set as environment variables, or hardcoded below (not recommended).
 */

// This is intentionally a plain Node.js script (not using dotenv)
// since the project does not have dotenv installed as a dependency.
// Export the SUPABASE environment variables in your terminal before running:
//   $env:SUPABASE_SERVICE_ROLE_KEY="your_key"   # PowerShell
//   $env:NEXT_PUBLIC_SUPABASE_URL="your_url"

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error("❌ Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.");
    console.log("\nAlternatively, run this in Supabase SQL Editor:");
    console.log("  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS institution text;");
    console.log("  NOTIFY pgrst, 'reload schema';");
    process.exit(1);
  }

  const { createClient } = await import("@supabase/supabase-js");
  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await admin.rpc("exec_sql", {
    sql: "ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS institution text; NOTIFY pgrst, 'reload schema';",
  });

  if (error) {
    console.warn("⚠️  RPC not available:", error.message);
    console.log("Please run this SQL manually in Supabase:");
    console.log("  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS institution text;");
    console.log("  NOTIFY pgrst, 'reload schema';");
  } else {
    console.log("✅ institution column added and schema reloaded.");
  }
}

main();
