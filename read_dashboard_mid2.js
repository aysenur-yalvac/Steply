const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

const lines = content.split('\n');
for (let i = 200; i < Math.min(300, lines.length); i++) {
    console.log(lines[i]);
}
