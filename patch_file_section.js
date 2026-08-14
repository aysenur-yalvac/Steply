const fs = require('fs');
let content = fs.readFileSync('src/components/projects/FileSection.tsx', 'utf8');

// replace deleteFileAction with softDeleteFileAction
content = content.replace(
  'saveFileRecordAction, deleteFileAction',
  'saveFileRecordAction, softDeleteFileAction'
);

content = content.replace(
  /await deleteFileAction\(projectId, file\.url\);/g,
  'await softDeleteFileAction(projectId, file.url);'
);

// only show files that don't have deleted_at
content = content.replace(
  'const [optimisticFiles, addOptimistic] = useOptimistic(',
  `const activeFiles = files.filter(f => !f.deleted_at);\n  const [optimisticFiles, addOptimistic] = useOptimistic(activeFiles, `
);

fs.writeFileSync('src/components/projects/FileSection.tsx', content, 'utf8');
console.log('Patched FileSection');
