const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');
// Find footer region to understand the full popover structure
const footerIdx = content.indexOf('/* footer */}');
console.log(content.substring(footerIdx, footerIdx + 4000));
