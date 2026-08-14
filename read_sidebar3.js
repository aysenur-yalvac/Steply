const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');
// Print beginning to understand imports and state
console.log(content.substring(0, 2000));
