const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

const lines = content.split('\n');
for (let i = 100; i < Math.min(150, lines.length); i++) {
    console.log(lines[i]);
}
