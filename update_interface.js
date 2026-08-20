const fs = require('fs');
let path = 'src/components/projects/ProjectEditableContent.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /is_private\?: boolean;/g,
  `is_private?: boolean;\n    invite_code?: string;\n    invite_token?: string;`
);

content = content.replace(/\(project as any\)\./g, 'project.');

fs.writeFileSync(path, content, 'utf8');
console.log('Updated ProjectEditableContent.tsx interface and references');
