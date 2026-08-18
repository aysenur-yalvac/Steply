const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

const start = content.indexOf('function NavContent');
if (start !== -1) {
    const subset = content.substring(start, start + 8000);
    const lines = subset.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('item.label === "Messages"') || lines[i].includes('Messages')) {
            console.log("------- MATCH AT LINE " + i);
            for (let j = Math.max(0, i - 10); j <= Math.min(lines.length - 1, i + 10); j++) {
                console.log(j + ": " + lines[j]);
            }
        }
    }
}
