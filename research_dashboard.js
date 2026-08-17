const fs = require('fs');
console.log("=== DashboardViewSwitcher.tsx ===");
const switcher = fs.readFileSync('src/components/dashboard/DashboardViewSwitcher.tsx', 'utf8');
const switcherLines = switcher.split('\n');
for (let i = 0; i < Math.min(30, switcherLines.length); i++) {
    console.log(switcherLines[i]);
}

console.log("\n=== page.tsx (Collaborative Projects section) ===");
const page = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');
const pageLines = page.split('\n');
const collabStart = pageLines.findIndex(l => l.includes('Collaborative Projects'));
if (collabStart !== -1) {
    for (let i = Math.max(0, collabStart - 10); i < Math.min(collabStart + 30, pageLines.length); i++) {
        console.log(pageLines[i]);
    }
}
