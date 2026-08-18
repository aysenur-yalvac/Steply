const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

const start = content.indexOf('function NavContent');
if (start !== -1) {
    const subset = content.substring(start, start + 8000);
    const splitIndex = subset.indexOf('if (isWatchlist) {');
    console.log(subset.substring(splitIndex - 1000, splitIndex + 3000));
}
