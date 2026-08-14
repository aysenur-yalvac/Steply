const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');
// We have 4 createPortal but only 1 document.body! Let us find all createPortal calls
let idx = 0;
while ((idx = content.indexOf('createPortal', idx)) !== -1) {
  console.log('\n---createPortal at', idx, '---');
  // Find the last 100 chars before and next 300 chars
  console.log(content.substring(idx, idx + 200));
  idx++;
}
