const fs = require('fs');
let path = 'src/components/projects/ProjectEditableContent.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /\$\{project\.invite_token\}/g,
  `\${(project as any).invite_token}`
);

content = content.replace(
  /project\.invite_code/g,
  `(project as any).invite_code`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed project invite TS errors');
