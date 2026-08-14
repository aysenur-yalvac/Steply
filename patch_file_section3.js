const fs = require('fs');
let content = fs.readFileSync('src/components/projects/FileSection.tsx', 'utf8');

content = content.replace(
  'await deleteFileAction(projectId, fileUrl);',
  'await softDeleteFileAction(projectId, fileUrl);'
);

fs.writeFileSync('src/components/projects/FileSection.tsx', content, 'utf8');
console.log('Fixed softDeleteFileAction call');
