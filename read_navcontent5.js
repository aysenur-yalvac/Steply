const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

const start = content.indexOf('NAV_ITEMS.map');
if (start !== -1) {
    const subset = content.substring(start, start + 4000);
    const splitIndex = subset.indexOf('if (isWatchlist) {');
    console.log(subset.substring(splitIndex, splitIndex + 3000));
}
