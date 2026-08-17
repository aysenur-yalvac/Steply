const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

const lines = content.split('\n');
console.log(lines.slice(0, 30).join('\n'));
