const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('unreadCount')) {
        console.log(`Line ${i+1}: ${lines[i]}`);
    }
}
