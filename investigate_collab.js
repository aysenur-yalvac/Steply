const fs = require('fs');

let content = fs.readFileSync('src/components/dashboard/DashboardViewSwitcher.tsx', 'utf8');

const lines = content.split('\n');
const collabIndex = lines.findIndex(l => l.includes('Collaborative Projects'));

if (collabIndex !== -1) {
    for (let i = Math.max(0, collabIndex - 20); i < Math.min(collabIndex + 40, lines.length); i++) {
        console.log(lines[i]);
    }
}
