const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');
content = content.replace(/Heart,\s*,\s*Trash2,/, 'Heart,\n  Trash2,');
fs.writeFileSync('src/components/dashboard/DashboardSidebar.tsx', content, 'utf8');
console.log('Fixed syntax error');
