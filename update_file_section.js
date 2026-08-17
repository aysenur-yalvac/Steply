const fs = require('fs');
let content = fs.readFileSync('src/components/projects/FileSection.tsx', 'utf8');

const regex = /\{\!canManageFiles && files\.some\([\s\S]*?\)\s*&&\s*\([\s\S]*?<\/p>\n\s*\)\}/;

content = content.replace(regex, '');
fs.writeFileSync('src/components/projects/FileSection.tsx', content, 'utf8');

console.log("Updated FileSection.tsx");
