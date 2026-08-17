const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/projects/[id]/page.tsx', 'utf8');

// Fix the imports
content = content.replace(
  `import { GitHubSettings, GitHubTimeline } from '@/components/projects/GitHubIntegrationCard';`,
  `import { GitHubIntegrationCard } from '@/components/projects/GitHubIntegrationCard';`
);

// We need to inject <GitHubIntegrationCard projectId={projectId} repo={repo} commits={commits} isTeamMember={isTeamMember} />
// below ActivityTimeline
content = content.replace(
  `{isTeamMember && (
              <ActivityTimeline activities={activities} />
            )}`,
  `{isTeamMember && (
              <ActivityTimeline activities={activities} />
            )}
            <GitHubIntegrationCard projectId={projectId} repo={repo} commits={commits} isTeamMember={isTeamMember} />`
);

fs.writeFileSync('src/app/dashboard/projects/[id]/page.tsx', content, 'utf8');
console.log("Injected GitHubIntegrationCard into page.tsx");
