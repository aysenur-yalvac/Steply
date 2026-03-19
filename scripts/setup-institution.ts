/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");
require("dotenv").config({ path: path.resolve(process.cwd(), ".env.local") });

import("@supabase/supabase-js").then(async ({ createClient }) => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error("❌ Missing SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log("🔧 Adding institution column via RPC...");

  const { error } = await admin.rpc("exec_sql", {
    sql: `
      ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS institution text;
    `,
  });

  if (error) {
    console.error("⚠️ Could not alter column via RPC:", error.message);
  } else {
    console.log("✅ 'institution' column successfully added or already exists.");
  }
});
