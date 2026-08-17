const fs = require('fs');
const switcher = fs.readFileSync('src/components/dashboard/DashboardViewSwitcher.tsx', 'utf8');

const lines = switcher.split('\n');
const listIndex = lines.findIndex(l => l.includes('export default function DashboardViewSwitcher'));
if (listIndex !== -1) {
    for (let i = listIndex; i < Math.min(listIndex + 15, lines.length); i++) {
        console.log(lines[i]);
    }
}
