const fs = require('fs');
let path = 'src/components/projects/ProjectEditableContent.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /Globe,\n, Link as LinkIcon/,
  `Globe,\n  Link as LinkIcon`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed syntax error');
