const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

const regex = /const badgeCount = label === "Messages"[\s\S]*?: null;/g;
content = content.replace(regex, "");

fs.writeFileSync('src/components/dashboard/DashboardSidebar.tsx', content, 'utf8');
console.log("Removed badgeCount from DashboardSidebar.tsx");
