const fs = require('fs');
let path = 'src/app/dashboard/actions.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /export async function joinProjectWithCodeAction[\s\S]*?^  \}\n\}\n/m,
  ''
);

fs.writeFileSync(path, content, 'utf8');
console.log('Cleaned actions');
