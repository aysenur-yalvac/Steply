const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/projects/[id]/page.tsx', 'utf8');

content = content.replace(
  `const [activities, projectNotes] = await Promise.all([
    isTeamMember ? getProjectActivitiesAction(projectId).catch(() => []) : Promise.resolve([]),
    isTeamMember ? getProjectNotesAction(projectId).catch(() => [])      : Promise.resolve([]),
  ]);`,
  `const [activities, projectNotes, repo, commits] = await Promise.all([
    isTeamMember ? getProjectActivitiesAction(projectId).catch(() => []) : Promise.resolve([]),
    isTeamMember ? getProjectNotesAction(projectId).catch(() => [])      : Promise.resolve([]),
    isTeamMember ? getGitHubRepoAction(projectId).catch(() => null)      : Promise.resolve(null),
    isTeamMember ? getProjectCommitsAction(projectId).catch(() => [])    : Promise.resolve([]),
  ]);`
);

fs.writeFileSync('src/app/dashboard/projects/[id]/page.tsx', content, 'utf8');
console.log("Fixed Promise.all");
