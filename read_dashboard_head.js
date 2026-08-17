const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

const lines = content.split('\n');
// print imports and the first part of the component
for (let i = 0; i < Math.min(100, lines.length); i++) {
    console.log(lines[i]);
}
