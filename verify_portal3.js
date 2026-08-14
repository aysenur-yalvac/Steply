const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');
// Check portal closing with document.body
const bodyIdx = content.indexOf('document.body');
console.log('document.body at:', bodyIdx);
if (bodyIdx >= 0) {
  console.log(content.substring(bodyIdx - 200, bodyIdx + 100));
}
// Also check the two trigger buttons have ref={triggerRef}
const triggerRefs = [];
let idx = 0;
while ((idx = content.indexOf('ref={triggerRef}', idx)) !== -1) {
  console.log('\n--- triggerRef at', idx, '---');
  console.log(content.substring(idx, idx + 200));
  triggerRefs.push(idx);
  idx++;
}
console.log('Total triggerRef occurrences:', triggerRefs.length);
