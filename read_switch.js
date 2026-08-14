const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');
// Find switchTarget confirmation card
const switchTargetIdx = content.indexOf('switchTarget &&');
if (switchTargetIdx >= 0) {
  console.log('--- switchTarget card region ---');
  console.log(content.substring(switchTargetIdx - 50, switchTargetIdx + 2000));
}
