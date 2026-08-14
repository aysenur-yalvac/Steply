const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');
const portalIdx = content.indexOf('createPortal');
const backdropIdx = content.indexOf('z-[199]');
const panelIdx = content.indexOf('z-[200]');
console.log('createPortal found at:', portalIdx);
console.log('backdrop z-199 found at:', backdropIdx);
console.log('panel z-200 found at:', panelIdx);
if (portalIdx >= 0) {
  console.log('\n--- Portal region ---');
  console.log(content.substring(portalIdx - 50, portalIdx + 500));
}
