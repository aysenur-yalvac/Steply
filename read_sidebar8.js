const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');
// Print the full footer section
const footerIdx = content.indexOf("footer */}\n      <div");
console.log(content.substring(footerIdx, footerIdx + 3000));
