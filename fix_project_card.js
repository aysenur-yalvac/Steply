const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/trash/projects/page.tsx', 'utf8');
content = content.replace(/isOwner=\{true\}/g, 'currentUserId={user?.id}');
fs.writeFileSync('src/app/dashboard/trash/projects/page.tsx', content, 'utf8');
console.log('Fixed ProjectCard props');
