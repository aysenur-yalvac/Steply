const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

// The missing </div> is right before </nav>
content = content.replace(/(\s*)<\/nav>/, '$1  </div>\n$1</nav>');

fs.writeFileSync('src/components/dashboard/DashboardSidebar.tsx', content, 'utf8');
console.log('Fixed missing div');
