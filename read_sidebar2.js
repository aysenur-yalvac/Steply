const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');
const navItemIndex = content.indexOf('const NavContent');
console.log(content.slice(navItemIndex, navItemIndex + 2000));
