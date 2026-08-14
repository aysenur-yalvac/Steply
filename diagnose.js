const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');
// Both modals are already fixed/centered. The issue must be that they are inside NavContent
// which is rendered inside a sidebar with overflow:hidden or transform context.
// Let me check where these modals are in the DOM tree (before or after the footer div)

const navContentEndIdx = content.indexOf('export default function DashboardSidebar');
// Check what contains removeTarget and switchTarget
const rtIdx = content.indexOf('removeTarget &&');
const stIdx = content.indexOf('switchTarget &&');
console.log('NavContent ends (DashboardSidebar starts) at:', navContentEndIdx);
console.log('removeTarget at:', rtIdx);
console.log('switchTarget at:', stIdx);
console.log('\nBoth modals are inside NavContent which ends at:', navContentEndIdx);
console.log('modals are before export default? ', rtIdx < navContentEndIdx && stIdx < navContentEndIdx);
// Check the sidebar wrapping div for overflow:hidden
const overflowHidden = content.indexOf('overflow-hidden');
const overflowIdx2 = content.indexOf('overflow-hidden', overflowHidden+1);
console.log('\noverflow-hidden at:', overflowHidden, content.substring(overflowHidden-50, overflowHidden+100));
console.log('\nSecond overflow-hidden at:', overflowIdx2, content.substring(overflowIdx2-50, overflowIdx2+100));
