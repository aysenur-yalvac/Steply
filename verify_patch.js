const fs = require('fs');
const content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');
const lines = content.split('\n');
const idx = lines.findIndex(l => l.includes('Hesap Değiştir'));
console.log(lines.slice(idx - 10, idx + 30).join('\n'));
