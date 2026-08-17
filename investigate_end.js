const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardViewSwitcher.tsx', 'utf8');
const lines = content.split('\n');
console.log(lines.slice(-20).join('\n'));
