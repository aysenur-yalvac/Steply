const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');
// Count document.body
const bodyOccurrences = (content.match(/document\.body/g) || []).length;
const portalOccurrences = (content.match(/createPortal/g) || []).length;
console.log('createPortal occurrences:', portalOccurrences);
console.log('document.body occurrences:', bodyOccurrences);
// Show each document.body context
let idx = 0;
while ((idx = content.indexOf('document.body', idx)) !== -1) {
  console.log('\n---document.body at', idx, '---');
  console.log(content.substring(idx - 150, idx + 50));
  idx++;
}
