const fs = require('fs');
let path = 'src/app/dashboard/projects/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /\.select\('\*'\)/g,
  `.select('*, invite_code, invite_token')`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed project select query');
