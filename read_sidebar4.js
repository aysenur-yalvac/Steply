const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');
// Print NavContent component
const ncIdx = content.indexOf('function NavContent');
console.log(content.substring(ncIdx, ncIdx + 3000));
