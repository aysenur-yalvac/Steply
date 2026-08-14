const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');
// Print the handleDirectSwitch continuation and the switch redirect logic
const switchIdx = content.indexOf('handleDirectSwitch');
console.log(content.substring(switchIdx + 500, switchIdx + 1500));
