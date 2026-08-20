const fs = require('fs');
let path = 'src/components/dashboard/DashboardViewSwitcher.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/import JoinProjectModal from '\.\/JoinProjectModal';\r?\n/, '');

fs.writeFileSync(path, content, 'utf8');
console.log('Cleaned leftover import');
