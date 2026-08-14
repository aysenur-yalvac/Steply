const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/trash/projects/TrashProjectsClient.tsx', 'utf8');

content = content.replace(
  'const [projects, setProjects] = useState(projects);',
  'const [projects, setProjects] = useState(initialProjects);'
);

fs.writeFileSync('src/app/dashboard/trash/projects/TrashProjectsClient.tsx', content, 'utf8');
console.log('Fixed useState in projects client');
