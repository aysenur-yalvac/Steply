const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('isMessages')) {
        for (let j = Math.max(0, i - 15); j <= Math.min(lines.length - 1, i + 35); j++) {
            console.log(j + ": " + lines[j]);
        }
        break;
    }
}
