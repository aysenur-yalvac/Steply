const fs = require('fs');
let path = 'src/components/projects/ProjectEditableContent.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /useState\(\{ code: inviteData\.code \|\| null, token: inviteData\.token \|\| null \}\);/g,
  `useState({ code: project.invite_code || null, token: project.invite_token || null });`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed inviteData initializer');
