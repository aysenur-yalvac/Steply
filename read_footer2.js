const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');
// Find the footer div with relative border-t
const footerDivIdx = content.indexOf("relative border-t border-slate-100");
console.log(content.substring(footerDivIdx - 100, footerDivIdx + 5000));
