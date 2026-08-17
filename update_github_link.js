const fs = require('fs');

let content = fs.readFileSync('src/app/dashboard/projects/[id]/page.tsx', 'utf8');

const regex = /<GitHubIntegrationCard projectId=\{projectId\} repo=\{repo\} commits=\{commits\} isTeamMember=\{isTeamMember\} githubLink=\{project.github_link\} \/>/;

const newContent = `<GitHubIntegrationCard projectId={projectId} repo={repo} commits={commits} isTeamMember={isTeamMember} githubLink={project.github_link || ownerGithubUrl} />`;

content = content.replace(regex, newContent);
fs.writeFileSync('src/app/dashboard/projects/[id]/page.tsx', content, 'utf8');

console.log("Passed fallback githubLink to GitHubIntegrationCard");
