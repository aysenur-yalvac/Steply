const fs = require('fs');
let path = 'src/components/dashboard/JoinProjectModal.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /z-\[100\]/g,
  `z-[999]`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Bumped z-index');
