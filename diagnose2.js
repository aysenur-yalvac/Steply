const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');
// Check the DashboardSidebar outer wrapper divs
const defaultFnIdx = content.indexOf('export default function DashboardSidebar');
console.log(content.substring(defaultFnIdx, defaultFnIdx + 3000));
