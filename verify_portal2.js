const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');
// Check around z-199 / portal
console.log(content.substring(15400, 16300));
