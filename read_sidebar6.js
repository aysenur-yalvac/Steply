const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');
// Look at the confirmSwitch redirect
const switchIdx2 = content.indexOf('confirmSwitch');
console.log(content.substring(switchIdx2 + 300, switchIdx2 + 1000));
