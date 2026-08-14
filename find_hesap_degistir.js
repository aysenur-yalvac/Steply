const fs = require('fs');
const content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');
const lines = content.split('\n');
const startIndex = lines.findIndex(l => l.includes('Hesap Değiştir...'));
console.log(lines.slice(Math.max(0, startIndex - 20), startIndex + 50).join('\n'));
