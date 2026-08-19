const fs = require('fs');
let path = 'src/components/projects/ProjectAnalytics.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /\.sort\(\(a, b\) => b\.tasks - a\.tasks\);/g,
  `.sort((a: any, b: any) => b.tasks - a.tasks);`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed typescript error in ProjectAnalytics');
