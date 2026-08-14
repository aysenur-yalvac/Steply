const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/trash/layout.tsx', 'utf8');

content = content.replace('max-h-screen', 'min-h-screen');

fs.writeFileSync('src/app/dashboard/trash/layout.tsx', content, 'utf8');
console.log('Fixed min-h-screen');
