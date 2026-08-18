const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testRLS() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.log("Missing env vars");
    return;
  }

  const supabase = createClient(url, anonKey);
  
  // Try querying without auth (will use anon role and trigger RLS)
  const { data, error } = await supabase
    .from("messages")
    .select("sender_id")
    .limit(1);

  if (error) {
    console.log("RLS/SQL Error (Anon Client):", JSON.stringify(error, null, 2));
  } else {
    console.log("Data (Anon Client):", data);
  }
}

testRLS();
