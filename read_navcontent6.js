const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

const start = content.indexOf('if (subItems) {');
if (start !== -1) {
    const subset = content.substring(start, start + 3000);
    const splitIndex = subset.indexOf('return collapsed ? (');
    console.log(subset.substring(splitIndex + 1000, splitIndex + 2000));
}
