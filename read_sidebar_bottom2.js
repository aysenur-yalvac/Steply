const fs = require('fs');
const content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');
const lines = content.split('\n');
const idx = lines.findIndex(l => l.includes('switchTarget'));
console.log(lines.slice(idx, idx + 50).join('\n'));
