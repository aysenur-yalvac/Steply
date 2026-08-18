const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');
console.log("isActive logic:", content.match(/isActive \? [^:]+ : [^,]+/g));
console.log("dark:bg-[#0f172a] count:", (content.match(/dark:bg-\[#0f172a\]/g) || []).length);
