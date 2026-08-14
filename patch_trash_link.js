const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');
content = content.replace(
  'href: "/dashboard/trash",',
  'href: "/dashboard/trash/projects",'
);
fs.writeFileSync('src/components/dashboard/DashboardSidebar.tsx', content, 'utf8');
console.log('Updated Trash link');
