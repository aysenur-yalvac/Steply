const fs = require('fs');
const content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('localUnreadCount')) {
    console.log("------- MATCH AT LINE " + i);
    for (let j = Math.max(0, i - 5); j <= Math.min(lines.length - 1, i + 5); j++) {
      console.log(j + ": " + lines[j]);
    }
  }
}
