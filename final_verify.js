const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');
const bodyCount = (content.match(/document\.body/g) || []).length;
const portalCount = (content.match(/createPortal/g) || []).length;
console.log('createPortal:', portalCount, ' document.body:', bodyCount);
