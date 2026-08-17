const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');
const lines = content.split('\n');

const compIndex = lines.findIndex(l => l.includes('export function DashboardSidebar'));
if (compIndex !== -1) {
    for (let i = Math.max(0, compIndex); i < Math.min(compIndex + 30, lines.length); i++) {
        console.log(lines[i]);
    }
}
