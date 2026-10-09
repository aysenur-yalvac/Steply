const fs = require('fs');
const path = require('path');
const file = path.resolve('src/components/dashboard/DashboardSidebar.tsx');

let content = fs.readFileSync(file, 'utf8');

content = content.replace(/Snflarm/g, 'Sınıflarım');

fs.writeFileSync(file, content, 'utf8');
