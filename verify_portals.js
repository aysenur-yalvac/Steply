const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');
const count1 = (content.match(/createPortal/g) || []).length;
const bodyCount = (content.match(/document\.body/g) || []).length;
console.log('createPortal calls:', count1, 'document.body calls:', bodyCount);
// Verify all 3 portals present
console.log('switchTarget portal:', content.includes('switchTarget && mounted && createPortal'));
console.log('removeTarget portal:', content.includes('removeTarget && mounted && createPortal'));
console.log('isAccountMenuOpen portal:', content.includes('isAccountMenuOpen && mounted && createPortal'));
