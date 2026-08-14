const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');
// Show relevant popover sections
const popoverIdx = content.indexOf('popover');
const popoverIdx2 = content.indexOf('Popover');
const stateIdx = content.indexOf('useState');
console.log('File length:', content.length);
console.log('popover at:', popoverIdx);
console.log('Popover at:', popoverIdx2);
console.log('useState at:', stateIdx);

// Print portion around the account switcher 
const accountIdx = content.indexOf('accountSwitch') >= 0 ? content.indexOf('accountSwitch') : content.indexOf('AccountSwitch');
console.log('AccountSwitch at:', accountIdx);
if (accountIdx >= 0) {
  console.log('\n--- Account Switch region ---');
  console.log(content.substring(Math.max(0, accountIdx - 200), accountIdx + 500));
}
