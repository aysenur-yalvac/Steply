const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl === 'YOUR_SUPABASE_URL') {
  console.log('No valid supabase credentials in .env.local, check for real keys or use local supabase');
} else {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  async function run() {
    const { data: projects, error } = await supabase.from('projects').select('id, invite_code');
    if (error) { console.error('Error fetching projects:', error); return; }
    
    let updated = 0;
    for (const p of projects) {
      if (!p.invite_code) {
        const code = 'STP-' + Math.random().toString(36).substring(2, 6).toUpperCase();
        const token = crypto.randomUUID();
        const { error: updateErr } = await supabase.from('projects').update({ invite_code: code, invite_token: token }).eq('id', p.id);
        if (updateErr) console.error('Error updating project', p.id, updateErr);
        else updated++;
      }
    }
    console.log(`Updated ${updated} projects with invite codes.`);
  }
  
  run();
}
