const fs = require('fs');
let content = fs.readFileSync('src/utils/supabase/middleware.ts', 'utf8');

content = content.replace(
  `let user: Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']['user'] | null = null`,
  `let user: any = null`
);

fs.writeFileSync('src/utils/supabase/middleware.ts', content, 'utf8');
console.log("Patched typescript error");
