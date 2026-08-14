const fs = require('fs');

const files = [
  'src/app/api/search/route.ts',
  'src/app/dashboard/actions.ts',
  'src/app/dashboard/favorites/page.tsx',
  'src/app/dashboard/page.tsx',
  'src/app/dashboard/school/page.tsx',
  'src/app/user/[id]/page.tsx',
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    // Replace .from("projects").select("...") or .select(`...`) with .is('deleted_at', null) appended
    // Easiest is to replace `.from('projects').select(` with `.from('projects').select(` and then append .is('deleted_at', null)
    // Actually, let's just do `.from('projects')` -> `.from('projects')` but that might break if there's no select.
    
    // Manual patching via regex:
    const regex1 = /\.from\(\s*['"]projects['"]\s*\)\s*\.select\(/g;
    const matches = [...content.matchAll(regex1)];
    if (matches.length > 0) {
      console.log(`Patching ${file}...`);
      // It's tricky to find the end of the .select() call. Let's just append .is('deleted_at', null) right after .select(...) 
      // by replacing `.eq(` or `.order(` or `.limit(` with `.is('deleted_at', null).eq(` etc.
      
      content = content.replace(/\.eq\(/g, '.is("deleted_at", null).eq(');
      // Wait! That replaces ALL .eq() calls, including ones for other tables!
    }
  }
}
