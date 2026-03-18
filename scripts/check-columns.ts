/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");
require("dotenv").config({ path: path.resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error("Missing keys");
    process.exit(1);
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log("Attempting to get column names...");
  
  // Try getting a row to inspect its keys
  const { data: pData, error: pErr } = await admin.from('projects').select('*').limit(1);
  if (pErr) console.error("projects error:", pErr);
  else if (pData && pData.length > 0) {
    console.log("projects table columns:", Object.keys(pData[0]).join(", "));
  } else {
    // If empty, try to intentionally trigger an error using an invalid column to see if it reveals anything.
    console.log("projects table is empty or invisible.");
  }

  const { data: aData, error: aErr } = await admin.from('agenda_tasks').select('*').limit(1);
  if (aErr) console.error("agenda_tasks error:", aErr);
  else if (aData && aData.length > 0) {
    console.log("agenda_tasks table columns:", Object.keys(aData[0]).join(", "));
  } else {
    console.log("agenda_tasks table is empty or invisible.");
  }
}

main();
