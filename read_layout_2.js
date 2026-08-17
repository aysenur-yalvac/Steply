const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/layout.tsx', 'utf8');

const lines = content.split('\n');
for (let i = 50; i < Math.min(100, lines.length); i++) {
    console.log(lines[i]);
}
