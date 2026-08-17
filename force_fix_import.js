const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/projects/[id]/page.tsx', 'utf8');

const importLines = `import { GitHubIntegrationCard } from '@/components/projects/GitHubIntegrationCard';\nimport { getGitHubRepoAction, getProjectCommitsAction } from '@/lib/actions';\n`;
if (!content.includes('import { GitHubIntegrationCard }')) {
  // Inject right after createClient
  content = content.replace(
    `import { createClient } from '@/utils/supabase/server';`,
    `import { createClient } from '@/utils/supabase/server';\n${importLines}`
  );
  fs.writeFileSync('src/app/dashboard/projects/[id]/page.tsx', content, 'utf8');
  console.log("Injected imports successfully.");
} else {
  console.log("Already includes import");
}
