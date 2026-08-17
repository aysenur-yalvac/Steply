const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardViewSwitcher.tsx', 'utf8');

const lines = content.split('\n');
const propIndex = lines.findIndex(l => l.includes('type Props'));
if (propIndex !== -1) {
    for (let i = propIndex; i < Math.min(propIndex + 20, lines.length); i++) {
        console.log(lines[i]);
    }
} else {
    console.log("type Props not found");
}
