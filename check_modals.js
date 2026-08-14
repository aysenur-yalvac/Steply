const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');
// The regex didnt match. Let us find the old modals literally
const r1 = content.indexOf('Switch account confirmation modal');
const r2 = content.indexOf('Remove account confirmation modal');
console.log('switch modal at:', r1, '/ remove modal at:', r2);
// Show what is there now
console.log(content.substring(r1, r1 + 500));
console.log('----');
console.log(content.substring(r2, r2 + 500));
