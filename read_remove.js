const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');
// Check the removeTarget card
const removeIdx = content.indexOf('removeTarget &&');
console.log(content.substring(removeIdx - 50, removeIdx + 1500));
