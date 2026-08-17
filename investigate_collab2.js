const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardViewSwitcher.tsx', 'utf8');
const lines = content.split('\n');
console.log("Total lines:", lines.length);
console.log("Includes Collaborative Projects:", content.includes('Collaborative Projects'));
