const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/layout.tsx', 'utf8');

const start = content.indexOf('<DashboardSidebar');
if (start !== -1) {
    console.log(content.substring(start, start + 300));
}
