const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

content = content.replace(/const isMessages = href === '\/dashboard\/messages' \|\| label\.toLowerCase\(\)\.includes\('message'\);\s*const isMessages = href === '\/dashboard\/messages' \|\| label\.toLowerCase\(\)\.includes\('message'\);/g, `const isMessages = href === '/dashboard/messages' || label.toLowerCase().includes('message');`);

fs.writeFileSync('src/components/dashboard/DashboardSidebar.tsx', content, 'utf8');
console.log("Removed duplicate isMessages definition");
