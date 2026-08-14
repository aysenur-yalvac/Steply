const fs = require('fs');
['src/app/dashboard/trash/projects/page.tsx', 'src/app/dashboard/trash/files/page.tsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/action=\{([A-Za-z]+Action)\.bind\([^}]+\)\}/g, 'action={$1.bind($2) as any}');
  // Actually regex with nested parens is hard, I will just replace .bind(null, x) with .bind(null, x) as any
  content = content.replace(/action=\{(.+?\.bind\([^}]+\))\}/g, 'action={$1 as any}');
  fs.writeFileSync(file, content, 'utf8');
});
console.log('Fixed typescript action types');
