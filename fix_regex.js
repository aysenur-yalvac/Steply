const fs = require('fs');
let content = fs.readFileSync('src/lib/actions.ts', 'utf8');

content = content.replace(
  `const match = repoUrl.match(/github.com/([^/]+)/([^/]+)/);`,
  `const match = repoUrl.match(/github\\.com\\/([^\\/]+)\\/([^\\/]+)/);`
);

fs.writeFileSync('src/lib/actions.ts', content, 'utf8');
console.log("Fixed regex in actions.ts");
