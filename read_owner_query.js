const fs = require('fs');

let content = fs.readFileSync('src/app/dashboard/projects/[id]/page.tsx', 'utf8');

const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('let ownerName')) {
        console.log(lines.slice(i, i+15).join('\n'));
        break;
    }
}
