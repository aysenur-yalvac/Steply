const fs = require('fs');
const switcher = fs.readFileSync('src/components/dashboard/DashboardViewSwitcher.tsx', 'utf8');

const lines = switcher.split('\n');
const listIndex = lines.findIndex(l => l.includes("viewMode === 'list'"));
if (listIndex !== -1) {
    for (let i = Math.max(0, listIndex - 10); i < Math.min(listIndex + 30, lines.length); i++) {
        console.log(lines[i]);
    }
} else {
    console.log("Could not find viewMode === 'list'");
    // Search for viewMode usage
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('viewMode')) {
            console.log(lines[i]);
        }
    }
}
