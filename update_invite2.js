const fs = require('fs');
let path = 'src/components/projects/ProjectEditableContent.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /(\/dashboard\/projects\?join=)/g,
  `/join/`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed join links in ProjectEditableContent.tsx');
