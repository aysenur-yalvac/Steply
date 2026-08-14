const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');
// The switchTarget card is already a fixed inset-0 modal! So the problem is NOT this card.
// Let me check if there is also a switchTarget card inside the sidebar (not the portal)
// Count occurrences
let count = 0;
let idx = 0;
while ((idx = content.indexOf('switchTarget', idx)) !== -1) {
  console.log('switchTarget at:', idx, '=> ', content.substring(idx, idx+80));
  count++;
  idx++;
}
console.log('\nTotal:', count);
