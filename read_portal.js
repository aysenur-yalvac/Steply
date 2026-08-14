const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');
// The switchTarget modal is already fixed/centered at z-[9999]. 
// The user says the account LIST popover (not the confirmation card) has the overflow issue.
// Let me read the current popover (portal) code to see if there's an issue:
const portalIdx = content.indexOf('createPortal(');
console.log(content.substring(portalIdx - 50, portalIdx + 2500));
