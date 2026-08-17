const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/layout.tsx', 'utf8');
const lines = content.split('\n');

const compIndex = lines.findIndex(l => l.includes('unreadCount'));
if (compIndex !== -1) {
    for (let i = Math.max(0, compIndex - 10); i < Math.min(compIndex + 10, lines.length); i++) {
        console.log(lines[i]);
    }
}
