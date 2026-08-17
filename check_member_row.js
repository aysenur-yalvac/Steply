const fs = require('fs');
let content = fs.readFileSync('src/components/projects/ProjectEditableContent.tsx', 'utf8');

const regex = /function MemberRow\([\s\S]*?\{[\s\S]*?return \(/;
console.log(content.match(regex)[0]);
