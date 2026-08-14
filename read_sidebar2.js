const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');
// Print around Popover region
console.log(content.substring(14800, 16500));
