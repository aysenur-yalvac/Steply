const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

// Strategy: Find both modal blocks exactly and replace them in one shot
// Find remove modal block
const rmStart = content.indexOf('{/* Remove account confirmation modal');
const swStart = content.indexOf('{/* Switch account confirmation modal');
const navEnd = content.indexOf('{/* ============================================================\n            FOOTER CONTENT');

// Extract and show the remove modal block boundaries
const rmBlock = content.substring(rmStart, swStart);
const swBlock = content.substring(swStart, navEnd);

console.log('removeModal block length:', rmBlock.length);
console.log('switchModal block length:', swBlock.length);
console.log('Remove end:', rmBlock.substring(rmBlock.length - 60));
console.log('Switch end:', swBlock.substring(swBlock.length - 60));
