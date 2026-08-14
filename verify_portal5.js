const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');
// Find the JSX usage of ChevronsUpDown (the expanded footer button)
const cuJsx = content.indexOf('<ChevronsUpDown');
console.log(content.substring(cuJsx - 600, cuJsx + 100));
