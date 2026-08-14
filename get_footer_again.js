const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

const footerIdx = content.indexOf('{/* User footer */}');
const collapsedSectionStart = content.indexOf('<div className={`relative border-t', footerIdx);
let snippet = content.substring(collapsedSectionStart, collapsedSectionStart + 2500);
console.log(snippet);
