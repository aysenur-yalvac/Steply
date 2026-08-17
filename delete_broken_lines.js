const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardViewSwitcher.tsx', 'utf8');

const lines = content.split('\n');
const newLines = [];
for (let i = 0; i < lines.length; i++) {
    if (i === 412 || i === 413) {
        continue; // skip lines 413 and 414 (index 412 and 413)
    }
    newLines.push(lines[i]);
}

fs.writeFileSync('src/components/dashboard/DashboardViewSwitcher.tsx', newLines.join('\n'), 'utf8');
console.log("Deleted broken lines");
