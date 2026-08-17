const fs = require('fs');
const switcher = fs.readFileSync('src/components/dashboard/DashboardViewSwitcher.tsx', 'utf8');

const lines = switcher.split('\n');
const keyIndex = lines.findIndex(l => l.includes('key={viewMode}'));
for (let i = Math.max(0, keyIndex - 5); i < Math.min(keyIndex + 40, lines.length); i++) {
    console.log(lines[i]);
}
