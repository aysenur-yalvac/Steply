const fs = require('fs');
['src/app/dashboard/trash/projects/page.tsx', 'src/app/dashboard/trash/files/page.tsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/action=\{restoreProjectAction\.bind\(\$2\) as any\}/g, 'action={restoreProjectAction.bind(null, project.id) as any}');
  content = content.replace(/action=\{permanentDeleteProjectAction\.bind\(\$2\) as any\}/g, 'action={permanentDeleteProjectAction.bind(null, project.id) as any}');
  content = content.replace(/action=\{restoreFileAction\.bind\(\$2\) as any\}/g, 'action={restoreFileAction.bind(null, file.projectId, file.url) as any}');
  content = content.replace(/action=\{permanentDeleteFileAction\.bind\(\$2\) as any\}/g, 'action={permanentDeleteFileAction.bind(null, file.projectId, file.url) as any}');
  fs.writeFileSync(file, content, 'utf8');
});
console.log('Fixed regex error');
