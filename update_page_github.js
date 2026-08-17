const fs = require('fs');

let content = fs.readFileSync('src/app/dashboard/projects/[id]/page.tsx', 'utf8');

// Also update `ownerGithubUrl` variable.
let idx = content.indexOf('let ownerAvatarUrl');
content = content.slice(0, idx) + 'let ownerAvatarUrl: string | null = null;\n  let ownerGithubUrl: string | null = null;' + content.slice(idx + 41);

const isOwnerBlock = `ownerAvatarUrl = profile?.avatar_url ?? null;`;
content = content.replace(isOwnerBlock, `ownerAvatarUrl = profile?.avatar_url ?? null;\n    ownerGithubUrl = profile?.github_url ?? null;`);

const ownerProfileQuery = `.select('full_name, avatar_url')`;
content = content.replace(ownerProfileQuery, `.select('full_name, avatar_url, github_url')`);

const ownerProfileAssignment = `    ownerName      = ownerProfile?.full_name  ?? null;
    ownerAvatarUrl = ownerProfile?.avatar_url ?? null;`;
content = content.replace(ownerProfileAssignment, `    ownerName      = ownerProfile?.full_name  ?? null;
    ownerAvatarUrl = ownerProfile?.avatar_url ?? null;
    ownerGithubUrl = ownerProfile?.github_url ?? null;`);

fs.writeFileSync('src/app/dashboard/projects/[id]/page.tsx', content, 'utf8');
console.log("Updated page.tsx to fetch github_url");
