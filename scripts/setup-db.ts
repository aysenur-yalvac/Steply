/**
 * scripts/setup-db.ts
 *
 * One-time database setup: adds FK constraint for reviews.reviewer_id → profiles.id
 * Run with: npx ts-node --project tsconfig.node.json scripts/setup-db.ts
 * Or add to package.json: "setup": "npx ts-node --project tsconfig.node.json scripts/setup-db.ts"
 *
 * Requires: SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

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

  console.log("🔧 Running DB setup...");

  // 1. Add FK constraint: reviews.reviewer_id → profiles.id
  const { error: fkError } = await admin.rpc("exec_sql", {
    sql: `
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'reviews_reviewer_id_fkey'
        ) THEN
          ALTER TABLE public.reviews
            ADD CONSTRAINT reviews_reviewer_id_fkey
            FOREIGN KEY (reviewer_id)
            REFERENCES public.profiles(id)
            ON DELETE SET NULL;
          RAISE NOTICE 'FK constraint added.';
        ELSE
          RAISE NOTICE 'FK constraint already exists.';
        END IF;
      END $$;
    `,
  });

  if (fkError) {
    // exec_sql RPC may not exist — print instructions instead
    console.warn("⚠️  Could not run FK migration via RPC:", fkError.message);
    console.log("\nTo fix reviewer names, run this in Supabase SQL Editor:");
    console.log(`
ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_reviewer_id_fkey
  FOREIGN KEY (reviewer_id)
  REFERENCES public.profiles(id)
  ON DELETE SET NULL;
    `);
  } else {
    console.log("✅ FK constraint ready.");
  }

  // 2. Storage bucket (same logic as init-storage.ts)
  const { data: buckets } = await admin.storage.listBuckets();
  const bucketExists = buckets?.some((b) => b.id === "project-files");

  if (!bucketExists) {
    const { error: bucketErr } = await admin.storage.createBucket("project-files", {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
    });
    if (bucketErr) {
      console.error("❌ Could not create bucket:", bucketErr.message);
    } else {
      console.log("✅ Storage bucket 'project-files' created.");
    }
  } else {
    console.log("✅ Bucket 'project-files' already exists.");
  }

  console.log("\n🎉 Setup complete!");
});
