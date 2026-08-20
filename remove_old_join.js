const fs = require('fs');
let path = 'src/app/dashboard/page.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/import JoinByCodeInput from '@\/components\/dashboard\/JoinByCodeInput';/, '');
content = content.replace(/<JoinByCodeInput \/>/g, '');

fs.writeFileSync(path, content, 'utf8');
console.log('Removed old inline JoinByCodeInput');
