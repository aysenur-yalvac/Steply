const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/projects/[id]/page.tsx', 'utf8');

// Import the GitHub components and actions
if (!content.includes('GitHubSettings')) {
  content = content.replace(
    `import ActivityTimeline from '@/components/projects/ActivityTimeline';`,
    `import ActivityTimeline from '@/components/projects/ActivityTimeline';\nimport { GitHubSettings, GitHubTimeline } from '@/components/projects/GitHubIntegrationCard';\nimport { getGitHubRepoAction, getProjectCommitsAction } from '@/lib/actions';`
  );
}

// Update Promise.all
content = content.replace(
  `  const [activities, projectNotes] = await Promise.all([
    isTeamMember ? getProjectActivitiesAction(projectId).catch(() => []) : Promise.resolve([]),
    isTeamMember ? getProjectNotesAction(projectId).catch(() => [])      : Promise.resolve([]),
  ]);`,
  `  const [activities, projectNotes, repo, commits] = await Promise.all([
    isTeamMember ? getProjectActivitiesAction(projectId).catch(() => []) : Promise.resolve([]),
    isTeamMember ? getProjectNotesAction(projectId).catch(() => [])      : Promise.resolve([]),
    isTeamMember ? getGitHubRepoAction(projectId).catch(() => null)      : Promise.resolve(null),
    isTeamMember ? getProjectCommitsAction(projectId).catch(() => [])    : Promise.resolve([]),
  ]);`
);

// Inject GitHubSettings in Settings Tab or just below everything. The user said:
// "Webhook Kurulum & Repo Bağlama Alanı: Sağ sidebar'ı kalabalıklaştırmamak için repo bağlama formu, Payload URL ve Secret bilgileri projenin "Settings" (Ayarlar) sekmesinde (veya kart üzerindeki bir Ayarlar modalında) yer alacak."
// "Commit Timeline (Aktivite Akışı): Sağ sidebar'da "Aktiviteler" alanının hemen altında yer alacak"

// Let's check ProjectTabsWrapper. It probably takes children or has tabs.
// Looking at earlier output, there is no "Settings" tab in the page.tsx directly, ProjectTabsWrapper handles tabs?
// Actually ProjectTabsWrapper might have its own props. Let's find ProjectTabsWrapper in the file.
