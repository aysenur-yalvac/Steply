const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardBackground.tsx', 'utf8');
console.log(content.slice(0, 1500));
