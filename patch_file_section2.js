const fs = require('fs');
let content = fs.readFileSync('src/components/projects/FileSection.tsx', 'utf8');

// The line is: const [optimisticFiles, addOptimisticFile] = useOptimistic<PendingFile[], PendingFile>(
content = content.replace(
  'const [optimisticFiles, addOptimisticFile] = useOptimistic<PendingFile[], PendingFile>(',
  `const activeFiles = files.filter(f => !(f as any).deleted_at);\n  const [optimisticFiles, addOptimisticFile] = useOptimistic<PendingFile[], PendingFile>(`
);

content = content.replace(
  'files as PendingFile[],',
  'activeFiles as PendingFile[],'
);

fs.writeFileSync('src/components/projects/FileSection.tsx', content, 'utf8');
console.log('Patched FileSection properly');
