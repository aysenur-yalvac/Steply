const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');
const lines = content.split('\n');

const propsIndex = lines.findIndex(l => l.includes('unreadCount'));
if (propsIndex !== -1) {
    for (let i = Math.max(0, propsIndex - 5); i < Math.min(propsIndex + 15, lines.length); i++) {
        console.log(lines[i]);
    }
}
