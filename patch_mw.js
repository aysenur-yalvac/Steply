const fs = require('fs');

// Patch middleware.ts matcher
let mwContent = fs.readFileSync('src/middleware.ts', 'utf8');
mwContent = mwContent.replace(
  '/((?!_next/static|_next/image|favicon.ico|api/|auth/callback|.*\\\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|otf|map)$).*)',
  '/((?!_next/static|_next/image|_next/data|favicon.ico|api/|auth/callback|.*\\\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|otf|map)$).*)'
);
fs.writeFileSync('src/middleware.ts', mwContent, 'utf8');

// Patch supabase middleware.ts
let spMwContent = fs.readFileSync('src/utils/supabase/middleware.ts', 'utf8');
spMwContent = spMwContent.replace(
  `  // getUser() with 4.5s timeout`,
  `  // getSession() with 4.5s timeout - much faster for middleware as it reads local cookie`
);
spMwContent = spMwContent.replace(
  `  let user: Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user'] = null
  try {
    const { data } = await Promise.race([
      supabase.auth.getUser(),
      new Promise<{ data: { user: null } }>(resolve =>
        setTimeout(() => resolve({ data: { user: null } }), 4500)
      ),
    ])
    user = data.user
  } catch {`,
  `  let user: Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']['user'] | null = null
  try {
    const { data } = await Promise.race([
      supabase.auth.getSession(),
      new Promise<{ data: { session: null } }>(resolve =>
        setTimeout(() => resolve({ data: { session: null } }), 4500)
      ),
    ])
    user = data.session?.user ?? null
  } catch {`
);

fs.writeFileSync('src/utils/supabase/middleware.ts', spMwContent, 'utf8');
console.log("Patched middleware files");
