const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardViewSwitcher.tsx', 'utf8');

const lines = content.split('\n');
for (let i = 400; i < Math.min(420, lines.length); i++) {
    console.log(`${i+1}: ${lines[i]}`);
}
