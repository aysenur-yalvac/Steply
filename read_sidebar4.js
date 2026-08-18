const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

const start = content.indexOf('export default function DashboardSidebar');
if (start !== -1) {
    console.log(content.substring(start, start + 1500));
}
