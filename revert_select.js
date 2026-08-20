const fs = require('fs');
let path = 'src/app/dashboard/projects/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Revert the wrong ones
content = content.replace(
  /\.from\('profiles'\)\s*\n\s*\.select\('\*, invite_code, invite_token'\)/g,
  `.from('profiles')\n      .select('*')`
);

content = content.replace(
  /\.from\('project_tasks'\)\s*\n\s*\.select\('\*, invite_code, invite_token'\)/g,
  `.from('project_tasks')\n      .select('*')`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Reverted incorrect select modifications');
