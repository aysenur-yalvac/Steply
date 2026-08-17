const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/projects/[id]/page.tsx', 'utf8');

if (!content.includes('GitHubIntegrationCard')) {
  content = content.replace(
    `import ActivityTimeline from '@/components/projects/ActivityTimeline';`,
    `import ActivityTimeline from '@/components/projects/ActivityTimeline';\nimport { GitHubIntegrationCard } from '@/components/projects/GitHubIntegrationCard';\nimport { getGitHubRepoAction, getProjectCommitsAction } from '@/lib/actions';`
  );
}

fs.writeFileSync('src/app/dashboard/projects/[id]/page.tsx', content, 'utf8');
console.log("Added import");
