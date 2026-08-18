const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

const start = content.indexOf('NAV_ITEMS.map');
if (start !== -1) {
    const end = content.indexOf('</nav>', start);
    console.log(content.substring(start, end));
}
