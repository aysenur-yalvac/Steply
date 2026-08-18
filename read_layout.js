const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/layout.tsx', 'utf8');

const lines = content.split('\n');
console.log(lines.slice(0, 50).join('\n'));
