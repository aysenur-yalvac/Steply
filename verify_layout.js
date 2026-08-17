const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/layout.tsx', 'utf8');

const lines = content.split('\n');
const countIndex = lines.findIndex(l => l.includes('unreadCount ='));
if (countIndex !== -1) {
    for (let i = Math.max(0, countIndex - 5); i < Math.min(countIndex + 10, lines.length); i++) {
        console.log(lines[i]);
    }
}
