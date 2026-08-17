const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

const lines = content.split('\n');
const countIndex = lines.findIndex(l => l.includes('unreadCount'));
for (let i = 50; i < Math.min(100, lines.length); i++) {
    console.log(lines[i]);
}
