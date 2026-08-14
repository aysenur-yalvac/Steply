const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');
// Find the expanded trigger button (non-collapsed) which should also have ref
// Look for ChevronsUpDown usage
const cuIdx = content.indexOf('ChevronsUpDown');
console.log(content.substring(cuIdx - 300, cuIdx + 500));
