const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/layout.tsx', 'utf8');

// Add React cache import
content = content.replace(
  "import { redirect } from 'next/navigation';",
  "import { redirect } from 'next/navigation';\nimport { unstable_cache } from 'next/cache';"
);

// Wrap profile fetch with cache
content = content.replace(
  `  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, avatar_url, total_score')
    .eq('id', user.id)
    .single();`,
  `  const getProfile = unstable_cache(
    async (uid: string) => {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, role, avatar_url, total_score')
        .eq('id', uid)
        .single();
      return data;
    },
    ['dashboard-profile'],
    { revalidate: 30 }
  );
  const profile = await getProfile(user.id);`
);

fs.writeFileSync('src/app/dashboard/layout.tsx', content, 'utf8');
console.log('Added caching to dashboard layout');
